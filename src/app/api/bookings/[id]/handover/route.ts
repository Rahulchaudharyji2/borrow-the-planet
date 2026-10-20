import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { HandoverSubmissionSchema } from "@/lib/validations";

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
    const body = await req.json();
    const parsed = HandoverSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { handoverRecord: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isBorrower = booking.borrowerId === session.userId;
    const isLender = booking.lenderId === session.userId;

    if (!isBorrower && !isLender) {
      return NextResponse.json({ error: "Forbidden: Not a participant" }, { status: 403 });
    }

    const {
      conditionConfirmed,
      conditionNotes,
      checklist,
      photoUrls,
      hasDisagreement,
      disagreementNote,
    } = parsed.data;

    let handover = booking.handoverRecord;
    const now = new Date();

    if (!handover) {
      handover = await prisma.handoverRecord.create({
        data: {
          bookingId: id,
          lenderConfirmed: isLender ? conditionConfirmed : false,
          borrowerConfirmed: isBorrower ? conditionConfirmed : false,
          lenderSignedAt: isLender ? now : null,
          borrowerSignedAt: isBorrower ? now : null,
          conditionNotes: conditionNotes || "",
          checklistAnswers: JSON.stringify(checklist),
          photoUrls: JSON.stringify(photoUrls),
          disagreementFlag: hasDisagreement,
          disagreementNote: disagreementNote || null,
        },
      });
    } else {
      handover = await prisma.handoverRecord.update({
        where: { bookingId: id },
        data: {
          lenderConfirmed: isLender ? conditionConfirmed : handover.lenderConfirmed,
          borrowerConfirmed: isBorrower ? conditionConfirmed : handover.borrowerConfirmed,
          lenderSignedAt: isLender ? now : handover.lenderSignedAt,
          borrowerSignedAt: isBorrower ? now : handover.borrowerSignedAt,
          conditionNotes: conditionNotes
            ? `${handover.conditionNotes || ""}\n[${session.name}]: ${conditionNotes}`.trim()
            : handover.conditionNotes,
          checklistAnswers: JSON.stringify({
            ...JSON.parse(handover.checklistAnswers || "{}"),
            ...checklist,
          }),
          photoUrls: JSON.stringify([
            ...new Set([
              ...JSON.parse(handover.photoUrls || "[]"),
              ...photoUrls,
            ]),
          ]),
          disagreementFlag: hasDisagreement || handover.disagreementFlag,
          disagreementNote: disagreementNote || handover.disagreementNote,
        },
      });
    }

    // If both parties confirmed and there is no disagreement, advance status to HANDED_OVER
    const bothConfirmed = handover.lenderConfirmed && handover.borrowerConfirmed;
    let newBookingStatus = booking.status;

    if (bothConfirmed && !handover.disagreementFlag && booking.status === "ESCROW_FUNDED") {
      newBookingStatus = "HANDED_OVER";
      await prisma.booking.update({
        where: { id },
        data: {
          status: "HANDED_OVER",
          events: {
            create: {
              fromStatus: "ESCROW_FUNDED",
              toStatus: "HANDED_OVER",
              note: `Dual handover confirmed by lender and borrower. Item custody transferred.`,
              actorId: session.userId,
            },
          },
        },
      });
    } else {
      await prisma.bookingStateEvent.create({
        data: {
          bookingId: id,
          fromStatus: booking.status,
          toStatus: booking.status,
          note: `Handover evidence acknowledged by ${session.name} (${isLender ? "Lender" : "Borrower"})`,
          actorId: session.userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      handover,
      bookingStatus: newBookingStatus,
      bothConfirmed,
    });
  } catch (error) {
    console.error("Handover error:", error);
    return NextResponse.json(
      { error: "Failed to process handover" },
      { status: 500 }
    );
  }
}
