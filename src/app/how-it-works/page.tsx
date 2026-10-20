import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Compass,
  Lock,
  Camera,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Repeat,
  HeartHandshake,
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-solana-green">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Community Operating Model</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-planet-text">
          How Borrow the Planet Works
        </h1>
        <p className="text-base text-planet-muted leading-relaxed">
          A circular sharing network designed to make renting physical gear from campus peers
          as seamless, safe, and transparent as possible.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="space-y-12">
        {/* Step 1 */}
        <div className="flex flex-col md:flex-row gap-8 items-start border-b border-planet-border pb-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-solana-green/10 text-solana-green border border-solana-green/30 flex-shrink-0 text-lg font-mono font-bold">
            01
          </div>
          <div className="space-y-3 max-w-2xl">
            <h3 className="text-xl font-bold text-planet-text">
              1. Discover Gear in Your Campus Neighborhood
            </h3>
            <p className="text-sm text-planet-muted leading-relaxed">
              Explore cameras, backpacking gear, power tools, projectors, or textbooks listed
              by verified students in your campus hub. Review item condition, included accessories,
              care rules, and general public meeting locations like libraries and student centers.
            </p>
            <div className="p-3.5 rounded-xl border border-planet-border bg-surface-elevated text-xs text-planet-subtle">
              💡 <strong>Safety Standard:</strong> Exact personal dorm addresses and phone numbers
              are never exposed on public listings.
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col md:flex-row gap-8 items-start border-b border-planet-border pb-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-solana-purple/20 text-purple-300 border border-solana-purple/40 flex-shrink-0 text-lg font-mono font-bold">
            02
          </div>
          <div className="space-y-3 max-w-2xl">
            <h3 className="text-xl font-bold text-planet-text">
              2. Book with Solana Smart Escrow Custody
            </h3>
            <p className="text-sm text-planet-muted leading-relaxed">
              When you reserve an item, the rental fee and a refundable security deposit are locked
              in an auditable Solana Devnet Program Derived Address (PDA). The lender does not
              receive the payout until return is confirmed, and your deposit is protected.
            </p>
            <div className="p-3.5 rounded-xl border border-planet-border bg-surface-elevated text-xs text-planet-subtle">
              🔒 <strong>Smart Escrow:</strong> We use an Anchor program with checked math, explicit
              state transitions, and mutual resolution locks. No hidden service charges.
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col md:flex-row gap-8 items-start border-b border-planet-border pb-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-solana-green/10 text-solana-green border border-solana-green/30 flex-shrink-0 text-lg font-mono font-bold">
            03
          </div>
          <div className="space-y-3 max-w-2xl">
            <h3 className="text-xl font-bold text-planet-text">
              3. Handover with Verifiable Photographic Checklists
            </h3>
            <p className="text-sm text-planet-muted leading-relaxed">
              Meet in person at the agreed public location. Both parties inspect the equipment
              together, tick through the functionality and accessories checklist, and upload
              timestamped condition photos right from their phone.
            </p>
            <div className="p-3.5 rounded-xl border border-planet-border bg-surface-elevated text-xs text-planet-subtle">
              📸 <strong>Dual Acknowledgement:</strong> Neither party can silently overwrite previous
              evidence. If either party notices pre-existing wear, it is documented before handover.
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex flex-col md:flex-row gap-8 items-start border-b border-planet-border pb-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-solana-purple/20 text-purple-300 border border-solana-purple/40 flex-shrink-0 text-lg font-mono font-bold">
            04
          </div>
          <div className="space-y-3 max-w-2xl">
            <h3 className="text-xl font-bold text-planet-text">
              4. Return, Escrow Release & PlanetPass Credential
            </h3>
            <p className="text-sm text-planet-muted leading-relaxed">
              When the item is returned in good order, the lender confirms completion in the app.
              The escrow contract instantly transfers the rental payout to the lender and refunds
              100% of the security deposit back to the borrower.
            </p>
            <p className="text-sm text-planet-muted leading-relaxed">
              Successful completions feed into your portable <strong className="text-purple-300">PlanetPass</strong> credential,
              allowing you to prove reliable rental history on external marketplaces.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Principles Callout */}
      <div className="rounded-2xl border border-planet-border bg-surface-primary p-8 space-y-4">
        <h3 className="text-lg font-bold text-planet-text">Our Honest Platform Principles</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-planet-muted leading-relaxed">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-solana-green flex-shrink-0 mt-0.5" />
            <span>We never claim blockchain can magically prove physical return. We use real evidence checklists & human review.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-solana-green flex-shrink-0 mt-0.5" />
            <span>Missing rental history is never treated as negative evidence. Every newcomer starts with a clean slate.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-solana-green flex-shrink-0 mt-0.5" />
            <span>Personal contact information and identity papers stay strictly off-chain and private.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-solana-green flex-shrink-0 mt-0.5" />
            <span>Disputes are arbitrated by authorized student council reviewers with clear rights of appeal.</span>
          </li>
        </ul>
      </div>

      {/* CTA Bottom */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-8 rounded-2xl border border-solana-green/30 bg-solana-green/5">
        <div>
          <h3 className="text-lg font-bold text-planet-text">Ready to share within your community?</h3>
          <p className="text-xs text-planet-muted mt-1">Start by exploring available gear or listing items you own.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/explore">
            <Button variant="primary" size="md">
              Explore Items
            </Button>
          </Link>
          <Link href="/dashboard/listings/new">
            <Button variant="secondary" size="md">
              List an Item
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
