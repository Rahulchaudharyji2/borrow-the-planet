import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PlanetPassShareSchema } from "@/lib/validations";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = PlanetPassShareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { credentialId, disclosedClaims, purpose, expiryHours } = parsed.data;

    // Verify user owns the credential
    const credential = await prisma.planetPassCredential.findUnique({
      where: { id: credentialId },
    });

    if (!credential || credential.userId !== session.userId) {
      return NextResponse.json(
        { error: "Forbidden: Credential not found or not owned by you" },
        { status: 403 }
      );
    }

    const shareToken = `ppt_${crypto.randomBytes(16).toString("hex")}`;
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    const presentation = await prisma.planetPassPresentation.create({
      data: {
        credentialId,
        userId: session.userId,
        shareToken,
        disclosedClaims: JSON.stringify(disclosedClaims),
        purpose: purpose || "Rental application proof",
        expiresAt,
      },
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/verify/${credentialId}?token=${shareToken}`;

    return NextResponse.json({
      success: true,
      presentation,
      shareToken,
      verifyUrl,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("PlanetPass present error:", error);
    return NextResponse.json(
      { error: "Failed to generate presentation" },
      { status: 500 }
    );
  }
}
