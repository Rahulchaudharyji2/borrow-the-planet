import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ListingFormSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const campus = searchParams.get("campus")?.trim() || "";
    const sort = searchParams.get("sort") || "newest";
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;

    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (minPrice !== null || maxPrice !== null) {
      where.dailyRateCents = {};
      if (minPrice !== null) {
        (where.dailyRateCents as Record<string, number>).gte = minPrice * 100;
      }
      if (maxPrice !== null) {
        (where.dailyRateCents as Record<string, number>).lte = maxPrice * 100;
      }
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "price-asc") {
      orderBy = { dailyRateCents: "asc" };
    } else if (sort === "price-desc") {
      orderBy = { dailyRateCents: "desc" };
    } else if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    }

    const items = await prisma.listing.findMany({
      where,
      orderBy,
      include: {
        photos: {
          orderBy: { sortOrder: "asc" },
        },
        lender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            campus: true,
            credentials: {
              where: { status: "ACTIVE" },
              select: {
                rentalsCompleted: true,
                onTimeReturnRatePercent: true,
                disputeFreeRatePercent: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    // Optional campus filter applied on lender campus
    const filteredItems = campus
      ? items.filter((item) =>
          item.lender.campus.toLowerCase().includes(campus.toLowerCase())
        )
      : items;

    return NextResponse.json({ items: filteredItems });
  } catch (error) {
    console.error("Fetch listings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
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
    const parsed = ListingFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        condition: data.condition,
        dailyRateCents: data.dailyRateCents,
        dailyRateLamports: data.dailyRateLamports,
        depositCents: data.depositCents,
        depositLamports: data.depositLamports,
        currency: data.currency,
        minDays: data.minDays,
        maxDays: data.maxDays,
        pickupArea: data.pickupArea,
        rules: data.rules,
        accessories: data.accessories,
        status: "PUBLISHED",
        lenderId: session.userId,
        photos: {
          create: data.photoUrls.map((url, idx) => ({
            url,
            sortOrder: idx,
          })),
        },
      },
      include: {
        photos: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "LISTING_CREATED",
        entityType: "Listing",
        entityId: listing.id,
        metadata: JSON.stringify({ title: listing.title, rate: listing.dailyRateCents }),
      },
    });

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
