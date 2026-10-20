import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await prisma.listing.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { sortOrder: "asc" },
        },
        lender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            campus: true,
            createdAt: true,
            credentials: {
              where: { status: "ACTIVE" },
              select: {
                id: true,
                rentalsCompleted: true,
                onTimeReturnRatePercent: true,
                disputeFreeRatePercent: true,
                itemsShared: true,
                status: true,
              },
              take: 1,
            },
          },
        },
        bookings: {
          where: {
            status: { in: ["PENDING", "APPROVED", "ESCROW_FUNDED", "HANDED_OVER", "RETURN_PENDING"] },
          },
          select: {
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Get item error:", error);
    return NextResponse.json({ error: "Failed to load item" }, { status: 500 });
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

    const { id } = await params;

    // Server-side ownership verification
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existing.lenderId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You do not own this listing" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        dailyRateCents: body.dailyRateCents !== undefined ? body.dailyRateCents : undefined,
        depositCents: body.depositCents !== undefined ? body.depositCents : undefined,
        status: body.status !== undefined ? body.status : undefined,
        rules: body.rules !== undefined ? body.rules : undefined,
        accessories: body.accessories !== undefined ? body.accessories : undefined,
        pickupArea: body.pickupArea !== undefined ? body.pickupArea : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "LISTING_UPDATED",
        entityType: "Listing",
        entityId: id,
        metadata: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existing.lenderId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You do not own this listing" },
        { status: 403 }
      );
    }

    await prisma.listing.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({ success: true, archived: true });
  } catch (error) {
    console.error("Delete listing error:", error);
    return NextResponse.json({ error: "Failed to archive item" }, { status: 500 });
  }
}
