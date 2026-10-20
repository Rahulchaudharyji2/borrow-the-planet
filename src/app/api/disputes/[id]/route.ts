import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DisputeResolutionSchema } from "@/lib/validations";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            listing: { select: { id: true, title: true, depositCents: true, depositLamports: true } },
            handoverRecord: true,
            returnRecord: true,
          },
        },
        reporter: { select: { id: true, name: true, avatar: true, email: true } },
        respondent: { select: { id: true, name: true, avatar: true, email: true } },
        reviewer: { select: { id: true, name: true, role: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true, role: true, avatar: true } },
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const isParticipant =
      dispute.reporterId === session.userId || dispute.respondentId === session.userId;
    const isReviewer = session.role === "REVIEWER" || session.role === "ADMIN";

    if (!isParticipant && !isReviewer) {
      return NextResponse.json(
        { error: "Forbidden: Not authorized to view this dispute" },
        { status: 403 }
      );
    }

    return NextResponse.json({ dispute });
  } catch (error) {
    console.error("Get dispute error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dispute details" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { message, attachmentUrls } = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const dispute = await prisma.dispute.findUnique({ where: { id } });
    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const isParticipant =
      dispute.reporterId === session.userId || dispute.respondentId === session.userId;
    const isReviewer = session.role === "REVIEWER" || session.role === "ADMIN";

    if (!isParticipant && !isReviewer) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const newMessage = await prisma.disputeMessage.create({
      data: {
        disputeId: id,
        senderId: session.userId,
        message: message.trim(),
        attachmentUrls: JSON.stringify(attachmentUrls || []),
        isReviewerNote: isReviewer,
      },
      include: {
        sender: { select: { id: true, name: true, role: true, avatar: true } },
      },
    });

    // If respondent replies and dispute was REPORTED, transition to AWAITING_RESPONSE or UNDER_REVIEW
    if (session.userId === dispute.respondentId && dispute.status === "REPORTED") {
      await prisma.dispute.update({
        where: { id },
        data: { status: "UNDER_REVIEW" },
      });
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Post dispute message error:", error);
    return NextResponse.json(
      { error: "Failed to post message" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role-based protection: only REVIEWER or ADMIN may resolve or modify dispute outcomes
    if (session.role !== "REVIEWER" && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Authorized dispute reviewer access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = DisputeResolutionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status, resolutionNotes, depositDeductionCents, depositDeductionLamports } =
      parsed.data;

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const updated = await prisma.dispute.update({
      where: { id },
      data: {
        status,
        resolutionNotes,
        depositDeductionCents: depositDeductionCents ?? null,
        depositDeductionLamports: depositDeductionLamports ?? null,
        reviewerId: session.userId,
      },
    });

    // Add official resolution note in message stream
    await prisma.disputeMessage.create({
      data: {
        disputeId: id,
        senderId: session.userId,
        message: `Official Resolution: [${status}] — ${resolutionNotes}`,
        isReviewerNote: true,
      },
    });

    // If resolved, finalize booking state
    if (status === "RESOLVED" || status === "SUBSTANTIATED" || status === "NOT_SUBSTANTIATED") {
      await prisma.booking.update({
        where: { id: dispute.bookingId },
        data: {
          status: "COMPLETED",
          events: {
            create: {
              fromStatus: "DISPUTED",
              toStatus: "COMPLETED",
              note: `Dispute resolved by authorized reviewer (${session.name}). Status: ${status}. Deduction: ${depositDeductionCents ? `$${depositDeductionCents / 100}` : "None"}.`,
              actorId: session.userId,
            },
          },
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: `DISPUTE_RESOLUTION_${status}`,
        entityType: "Dispute",
        entityId: id,
        metadata: JSON.stringify({
          status,
          resolutionNotes,
          depositDeductionCents,
        }),
      },
    });

    return NextResponse.json({ success: true, dispute: updated });
  } catch (error) {
    console.error("Resolve dispute error:", error);
    return NextResponse.json(
      { error: "Failed to resolve dispute" },
      { status: 500 }
    );
  }
}
