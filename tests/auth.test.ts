import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "../src/lib/auth";

describe("Authentication Security and Token Validation", () => {
  test("hashes and correctly verifies passwords with bcrypt salt", async () => {
    const password = "SuperSecretPassword123!";
    const hash = await hashPassword(password);

    assert.notEqual(hash, password);
    assert.ok(hash.startsWith("$2"));

    const isMatch = await verifyPassword(password, hash);
    assert.equal(isMatch, true);

    const isWrong = await verifyPassword("WrongPassword!", hash);
    assert.equal(isWrong, false);
  });

  test("generates and verifies tamper-proof JWT session token", async () => {
    const payload = {
      userId: "user-uuid-112233",
      email: "test@campus.edu",
      role: "USER",
      name: "Test User",
    };

    const token = await createSessionToken(payload);
    assert.ok(token);
    assert.equal(typeof token, "string");

    const decoded = await verifySessionToken(token);
    assert.ok(decoded);
    assert.equal(decoded.userId, payload.userId);
    assert.equal(decoded.email, payload.email);
    assert.equal(decoded.role, payload.role);
  });

  test("rejects forged or modified session token", async () => {
    const payload = {
      userId: "user-uuid-112233",
      email: "test@campus.edu",
      role: "USER",
      name: "Test User",
    };

    const token = await createSessionToken(payload);
    const forgedToken = token.slice(0, -6) + "bad123";

    const decoded = await verifySessionToken(forgedToken);
    assert.equal(decoded, null, "Forged token signature verification must fail");
  });
});
