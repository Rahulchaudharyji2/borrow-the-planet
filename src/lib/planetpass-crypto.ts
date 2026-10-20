import crypto from "crypto";

export interface PlanetPassClaims {
  credentialId: string;
  schemaVersion: "planetpass-v1.0";
  issuer: {
    id: string;
    name: string;
    publicKey: string;
  };
  subject: {
    id: string;
    campus: string;
    accountAgeDays?: number;
  };
  issuanceDate: string;
  expirationDate: string | null;
  historyCoverage: {
    start: string;
    end: string;
  };
  metrics: {
    rentalsCompleted: number;
    onTimeReturnRatePercent: number;
    itemsShared: number;
    disputeFreeRatePercent: number;
    completedBorrowDays: number;
  };
  status: "ACTIVE" | "SUSPENDED" | "REVOKED" | "EXPIRED";
}

export interface SignedPlanetPassCredential {
  claims: PlanetPassClaims;
  signatureHex: string;
  algorithm: "HMAC-SHA256-RFC2104" | "ED25519";
}

export interface PresentationPayload {
  presentationId: string;
  shareToken: string;
  credentialId: string;
  disclosedClaims: (keyof PlanetPassClaims["metrics"] | "historyCoverage" | "campus")[];
  issuer: {
    id: string;
    name: string;
  };
  disclosedData: Partial<PlanetPassClaims["metrics"]> & {
    campus?: string;
    historyCoverage?: { start: string; end: string };
    rentalsCompleted?: number;
    onTimeReturnRatePercent?: number;
  };
  purpose?: string;
  issuedAt: string;
  expiresAt: string;
  originalSignature: string;
}

export interface VerificationResult {
  valid: boolean;
  tamperEvident: boolean;
  status: "ACTIVE" | "SUSPENDED" | "REVOKED" | "EXPIRED" | "TAMPERED" | "INSUFFICIENT_HISTORY";
  trustAssessment: {
    level: "HIGH" | "MEDIUM" | "EMERGING" | "INSUFFICIENT_HISTORY";
    title: string;
    explanation: string;
  };
  checks: {
    signatureValid: boolean;
    issuerTrusted: boolean;
    notExpired: boolean;
    statusActive: boolean;
    historyCoverageSufficient: boolean;
  };
  claims: Partial<PlanetPassClaims["metrics"]> & {
    historyCoverage?: { start: string; end: string };
    campus?: string;
  };
  issuer: {
    id: string;
    name: string;
  };
  verifiedAt: string;
}

// Canonical JSON serialization (RFC 8785 subset) ensures deterministic signature hashing
export function canonicalizeJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map((item) => canonicalizeJson(item)).join(",")}]`;
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map(
    (k) => `${JSON.stringify(k)}:${canonicalizeJson((obj as Record<string, unknown>)[k])}`
  );
  return `{${pairs.join(",")}}`;
}

/**
 * Sign PlanetPass credential using HMAC-SHA256 with the issuer secret key.
 * In a multi-tenant KMS setup, this would be an Ed25519 or ES256 hardware signature.
 */
export function signPlanetPassClaims(
  claims: PlanetPassClaims,
  secretKey: string
): SignedPlanetPassCredential {
  const canonical = canonicalizeJson(claims);
  const signatureHex = crypto
    .createHmac("sha256", secretKey)
    .update(canonical, "utf8")
    .digest("hex");

  return {
    claims,
    signatureHex,
    algorithm: "HMAC-SHA256-RFC2104",
  };
}

/**
 * Verify credential signature against the claims and secret/public key
 */
export function verifyCredentialSignature(
  claims: PlanetPassClaims,
  signatureHex: string,
  secretKey: string
): boolean {
  try {
    const canonical = canonicalizeJson(claims);
    const expectedHex = crypto
      .createHmac("sha256", secretKey)
      .update(canonical, "utf8")
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signatureHex, "hex"),
      Buffer.from(expectedHex, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Compute evidence-aware trust tier without ever assuming missing history is negative
 */
export function computeTrustAssessment(
  rentalsCompleted: number,
  onTimeReturnRate: number,
  disputeFreeRate: number
): {
  level: "HIGH" | "MEDIUM" | "EMERGING" | "INSUFFICIENT_HISTORY";
  title: string;
  explanation: string;
} {
  if (rentalsCompleted < 3) {
    return {
      level: "INSUFFICIENT_HISTORY",
      title: "Insufficient History",
      explanation:
        "Borrower has completed fewer than 3 verified rentals. This does not indicate negative behavior, only that history coverage is nascent.",
    };
  }

  if (rentalsCompleted >= 8 && onTimeReturnRate >= 95 && disputeFreeRate >= 95) {
    return {
      level: "HIGH",
      title: "Established Proven Borrower",
      explanation: `${rentalsCompleted} completed rentals with ${onTimeReturnRate.toFixed(1)}% on-time return rate and ${disputeFreeRate.toFixed(1)}% dispute-free record across the network.`,
    };
  }

  if (rentalsCompleted >= 3 && onTimeReturnRate >= 80 && disputeFreeRate >= 80) {
    return {
      level: "MEDIUM",
      title: "Verified Community Member",
      explanation: `${rentalsCompleted} verified rentals with satisfactory compliance and no substantiated critical disputes.`,
    };
  }

  return {
    level: "EMERGING",
    title: "Developing History",
    explanation: `${rentalsCompleted} completed transactions under active observation.`,
  };
}

/**
 * Independent verification function usable by external marketplaces
 */
export function verifyPlanetPassPresentation(
  presentation: PresentationPayload,
  originalClaims: PlanetPassClaims,
  secretKey: string
): VerificationResult {
  const verifiedAt = new Date().toISOString();
  const notExpired = new Date(presentation.expiresAt).getTime() > Date.now();
  const signatureValid = verifyCredentialSignature(
    originalClaims,
    presentation.originalSignature,
    secretKey
  );
  const statusActive = originalClaims.status === "ACTIVE";
  const historySufficient = (originalClaims.metrics.rentalsCompleted ?? 0) >= 3;

  const trustAssessment = computeTrustAssessment(
    originalClaims.metrics.rentalsCompleted,
    originalClaims.metrics.onTimeReturnRatePercent,
    originalClaims.metrics.disputeFreeRatePercent
  );

  const isValid = signatureValid && notExpired && statusActive;

  let finalStatus: VerificationResult["status"] = originalClaims.status;
  if (!signatureValid) {
    finalStatus = "TAMPERED";
  } else if (!notExpired) {
    finalStatus = "EXPIRED";
  } else if (!historySufficient && finalStatus === "ACTIVE") {
    finalStatus = "INSUFFICIENT_HISTORY";
  }

  return {
    valid: isValid,
    tamperEvident: signatureValid,
    status: finalStatus,
    trustAssessment,
    checks: {
      signatureValid,
      issuerTrusted: originalClaims.issuer.id.startsWith("did:planetpass:"),
      notExpired,
      statusActive,
      historyCoverageSufficient: historySufficient,
    },
    claims: presentation.disclosedData,
    issuer: {
      id: originalClaims.issuer.id,
      name: originalClaims.issuer.name,
    },
    verifiedAt,
  };
}
