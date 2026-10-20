import React from "react";
import Link from "next/link";
import { Scale, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-solana-green uppercase tracking-wider">
          <Scale className="h-3.5 w-3.5" />
          <span>Community Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-planet-text tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs font-mono text-planet-subtle">
          Borrow the Planet • Team Beast Coder • Devnet Marketplace Edition
        </p>
      </div>

      <div className="space-y-8 text-xs text-planet-muted leading-relaxed">
        <section className="space-y-2 rounded-xl border border-planet-border bg-surface-primary p-6">
          <h2 className="text-sm font-bold text-planet-text">1. Peer Rental Relationship</h2>
          <p>
            Borrow the Planet provides software infrastructure, smart escrows, and verifiable
            credential tooling for physical item sharing within campus collectives. We are not a
            direct party to item possession. Lenders are responsible for ensuring equipment safety,
            and borrowers are responsible for respectful usage and timely return.
          </p>
        </section>

        <section className="space-y-2 rounded-xl border border-planet-border bg-surface-primary p-6">
          <h2 className="text-sm font-bold text-planet-text">2. Escrow & Security Deposits</h2>
          <p>
            All rental payments and refundable security deposits are processed through Solana Devnet
            smart contract accounts. Funds are released according to verified physical milestones:
            payouts are transferred to the lender upon confirmed return in good order, and deposits
            are returned to the borrower.
          </p>
        </section>

        <section className="space-y-2 rounded-xl border border-planet-border bg-surface-primary p-6">
          <h2 className="text-sm font-bold text-planet-text">3. Dispute Arbitration & Appeals</h2>
          <p>
            If a party reports an incident (such as equipment damage or failure to return), funds
            remain locked in the escrow contract pending review by an authorized reviewer. Both
            parties agree to submit clear, unaltered photographic evidence. Any decision may be
            appealed within 7 days of determination.
          </p>
        </section>

        <section className="space-y-2 rounded-xl border border-planet-border bg-surface-primary p-6">
          <h2 className="text-sm font-bold text-planet-text">4. Prohibited Items</h2>
          <p>
            Users may not list hazardous materials, weapons, controlled substances, illegal items,
            or equipment that presents an unreasonable safety hazard to fellow students.
          </p>
        </section>
      </div>
    </div>
  );
}
