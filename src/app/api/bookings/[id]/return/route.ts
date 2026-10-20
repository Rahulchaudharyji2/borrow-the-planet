import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ReturnSubmissionSchema } from "@/lib/validations";

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
    const parsed = ReturnSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { returnRecord: true },
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
      comparisonNotes,
      checklist,
      photoUrls,
      depositReleaseApproved,
      hasDisagreement,
      disagreementNote,
    } = parsed.data;

    let returnRec = booking.returnRecord;
    const now = new Date();

    if (!returnRec) {
      returnRec = await prisma.returnRecord.create({
        data: {
          bookingId: id,
          lenderConfirmed: isLender ? conditionConfirmed : false,
          borrowerConfirmed: isBorrower ? conditionConfirmed : false,
          lenderSignedAt: isLender ? now : null,
          borrowerSignedAt: isBorrower ? now : null,
          conditionComparisonNotes: comparisonNotes || "",
          checklistAnswers: JSON.stringify(checklist),
          returnPhotoUrls: JSON.stringify(photoUrls),
          depositReleaseApproved: isLender ? depositReleaseApproved : false,
          disagreementFlag: hasDisagreement,
          disagreementNote: disagreementNote || null,
        },
      });
    } else {
      returnRec = await prisma.returnRecord.update({
        where: { bookingId: id },
        data: {
          lenderConfirmed: isLender ? conditionConfirmed : returnRec.lenderConfirmed,
          borrowerConfirmed: isBorrower ? conditionConfirmed : returnRec.borrowerConfirmed,
          lenderSignedAt: isLender ? now : returnRec.lenderSignedAt,
          borrowerSignedAt: isBorrower ? now : returnRec.borrowerSignedAt,
          conditionComparisonNotes: comparisonNotes
            ? `${returnRec.conditionComparisonNotes || ""}\n[${session.name}]: ${comparisonNotes}`.trim()
            : returnRec.conditionComparisonNotes,
          checklistAnswers: JSON.stringify({
            ...JSON.parse(returnRec.checklistAnswers || "{}"),
            ...checklist,
          }),
          returnPhotoUrls: JSON.stringify([
            ...new Set([
              ...JSON.parse(returnRec.returnPhotoUrls || "[]"),
              ...photoUrls,
            ]),
          ]),
          depositReleaseApproved: isLender
            ? depositReleaseApproved
            : returnRec.depositReleaseApproved,
          disagreementFlag: hasDisagreement || returnRec.disagreementFlag,
          disagreementNote: disagreementNote || returnRec.disagreementNote,
        },
      });
    }

    let updatedBooking = booking;

    // When lender confirms return and approves deposit release without disagreement:
    if (isLender && conditionConfirmed && depositReleaseApproved && !hasDisagreement) {
      const releaseTx = `demo_release_tx_${Date.now()}`;
      updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: "COMPLETED",
          releaseTxSignature: releaseTx,
          events: {
            create: {
              fromStatus: booking.status,
              toStatus: "COMPLETED",
              note: `Lender verified item return in good order. Escrow settled: payout released, deposit refunded. Tx: ${releaseTx}`,
              actorId: session.userId,
            },
          },
        },
        include: { returnRecord: true },
      });
    } else {
      await prisma.bookingStateEvent.create({
        data: {
          bookingId: id,
          fromStatus: booking.status,
          toStatus: booking.status,
          note: `Return checklist acknowledged by ${session.name} (${isLender ? "Lender" : "Borrower"})`,
          actorId: session.userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      returnRecord: returnRec,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Return error:", error);
    return NextResponse.json(
      { error: "Failed to process return" },
      { status: 500 }
    );
  }
}
