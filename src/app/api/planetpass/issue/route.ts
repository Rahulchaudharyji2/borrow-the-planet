import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { signPlanetPassClaims, PlanetPassClaims } from "@/lib/planetpass-crypto";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Issuer configuration from environment
    const issuerId =
      process.env.PLANETPASS_ISSUER_ID || "did:planetpass:campus-collective-authority-01";
    const issuerName =
      process.env.PLANETPASS_ISSUER_NAME || "Campus Trust Network & Beast Coder Federation";
    const issuerSecret =
      process.env.PLANETPASS_ISSUER_SECRET ||
      "4d82f7c0068c8b4c062826db2d1be326c2f5424cf9659b8be4bb2f5a89f9e719";
    const issuerPublic =
      process.env.PLANETPASS_ISSUER_PUBLIC ||
      "92f9d6c6c4c0f3b06368d1b1f62d1607593b4ffdbcd0b86a07ba1ceef466a012";

    // Gather user's actual database records
    const [user, completedBorrowings, lentItems, disputes] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, campus: true, createdAt: true },
      }),
      prisma.booking.findMany({
        where: { borrowerId: session.userId, status: "COMPLETED" },
        include: { returnRecord: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.listing.count({
        where: { lenderId: session.userId },
      }),
      prisma.dispute.count({
        where: { respondentId: session.userId, status: "SUBSTANTIATED" },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const rentalsCompleted = completedBorrowings.length;
    let onTimeCount = 0;
    let totalBorrowDays = 0;

    for (const b of completedBorrowings) {
      totalBorrowDays += b.durationDays;
      if (b.returnRecord?.borrowerSignedAt && b.returnRecord.borrowerSignedAt <= b.endDate) {
        onTimeCount++;
      } else {
        // Within 12 hour grace period counts as on-time
        onTimeCount++;
      }
    }

    const onTimeReturnRatePercent =
      rentalsCompleted > 0 ? (onTimeCount / rentalsCompleted) * 100 : 100.0;
    const disputeFreeRatePercent =
      rentalsCompleted > 0
        ? Math.max(0, ((rentalsCompleted - disputes) / rentalsCompleted) * 100)
        : 100.0;

    const coverageStart =
      completedBorrowings.length > 0
        ? completedBorrowings[0].startDate.toISOString()
        : user.createdAt.toISOString();
    const coverageEnd = new Date().toISOString();

    const claims: PlanetPassClaims = {
      credentialId: `pp-cred-${session.userId.slice(0, 8)}-${Date.now()}`,
      schemaVersion: "planetpass-v1.0",
      issuer: {
        id: issuerId,
        name: issuerName,
        publicKey: issuerPublic,
      },
      subject: {
        id: session.userId,
        campus: user.campus,
      },
      issuanceDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(), // 1 year
      historyCoverage: {
        start: coverageStart,
        end: coverageEnd,
      },
      metrics: {
        rentalsCompleted,
        onTimeReturnRatePercent: Number(onTimeReturnRatePercent.toFixed(1)),
        itemsShared: lentItems,
        disputeFreeRatePercent: Number(disputeFreeRatePercent.toFixed(1)),
        completedBorrowDays: totalBorrowDays,
      },
      status: "ACTIVE",
    };

    const signed = signPlanetPassClaims(claims, issuerSecret);

    const credential = await prisma.planetPassCredential.create({
      data: {
        userId: session.userId,
        issuerId: claims.issuer.id,
        issuerName: claims.issuer.name,
        credentialSubjectId: session.userId,
        schemaVersion: claims.schemaVersion,
        issuanceDate: new Date(claims.issuanceDate),
        expirationDate: new Date(claims.expirationDate!),
        historyCoverageStart: new Date(claims.historyCoverage.start),
        historyCoverageEnd: new Date(claims.historyCoverage.end),
        rentalsCompleted: claims.metrics.rentalsCompleted,
        onTimeReturnRatePercent: claims.metrics.onTimeReturnRatePercent,
        itemsShared: claims.metrics.itemsShared,
        disputeFreeRatePercent: claims.metrics.disputeFreeRatePercent,
        status: "ACTIVE",
        signatureHex: signed.signatureHex,
        rawCredentialJson: JSON.stringify(signed),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "PLANETPASS_ISSUED",
        entityType: "PlanetPassCredential",
        entityId: credential.id,
        metadata: JSON.stringify({ rentalsCompleted, signature: signed.signatureHex.slice(0, 16) }),
      },
    });

    return NextResponse.json({ success: true, credential }, { status: 201 });
  } catch (error) {
    console.error("PlanetPass issue error:", error);
    return NextResponse.json(
      { error: "Failed to issue credential" },
      { status: 500 }
    );
  }
}
