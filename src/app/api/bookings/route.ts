import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { BookingRequestSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [borrowed, lent] = await Promise.all([
      prisma.booking.findMany({
        where: { borrowerId: session.userId },
        include: {
          listing: {
            include: { photos: { take: 1 } },
          },
          lender: {
            select: { id: true, name: true, avatar: true, campus: true },
          },
          handoverRecord: true,
          returnRecord: true,
          disputes: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.findMany({
        where: { lenderId: session.userId },
        include: {
          listing: {
            include: { photos: { take: 1 } },
          },
          borrower: {
            select: { id: true, name: true, avatar: true, campus: true },
          },
          handoverRecord: true,
          returnRecord: true,
          disputes: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ borrowed, lent });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
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
    const parsed = BookingRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { listingId, startDate: startStr, endDate: endStr, paymentMode } = parsed.data;
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be strictly after start date" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing || listing.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Listing is not available for booking" },
        { status: 404 }
      );
    }

    if (listing.lenderId === session.userId) {
      return NextResponse.json(
        { error: "You cannot book your own item" },
        { status: 400 }
      );
    }

    // Server-side overlap prevention across active states
    const overlapping = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ["PENDING", "APPROVED", "ESCROW_FUNDED", "HANDED_OVER", "RETURN_PENDING"] },
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: "Selected dates overlap with an existing confirmed booking" },
        { status: 409 }
      );
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    const durationDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    if (durationDays < listing.minDays) {
      return NextResponse.json(
        { error: `Minimum rental period for this item is ${listing.minDays} day(s)` },
        { status: 400 }
      );
    }

    if (durationDays > listing.maxDays) {
      return NextResponse.json(
        { error: `Maximum rental period for this item is ${listing.maxDays} days` },
        { status: 400 }
      );
    }

    // Precise integer financial calculations
    const rentalSubtotalCents = listing.dailyRateCents * durationDays;
    const platformFeeCents = Math.round(rentalSubtotalCents * 0.05); // 5% fee
    const depositCents = listing.depositCents;
    const totalDueCents = rentalSubtotalCents + depositCents + platformFeeCents;

    const rentalSubtotalLamports = listing.dailyRateLamports * durationDays;
    const platformFeeLamports = Math.round(rentalSubtotalLamports * 0.05);
    const depositLamports = listing.depositLamports;
    const totalDueLamports = rentalSubtotalLamports + depositLamports + platformFeeLamports;

    const booking = await prisma.booking.create({
      data: {
        listingId,
        borrowerId: session.userId,
        lenderId: listing.lenderId,
        startDate,
        endDate,
        durationDays,
        rentalSubtotalCents,
        depositCents,
        platformFeeCents,
        totalDueCents,
        rentalSubtotalLamports,
        depositLamports,
        platformFeeLamports,
        totalDueLamports,
        paymentMode,
        status: "PENDING",
        events: {
          create: {
            fromStatus: "NONE",
            toStatus: "PENDING",
            note: "Booking requested by borrower with explicit terms acceptance",
            actorId: session.userId,
          },
        },
      },
      include: {
        listing: true,
      },
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
