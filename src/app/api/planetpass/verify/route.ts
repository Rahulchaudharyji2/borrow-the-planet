import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyPlanetPassPresentation,
  SignedPlanetPassCredential,
  PresentationPayload,
} from "@/lib/planetpass-crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const credentialId = searchParams.get("credentialId");
    const token = searchParams.get("token");

    if (!credentialId) {
      return NextResponse.json(
        { error: "credentialId parameter is required" },
        { status: 400 }
      );
    }

    const credential = await prisma.planetPassCredential.findUnique({
      where: { id: credentialId },
      include: {
        user: { select: { campus: true } },
      },
    });

    if (!credential) {
      return NextResponse.json(
        { error: "Credential not found on issuer registry" },
        { status: 404 }
      );
    }

    const issuerSecret =
      process.env.PLANETPASS_ISSUER_SECRET ||
      "4d82f7c0068c8b4c062826db2d1be326c2f5424cf9659b8be4bb2f5a89f9e719";

    const signedCred: SignedPlanetPassCredential = JSON.parse(credential.rawCredentialJson);

    // If token provided, find specific consented presentation
    let presentationRecord = null;
    if (token) {
      presentationRecord = await prisma.planetPassPresentation.findUnique({
        where: { shareToken: token },
      });

      if (presentationRecord) {
        // Increment presentation access counter for audit
        await prisma.planetPassPresentation.update({
          where: { id: presentationRecord.id },
          data: {
            accessCount: { increment: 1 },
            lastAccessedAt: new Date(),
          },
        });
      }
    }

    const consentedClaimKeys = presentationRecord
      ? (JSON.parse(presentationRecord.disclosedClaims) as string[])
      : ["rentalsCompleted", "onTimeReturnRatePercent", "itemsShared", "historyCoverage", "campus"];

    const disclosedData: Record<string, unknown> = {};
    if (consentedClaimKeys.includes("rentalsCompleted")) {
      disclosedData.rentalsCompleted = credential.rentalsCompleted;
    }
    if (consentedClaimKeys.includes("onTimeReturnRatePercent")) {
      disclosedData.onTimeReturnRatePercent = credential.onTimeReturnRatePercent;
    }
    if (consentedClaimKeys.includes("itemsShared")) {
      disclosedData.itemsShared = credential.itemsShared;
    }
    if (consentedClaimKeys.includes("disputeFreeRatePercent")) {
      disclosedData.disputeFreeRatePercent = credential.disputeFreeRatePercent;
    }
    if (consentedClaimKeys.includes("historyCoverage")) {
      disclosedData.historyCoverage = {
        start: credential.historyCoverageStart.toISOString(),
        end: credential.historyCoverageEnd.toISOString(),
      };
    }
    if (consentedClaimKeys.includes("campus")) {
      disclosedData.campus = credential.user.campus;
    }

    const presentationPayload: PresentationPayload = {
      presentationId: presentationRecord?.id || `direct-eval-${Date.now()}`,
      shareToken: token || "direct-view",
      credentialId: credential.id,
      disclosedClaims: consentedClaimKeys as PresentationPayload["disclosedClaims"],
      issuer: {
        id: credential.issuerId,
        name: credential.issuerName,
      },
      disclosedData,
      purpose: presentationRecord?.purpose || "Public registry verification",
      issuedAt: presentationRecord?.createdAt.toISOString() || credential.issuanceDate.toISOString(),
      expiresAt: presentationRecord?.expiresAt.toISOString() || (credential.expirationDate ? credential.expirationDate.toISOString() : new Date(Date.now() + 86400000).toISOString()),
      originalSignature: credential.signatureHex,
    };

    // Execute cryptographic verification
    const verification = verifyPlanetPassPresentation(
      presentationPayload,
      signedCred.claims,
      issuerSecret
    );

    return NextResponse.json({
      success: true,
      verification,
      credential: {
        id: credential.id,
        issuerId: credential.issuerId,
        issuerName: credential.issuerName,
        schemaVersion: credential.schemaVersion,
        issuanceDate: credential.issuanceDate,
        expirationDate: credential.expirationDate,
        status: credential.status,
      },
      presentation: presentationRecord
        ? {
            purpose: presentationRecord.purpose,
            accessCount: presentationRecord.accessCount + 1,
            expiresAt: presentationRecord.expiresAt,
          }
        : null,
    });
  } catch (error) {
    console.error("PlanetPass verification error:", error);
    return NextResponse.json(
      { error: "Verification pipeline encountered an error" },
      { status: 500 }
    );
  }
}
