import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Booking Domain and Availability Calculations", () => {
  function calculateBookingFinancials(params: {
    dailyRateCents: number;
    dailyRateLamports: number;
    depositCents: number;
    depositLamports: number;
    startDate: Date;
    endDate: Date;
    platformFeeRate?: number; // e.g. 0.05 (5%)
  }) {
    const diffMs = params.endDate.getTime() - params.startDate.getTime();
    if (diffMs <= 0) throw new Error("InvalidDateRange: endDate must be after startDate");

    const durationDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const feeRate = params.platformFeeRate ?? 0.05;

    // Integer minor units (Cents)
    const rentalSubtotalCents = params.dailyRateCents * durationDays;
    const platformFeeCents = Math.round(rentalSubtotalCents * feeRate);
    const totalDueCents = rentalSubtotalCents + params.depositCents + platformFeeCents;

    // Integer base units (Lamports)
    const rentalSubtotalLamports = params.dailyRateLamports * durationDays;
    const platformFeeLamports = Math.round(rentalSubtotalLamports * feeRate);
    const totalDueLamports = rentalSubtotalLamports + params.depositLamports + platformFeeLamports;

    return {
      durationDays,
      rentalSubtotalCents,
      depositCents: params.depositCents,
      platformFeeCents,
      totalDueCents,
      rentalSubtotalLamports,
      depositLamports: params.depositLamports,
      platformFeeLamports,
      totalDueLamports,
    };
  }

  function checkDateOverlap(
    existing: { start: Date; end: Date; status: string }[],
    requested: { start: Date; end: Date }
  ): boolean {
    const activeStatuses = ["PENDING", "APPROVED", "ESCROW_FUNDED", "HANDED_OVER", "RETURN_PENDING"];
    return existing.some((booking) => {
      if (!activeStatuses.includes(booking.status)) return false;
      // Overlap occurs if requested start < existing end AND requested end > existing start
      return requested.start < booking.end && requested.end > booking.start;
    });
  }

  test("calculates accurate integer money breakdown for multiple days", () => {
    const start = new Date("2026-10-20T10:00:00Z");
    const end = new Date("2026-10-23T10:00:00Z"); // 3 days

    const calc = calculateBookingFinancials({
      dailyRateCents: 2500, // $25.00
      dailyRateLamports: 150_000_000, // 0.15 SOL
      depositCents: 10000, // $100.00
      depositLamports: 600_000_000, // 0.60 SOL
      startDate: start,
      endDate: end,
    });

    assert.equal(calc.durationDays, 3);
    assert.equal(calc.rentalSubtotalCents, 7500); // 3 * $25 = $75.00
    assert.equal(calc.platformFeeCents, 375); // 5% of $75 = $3.75
    assert.equal(calc.totalDueCents, 7500 + 10000 + 375); // $178.75

    assert.equal(calc.rentalSubtotalLamports, 450_000_000); // 0.45 SOL
    assert.equal(calc.platformFeeLamports, 22_500_000); // 0.0225 SOL
    assert.equal(calc.totalDueLamports, 450_000_000 + 600_000_000 + 22_500_000);
  });

  test("rejects invalid inverted dates", () => {
    const start = new Date("2026-10-25T10:00:00Z");
    const end = new Date("2026-10-20T10:00:00Z"); // Inverted

    assert.throws(
      () =>
        calculateBookingFinancials({
          dailyRateCents: 2000,
          dailyRateLamports: 100_000_000,
          depositCents: 5000,
          depositLamports: 250_000_000,
          startDate: start,
          endDate: end,
        }),
      /InvalidDateRange/
    );
  });

  test("detects overlapping confirmed bookings", () => {
    const existingBookings = [
      {
        start: new Date("2026-11-01T00:00:00Z"),
        end: new Date("2026-11-05T00:00:00Z"),
        status: "ESCROW_FUNDED",
      },
      {
        start: new Date("2026-11-10T00:00:00Z"),
        end: new Date("2026-11-15T00:00:00Z"),
        status: "CANCELLED", // Cancelled should not block
      },
    ];

    // Overlapping query 1: within range Nov 2 to Nov 4
    const overlap1 = checkDateOverlap(existingBookings, {
      start: new Date("2026-11-02T00:00:00Z"),
      end: new Date("2026-11-04T00:00:00Z"),
    });
    assert.equal(overlap1, true);

    // Overlapping query 2: spanning over range Oct 30 to Nov 6
    const overlap2 = checkDateOverlap(existingBookings, {
      start: new Date("2026-10-30T00:00:00Z"),
      end: new Date("2026-11-06T00:00:00Z"),
    });
    assert.equal(overlap2, true);

    // Non-overlapping query: Nov 6 to Nov 9
    const noOverlap = checkDateOverlap(existingBookings, {
      start: new Date("2026-11-06T00:00:00Z"),
      end: new Date("2026-11-09T00:00:00Z"),
    });
    assert.equal(noOverlap, false);

    // Query on cancelled slot: Nov 11 to Nov 14 (should be available)
    const cancelledSlot = checkDateOverlap(existingBookings, {
      start: new Date("2026-11-11T00:00:00Z"),
      end: new Date("2026-11-14T00:00:00Z"),
    });
    assert.equal(cancelledSlot, false);
  });
});
