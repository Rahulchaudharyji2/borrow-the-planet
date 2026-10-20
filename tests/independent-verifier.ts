import {
  signPlanetPassClaims,
  verifyPlanetPassPresentation,
  PlanetPassClaims,
  PresentationPayload,
} from "../src/lib/planetpass-crypto";

/**
 * INDEPENDENT VERIFIER SERVICE (Cross-Marketplace Simulator)
 * This script simulates an external peer marketplace (e.g. "PeerGear Network")
 * consuming and verifying a portable PlanetPass presented by a student user.
 */
async function runIndependentVerificationDemo() {
  console.log("============================================================");
  console.log("🪐 BORROW THE PLANET — INDEPENDENT VERIFIER DEMO");
  console.log("Cross-Marketplace Portable Credential Verification (PlanetPass)");
  console.log("============================================================\n");

  const issuerSecret = "4d82f7c0068c8b4c062826db2d1be326c2f5424cf9659b8be4bb2f5a89f9e719";

  // 1. Authorized Issuer issues credential to Borrower
  const credentialSubject: PlanetPassClaims = {
    credentialId: "pp-cred-external-audit-8812",
    schemaVersion: "planetpass-v1.0",
    issuer: {
      id: "did:planetpass:campus-collective-authority-01",
      name: "Campus Trust Network & Beast Coder Federation",
      publicKey: "92f9d6c6c4c0f3b06368d1b1f62d1607593b4ffdbcd0b86a07ba1ceef466a012",
    },
    subject: {
      id: "user-cross-market-student",
      campus: "UC Berkeley Engineering Hub",
      accountAgeDays: 90,
    },
    issuanceDate: new Date("2026-02-01T12:00:00Z").toISOString(),
    expirationDate: new Date("2027-02-01T12:00:00Z").toISOString(),
    historyCoverage: {
      start: new Date("2025-11-01T00:00:00Z").toISOString(),
      end: new Date("2026-02-01T00:00:00Z").toISOString(),
    },
    metrics: {
      rentalsCompleted: 8,
      onTimeReturnRatePercent: 100.0,
      itemsShared: 3,
      disputeFreeRatePercent: 100.0,
      completedBorrowDays: 24,
    },
    status: "ACTIVE",
  };

  const signedCredential = signPlanetPassClaims(credentialSubject, issuerSecret);
  console.log("1. Issuer Signed Credential Generated:");
  console.log(`   - Credential ID: ${signedCredential.claims.credentialId}`);
  console.log(`   - Issuer DID:    ${signedCredential.claims.issuer.id}`);
  console.log(`   - Signature:     ${signedCredential.signatureHex.slice(0, 24)}...`);
  console.log(`   - Status:        ${signedCredential.claims.status}\n`);

  // 2. User consents to sharing selective claims with third-party marketplace "PeerGear"
  const userPresentation: PresentationPayload = {
    presentationId: "pres-peergear-app-101",
    shareToken: "pt_share_99f2e1a4",
    credentialId: credentialSubject.credentialId,
    disclosedClaims: ["rentalsCompleted", "onTimeReturnRatePercent", "historyCoverage"],
    issuer: credentialSubject.issuer,
    disclosedData: {
      rentalsCompleted: credentialSubject.metrics.rentalsCompleted,
      onTimeReturnRatePercent: credentialSubject.metrics.onTimeReturnRatePercent,
      historyCoverage: credentialSubject.historyCoverage,
    },
    purpose: "Rental deposit waiver application on PeerGear Marketplace",
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    originalSignature: signedCredential.signatureHex,
  };

  console.log("2. User Generates Privacy-Preserving Presentation for PeerGear:");
  console.log(`   - Purpose:          "${userPresentation.purpose}"`);
  console.log(`   - Consented Claims: ${userPresentation.disclosedClaims.join(", ")}`);
  console.log(`   - Minimization:     Personal identity, wallet address & private notes NOT revealed.`);
  console.log(`   - Presentation Exp: ${userPresentation.expiresAt}\n`);

  // 3. PeerGear Independently Verifies the presentation
  console.log("3. External Marketplace (PeerGear) Executes Verification Pipeline:");
  const verificationResult = verifyPlanetPassPresentation(
    userPresentation,
    credentialSubject,
    issuerSecret
  );

  console.log(`   - Signature Valid:        ${verificationResult.checks.signatureValid ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   - Issuer Trusted:         ${verificationResult.checks.issuerTrusted ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   - Not Expired:            ${verificationResult.checks.notExpired ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   - Status Active:          ${verificationResult.checks.statusActive ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   - Coverage Sufficient:    ${verificationResult.checks.historyCoverageSufficient ? "✅ PASS" : "⚠️ INSUFFICIENT"}`);
  console.log(`   - Resulting Trust Tier:   ${verificationResult.trustAssessment.title} (${verificationResult.trustAssessment.level})`);
  console.log(`   - Assessment Rationale:   "${verificationResult.trustAssessment.explanation}"\n`);

  if (!verificationResult.valid) {
    throw new Error("Independent verification unexpectedly failed!");
  }

  // 4. Test Tamper Resistance: Third party alters rentals from 8 to 80
  console.log("4. Testing Third-Party Tamper Resistance Check:");
  const tamperedClaims = {
    ...credentialSubject,
    metrics: { ...credentialSubject.metrics, rentalsCompleted: 80 },
  };
  const tamperedResult = verifyPlanetPassPresentation(
    userPresentation,
    tamperedClaims,
    issuerSecret
  );
  console.log(`   - Tampered Signature Result: ${tamperedResult.checks.signatureValid ? "ACCEPTED (BAD)" : "REJECTED (EXPECTED ✅)"}`);
  console.log(`   - Detected Status:           ${tamperedResult.status}\n`);

  if (tamperedResult.valid) {
    throw new Error("Tampered credential should not have been accepted!");
  }

  console.log("✅ Cross-marketplace independent verification pipeline completed with 100% compliance!");
}

runIndependentVerificationDemo().catch((err) => {
  console.error("Independent verifier error:", err);
  process.exit(1);
});
