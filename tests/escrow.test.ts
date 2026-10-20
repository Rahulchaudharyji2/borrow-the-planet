import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { PublicKey } from "@solana/web3.js";
import { getEscrowPda, lamportsToSol, solToLamports } from "../src/lib/solana";

enum EscrowState {
  Funded = "Funded",
  HandedOver = "HandedOver",
  Completed = "Completed",
  Cancelled = "Cancelled",
  Disputed = "Disputed",
}

interface SimulatedEscrowAccount {
  bookingId: string;
  borrower: string;
  lender: string;
  arbiter: string;
  rentalAmountLamports: bigint;
  depositAmountLamports: bigint;
  state: EscrowState;
  createdAt: number;
}

// Logic mirror of programs/borrow-escrow/src/lib.rs instruction rules
class EscrowSimulator {
  accounts: Map<string, SimulatedEscrowAccount> = new Map();
  balances: Map<string, bigint> = new Map();

  getEscrow(bookingId: string): SimulatedEscrowAccount {
    const acc = this.accounts.get(bookingId);
    if (!acc) throw new Error("AccountNotFound");
    return acc;
  }

  createEscrow(params: {
    bookingId: string;
    borrower: string;
    lender: string;
    arbiter: string;
    rentalLamports: bigint;
    depositLamports: bigint;
  }) {
    if (params.bookingId.length > 64) throw new Error("BookingIdTooLong");
    if (params.rentalLamports <= 0n) throw new Error("InvalidRentalAmount");
    if (this.accounts.has(params.bookingId)) throw new Error("EscrowAlreadyExists");

    const total = params.rentalLamports + params.depositLamports;
    const borrowerBal = this.balances.get(params.borrower) ?? 0n;
    if (borrowerBal < total) throw new Error("InsufficientBorrowerFunds");

    this.balances.set(params.borrower, borrowerBal - total);

    const escrow: SimulatedEscrowAccount = {
      bookingId: params.bookingId,
      borrower: params.borrower,
      lender: params.lender,
      arbiter: params.arbiter,
      rentalAmountLamports: params.rentalLamports,
      depositAmountLamports: params.depositLamports,
      state: EscrowState.Funded,
      createdAt: Math.floor(Date.now() / 1000),
    };
    this.accounts.set(params.bookingId, escrow);
    return escrow;
  }

  confirmHandover(bookingId: string, signer: string) {
    const escrow = this.getEscrow(bookingId);
    if (escrow.state !== EscrowState.Funded) throw new Error("InvalidStateTransition");
    if (signer !== escrow.borrower) throw new Error("Unauthorized");
    escrow.state = EscrowState.HandedOver;
    return escrow;
  }

  completeReturn(bookingId: string, signer: string) {
    const escrow = this.getEscrow(bookingId);
    if (escrow.state !== EscrowState.HandedOver) throw new Error("InvalidStateTransition");
    if (signer !== escrow.lender) throw new Error("Unauthorized");

    const lenderBal = this.balances.get(escrow.lender) ?? 0n;
    const borrowerBal = this.balances.get(escrow.borrower) ?? 0n;

    this.balances.set(escrow.lender, lenderBal + escrow.rentalAmountLamports);
    this.balances.set(escrow.borrower, borrowerBal + escrow.depositAmountLamports);

    escrow.state = EscrowState.Completed;
    return escrow;
  }

  cancelBooking(bookingId: string, signer: string) {
    const escrow = this.getEscrow(bookingId);
    if (escrow.state !== EscrowState.Funded) throw new Error("InvalidStateTransition");
    if (
      signer !== escrow.borrower &&
      signer !== escrow.lender &&
      signer !== escrow.arbiter
    ) {
      throw new Error("Unauthorized");
    }

    const totalRefund = escrow.rentalAmountLamports + escrow.depositAmountLamports;
    const borrowerBal = this.balances.get(escrow.borrower) ?? 0n;
    this.balances.set(escrow.borrower, borrowerBal + totalRefund);

    escrow.state = EscrowState.Cancelled;
    return escrow;
  }

  raiseDispute(bookingId: string, signer: string) {
    const escrow = this.getEscrow(bookingId);
    if (
      escrow.state !== EscrowState.HandedOver &&
      escrow.state !== EscrowState.Funded
    ) {
      throw new Error("InvalidStateTransition");
    }
    if (signer !== escrow.borrower && signer !== escrow.lender) {
      throw new Error("Unauthorized");
    }
    escrow.state = EscrowState.Disputed;
    return escrow;
  }

  resolveDispute(params: {
    bookingId: string;
    arbiterSigner: string;
    lenderAward: bigint;
    borrowerAward: bigint;
  }) {
    const escrow = this.getEscrow(params.bookingId);
    if (escrow.state !== EscrowState.Disputed) throw new Error("InvalidStateTransition");
    if (params.arbiterSigner !== escrow.arbiter) throw new Error("Unauthorized");

    const totalEscrow = escrow.rentalAmountLamports + escrow.depositAmountLamports;
    if (params.lenderAward + params.borrowerAward > totalEscrow) {
      throw new Error("ExcessiveAward");
    }

    const lenderBal = this.balances.get(escrow.lender) ?? 0n;
    const borrowerBal = this.balances.get(escrow.borrower) ?? 0n;

    this.balances.set(escrow.lender, lenderBal + params.lenderAward);
    this.balances.set(escrow.borrower, borrowerBal + params.borrowerAward);

    escrow.state = EscrowState.Completed;
    return escrow;
  }
}

