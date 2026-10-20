import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

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

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            photos: true,
            lender: {
              select: { id: true, name: true, avatar: true, campus: true },
            },
          },
        },
        borrower: {
          select: { id: true, name: true, avatar: true, campus: true, solanaWalletAddress: true },
        },
        lender: {
          select: { id: true, name: true, avatar: true, campus: true, solanaWalletAddress: true },
        },
        handoverRecord: true,
        returnRecord: true,
        disputes: {
          include: {
            reporter: { select: { id: true, name: true } },
            respondent: { select: { id: true, name: true } },
            messages: {
              orderBy: { createdAt: "asc" },
              include: { sender: { select: { id: true, name: true, role: true } } },
            },
          },
        },
        events: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Access control: only borrower, lender, or reviewer/admin can inspect private booking evidence
    const isParticipant =
      booking.borrowerId === session.userId || booking.lenderId === session.userId;
    const isReviewer = session.role === "REVIEWER" || session.role === "ADMIN";

    if (!isParticipant && !isReviewer) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to view this booking's evidence" },
        { status: 403 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Get booking details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking details" },
      { status: 500 }
    );
  }
}
