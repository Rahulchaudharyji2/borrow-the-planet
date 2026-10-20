import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DisputeSubmissionSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isReviewer = session.role === "REVIEWER" || session.role === "ADMIN";

    const disputes = await prisma.dispute.findMany({
      where: isReviewer
        ? {}
        : {
            OR: [
              { reporterId: session.userId },
              { respondentId: session.userId },
            ],
          },
      include: {
        booking: {
          include: { listing: { select: { title: true } } },
        },
        reporter: { select: { id: true, name: true, avatar: true } },
        respondent: { select: { id: true, name: true, avatar: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ disputes });
  } catch (error) {
    console.error("Get disputes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = DisputeSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { bookingId, category, description, evidenceUrls } = parsed.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isBorrower = booking.borrowerId === session.userId;
    const isLender = booking.lenderId === session.userId;

    if (!isBorrower && !isLender) {
      return NextResponse.json(
        { error: "Forbidden: Only participants can report an incident" },
        { status: 403 }
      );
    }

    const respondentId = isBorrower ? booking.lenderId : booking.borrowerId;

    const dispute = await prisma.dispute.create({
      data: {
        bookingId,
        reporterId: session.userId,
        respondentId,
        category,
        description,
        evidenceUrls: JSON.stringify(evidenceUrls),
        status: "REPORTED",
        messages: {
          create: {
            senderId: session.userId,
            message: description,
            attachmentUrls: JSON.stringify(evidenceUrls),
          },
        },
      },
    });

    // Update booking status to DISPUTED to prevent unilateral settlement
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "DISPUTED",
        events: {
          create: {
            fromStatus: booking.status,
            toStatus: "DISPUTED",
            note: `Incident reported (${category}) by ${session.name}. Escrow held pending fair review.`,
            actorId: session.userId,
          },
        },
      },
    });

    return NextResponse.json({ success: true, dispute }, { status: 201 });
  } catch (error) {
    console.error("Create dispute error:", error);
    return NextResponse.json(
      { error: "Failed to open dispute" },
      { status: 500 }
    );
  }
}
