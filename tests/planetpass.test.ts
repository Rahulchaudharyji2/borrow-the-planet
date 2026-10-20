import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  signPlanetPassClaims,
  verifyCredentialSignature,
  verifyPlanetPassPresentation,
  computeTrustAssessment,
  PlanetPassClaims,
  PresentationPayload,
} from "../src/lib/planetpass-crypto";

describe("PlanetPass Cryptographic Credential Engine", () => {
  const mockIssuerSecret = "4d82f7c0068c8b4c062826db2d1be326c2f5424cf9659b8be4bb2f5a89f9e719";

  const baseClaims: PlanetPassClaims = {
    credentialId: "pp-test-cred-001",
    schemaVersion: "planetpass-v1.0",
    issuer: {
      id: "did:planetpass:campus-collective-authority-01",
      name: "Campus Trust Network & Beast Coder Federation",
      publicKey: "92f9d6c6c4c0f3b06368d1b1f62d1607593b4ffdbcd0b86a07ba1ceef466a012",
    },
    subject: {
      id: "user-test-alice-123",
      campus: "UC Berkeley Engineering Hub",
      accountAgeDays: 120,
    },
    issuanceDate: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    expirationDate: new Date("2027-01-01T00:00:00.000Z").toISOString(),
    historyCoverage: {
      start: new Date("2025-06-01T00:00:00.000Z").toISOString(),
      end: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    },
    metrics: {
      rentalsCompleted: 10,
      onTimeReturnRatePercent: 100.0,
      itemsShared: 4,
      disputeFreeRatePercent: 100.0,
      completedBorrowDays: 32,
    },
    status: "ACTIVE",
  };

  test("signs valid credential with deterministic HMAC-SHA256 signature", () => {
    const signed = signPlanetPassClaims(baseClaims, mockIssuerSecret);
    assert.ok(signed.signatureHex);
    assert.equal(typeof signed.signatureHex, "string");
    assert.equal(signed.signatureHex.length, 64);

    const isValid = verifyCredentialSignature(
      baseClaims,
      signed.signatureHex,
      mockIssuerSecret
    );
    assert.equal(isValid, true, "Signature must verify against unaltered claims");
  });

  test("detects any claim tampering immediately", () => {
    const signed = signPlanetPassClaims(baseClaims, mockIssuerSecret);

    // Attacker tampers with completed rentals: modifies 10 to 50
    const tamperedClaims: PlanetPassClaims = {
      ...baseClaims,
      metrics: {
        ...baseClaims.metrics,
        rentalsCompleted: 50,
      },
    };

    const isValid = verifyCredentialSignature(
      tamperedClaims,
      signed.signatureHex,
      mockIssuerSecret
    );
    assert.equal(isValid, false, "Signature verification must fail for tampered claims");
  });

  test("evidence-aware trust tier correctly reports Insufficient History when < 3 rentals", () => {
    const assessment = computeTrustAssessment(1, 100, 100);
    assert.equal(assessment.level, "INSUFFICIENT_HISTORY");
    assert.ok(assessment.explanation.includes("fewer than 3 verified rentals"));
    assert.ok(assessment.explanation.includes("does not indicate negative behavior"));
  });

  test("evidence-aware trust tier awards Proven Borrower for high rental count with high compliance", () => {
    const assessment = computeTrustAssessment(12, 98, 100);
    assert.equal(assessment.level, "HIGH");
    assert.equal(assessment.title, "Established Proven Borrower");
  });

  test("verifies selective presentation payload without revealing unconsented claims", () => {
    const signed = signPlanetPassClaims(baseClaims, mockIssuerSecret);

    const presentation: PresentationPayload = {
      presentationId: "pres-test-999",
      shareToken: "token-selective-123",
      credentialId: baseClaims.credentialId,
      disclosedClaims: ["rentalsCompleted", "onTimeReturnRatePercent", "historyCoverage"],
      issuer: baseClaims.issuer,
      disclosedData: {
        rentalsCompleted: baseClaims.metrics.rentalsCompleted,
        onTimeReturnRatePercent: baseClaims.metrics.onTimeReturnRatePercent,
        historyCoverage: baseClaims.historyCoverage,
      },
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24h future
      originalSignature: signed.signatureHex,
    };

    const result = verifyPlanetPassPresentation(presentation, baseClaims, mockIssuerSecret);
    assert.equal(result.valid, true);
    assert.equal(result.tamperEvident, true);
    assert.equal(result.checks.signatureValid, true);
    assert.equal(result.checks.notExpired, true);
    assert.equal(result.checks.issuerTrusted, true);
    assert.equal(result.trustAssessment.level, "HIGH");
    // Verify unconsented claims like itemsShared are not present in disclosed claims
    assert.equal((result.claims as Record<string, unknown>).itemsShared, undefined);
  });

  test("rejects expired presentation", () => {
    const signed = signPlanetPassClaims(baseClaims, mockIssuerSecret);

    const expiredPresentation: PresentationPayload = {
      presentationId: "pres-expired-001",
      shareToken: "token-expired-123",
      credentialId: baseClaims.credentialId,
      disclosedClaims: ["rentalsCompleted"],
      issuer: baseClaims.issuer,
      disclosedData: {
        rentalsCompleted: baseClaims.metrics.rentalsCompleted,
      },
      issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Expired 24h ago
      originalSignature: signed.signatureHex,
    };

    const result = verifyPlanetPassPresentation(
      expiredPresentation,
      baseClaims,
      mockIssuerSecret
    );
    assert.equal(result.valid, false);
    assert.equal(result.status, "EXPIRED");
    assert.equal(result.checks.notExpired, false);
  });

  test("flags revoked credentials during verification", () => {
    const revokedClaims: PlanetPassClaims = {
      ...baseClaims,
      status: "REVOKED",
    };
    const signed = signPlanetPassClaims(revokedClaims, mockIssuerSecret);

    const presentation: PresentationPayload = {
      presentationId: "pres-revoked-001",
      shareToken: "token-revoked-123",
      credentialId: revokedClaims.credentialId,
      disclosedClaims: ["rentalsCompleted"],
      issuer: revokedClaims.issuer,
      disclosedData: {
        rentalsCompleted: revokedClaims.metrics.rentalsCompleted,
      },
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      originalSignature: signed.signatureHex,
    };

    const result = verifyPlanetPassPresentation(
      presentation,
      revokedClaims,
      mockIssuerSecret
    );
    assert.equal(result.valid, false);
    assert.equal(result.status, "REVOKED");
    assert.equal(result.checks.statusActive, false);
  });
});