describe("Borrow Escrow Program Constraints and State Transitions", () => {
  const BORROWER = "BorrowerPubkey11111111111111111111111111111";
  const LENDER = "LenderPubkey2222222222222222222222222222222";
  const ARBITER = "ArbiterPubkey333333333333333333333333333333";

  test("derives valid Solana PDA from bookingId", () => {
    const bookingId = "booking-uuid-7712-4411";
    const [pda, bump] = getEscrowPda(bookingId);
    assert.ok(pda instanceof PublicKey);
    assert.ok(bump >= 0 && bump <= 255);
  });

  test("converts lamports to SOL accurately without float drift", () => {
    assert.equal(lamportsToSol(1_000_000_000n), "1");
    assert.equal(lamportsToSol(150_000_000n), "0.15");
    assert.equal(lamportsToSol(50_000_000n), "0.05");
    assert.equal(solToLamports("0.05"), 50_000_000);
    assert.equal(solToLamports("1.25"), 1_250_000_000);
  });

  test("happy path: creates, funds, hands over, and returns escrow cleanly", () => {
    const sim = new EscrowSimulator();
    sim.balances.set(BORROWER, 2_000_000_000n); // 2 SOL

    const rentalLamports = 500_000_000n; // 0.5 SOL
    const depositLamports = 1_000_000_000n; // 1.0 SOL

    // 1. Create & Fund
    const escrow = sim.createEscrow({
      bookingId: "b-001",
      borrower: BORROWER,
      lender: LENDER,
      arbiter: ARBITER,
      rentalLamports,
      depositLamports,
    });
    assert.equal(escrow.state, EscrowState.Funded);
    assert.equal(sim.balances.get(BORROWER), 500_000_000n);

    // 2. Handover
    sim.confirmHandover("b-001", BORROWER);
    assert.equal(escrow.state, EscrowState.HandedOver);

    // 3. Return & Settle
    sim.completeReturn("b-001", LENDER);
    assert.equal(escrow.state, EscrowState.Completed);

    // Lender gets rental amount (0.5 SOL), Borrower gets deposit refund (1.0 SOL)
    assert.equal(sim.balances.get(LENDER), 500_000_000n);
    assert.equal(sim.balances.get(BORROWER), 1_500_000_000n); // 0.5 remaining + 1.0 deposit refund
  });

  test("rejects return completion before physical handover", () => {
    const sim = new EscrowSimulator();
    sim.balances.set(BORROWER, 2_000_000_000n);

    sim.createEscrow({
      bookingId: "b-002",
      borrower: BORROWER,
      lender: LENDER,
      arbiter: ARBITER,
      rentalLamports: 100_000_000n,
      depositLamports: 200_000_000n,
    });

    // Try to complete return while still in Funded state
    assert.throws(
      () => sim.completeReturn("b-002", LENDER),
      /InvalidStateTransition/,
      "Return completion must require prior handover acknowledgement"
    );
  });

  test("rejects unauthorized party completing return", () => {
    const sim = new EscrowSimulator();
    sim.balances.set(BORROWER, 2_000_000_000n);

    sim.createEscrow({
      bookingId: "b-003",
      borrower: BORROWER,
      lender: LENDER,
      arbiter: ARBITER,
      rentalLamports: 100_000_000n,
      depositLamports: 200_000_000n,
    });

    sim.confirmHandover("b-003", BORROWER);

    // Malicious third party attempts to settle return
    assert.throws(
      () => sim.completeReturn("b-003", "AttackerPubkey9999999999999999999999999999"),
      /Unauthorized/
    );
  });

  test("cancellation refunds borrower before handover", () => {
    const sim = new EscrowSimulator();
    sim.balances.set(BORROWER, 2_000_000_000n);

    sim.createEscrow({
      bookingId: "b-004",
      borrower: BORROWER,
      lender: LENDER,
      arbiter: ARBITER,
      rentalLamports: 300_000_000n,
      depositLamports: 500_000_000n,
    });
    assert.equal(sim.balances.get(BORROWER), 1_200_000_000n);

    sim.cancelBooking("b-004", BORROWER);
    assert.equal(sim.getEscrow("b-004").state, EscrowState.Cancelled);
    // Borrower receives full 800_000_000n back
    assert.equal(sim.balances.get(BORROWER), 2_000_000_000n);
  });

  test("handles dispute lifecycle and fair distribution by arbiter", () => {
    const sim = new EscrowSimulator();
    sim.balances.set(BORROWER, 2_000_000_000n);

    sim.createEscrow({
      bookingId: "b-005",
      borrower: BORROWER,
      lender: LENDER,
      arbiter: ARBITER,
      rentalLamports: 200_000_000n,
      depositLamports: 600_000_000n,
    });

    sim.confirmHandover("b-005", BORROWER);

    // Lender flags missing accessory dispute
    sim.raiseDispute("b-005", LENDER);
    assert.equal(sim.getEscrow("b-005").state, EscrowState.Disputed);

    // Unauthorized non-arbiter cannot resolve
    assert.throws(
      () =>
        sim.resolveDispute({
          bookingId: "b-005",
          arbiterSigner: LENDER,
          lenderAward: 300_000_000n,
          borrowerAward: 500_000_000n,
        }),
      /Unauthorized/
    );

    // Authorized arbiter resolves dispute: $15 damage award to lender, rest returned to borrower
    sim.resolveDispute({
      bookingId: "b-005",
      arbiterSigner: ARBITER,
      lenderAward: 300_000_000n, // 200m rental + 100m partial deposit compensation
      borrowerAward: 500_000_000n, // 500m deposit refund
    });

    assert.equal(sim.getEscrow("b-005").state, EscrowState.Completed);
    assert.equal(sim.balances.get(LENDER), 300_000_000n);
  });
});
