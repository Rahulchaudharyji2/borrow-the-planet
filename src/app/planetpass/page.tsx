import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Layers,
  ShieldCheck,
  Lock,
  Share2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function PlanetPassPublicPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 bg-solana-purple/10">
          <Layers className="h-3.5 w-3.5 text-solana-purple" />
          <span>Core Differentiator</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-planet-text">
          PlanetPass: Trust Travels With You.
        </h1>
        <p className="text-base text-planet-muted leading-relaxed">
          A portable, privacy-conscious rental credential that proves your verified compliance
          history across compatible peer marketplaces without exposing sensitive personal documents.
        </p>
      </div>

      {/* The Core Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-3">
          <div className="text-xs font-mono uppercase text-rose-400 font-bold">The Problem</div>
          <h3 className="text-lg font-bold text-planet-text">Walled Gardens of Reputation</h3>
          <p className="text-xs text-planet-muted leading-relaxed">
            When you complete 20 respectful rentals on traditional platforms, your positive reputation
            is permanently trapped inside their database. When you join a new peer-to-peer network,
            you start with zero trust, high deposits, and unnecessary barriers.
          </p>
        </div>

        <div className="rounded-2xl border border-solana-purple/30 bg-solana-purple/10 p-6 space-y-3">
          <div className="text-xs font-mono uppercase text-purple-300 font-bold">The Solution</div>
          <h3 className="text-lg font-bold text-planet-text">Cryptographic Portable Credentials</h3>
          <p className="text-xs text-planet-muted leading-relaxed">
            PlanetPass credentials are mathematically signed by authorized campus collective issuers.
            Any receiving marketplace can independently verify the signature, validity, and rental
            history coverage without contacting a central gatekeeper.
          </p>
        </div>
      </div>

      {/* Cryptographic Architecture */}
      <div className="rounded-2xl border border-planet-border bg-surface-elevated p-8 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-mono uppercase text-solana-green tracking-wider">Protocol Architecture</span>
          <h2 className="text-2xl font-bold text-planet-text tracking-tight">
            How PlanetPass Cryptographic Verification Works
          </h2>
          <p className="text-xs text-planet-muted leading-relaxed">
            Built on canonical JSON hashing (RFC 8785) and digital signing keypairs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2.5 rounded-xl border border-planet-border bg-surface-primary p-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated font-mono font-bold text-purple-300">
              1
            </div>
            <h4 className="text-sm font-semibold text-planet-text">Authorized Issuer Signing</h4>
            <p className="text-xs text-planet-muted leading-relaxed">
              When rentals are completed, an authorized issuer signs versioned metric claims
              (total rentals, on-time percentage, dispute-free record) using a private key.
            </p>
          </div>

          <div className="space-y-2.5 rounded-xl border border-planet-border bg-surface-primary p-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated font-mono font-bold text-purple-300">
              2
            </div>
            <h4 className="text-sm font-semibold text-planet-text">Selective Disclosure Consent</h4>
            <p className="text-xs text-planet-muted leading-relaxed">
              You choose what to share. Generate short-lived presentation tokens revealing only
              specific metrics needed for a given rental deposit waiver.
            </p>
          </div>

          <div className="space-y-2.5 rounded-xl border border-planet-border bg-surface-primary p-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated font-mono font-bold text-purple-300">
              3
            </div>
            <h4 className="text-sm font-semibold text-planet-text">Independent Verification</h4>
            <p className="text-xs text-planet-muted leading-relaxed">
              The external platform verifies the digital signature against the issuer DID public key.
              Any tampering immediately causes verification to fail.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Philosophy Table */}
      <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-4">
        <h3 className="text-lg font-bold text-planet-text">Evidence-Aware Trust Tiers</h3>
        <p className="text-xs text-planet-muted">
          Our trust assessment algorithm never penalizes people for being new.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-planet-border text-planet-subtle uppercase font-mono text-[11px]">
                <th className="py-2.5 pr-4">Trust Tier</th>
                <th className="py-2.5 px-4">Requirement</th>
                <th className="py-2.5 pl-4">Platform Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-planet-border/50 text-planet-text">
              <tr>
                <td className="py-3 pr-4 font-bold text-solana-green">Established Proven Borrower</td>
                <td className="py-3 px-4 font-mono">8+ rentals, ≥95% on-time, ≥95% dispute-free</td>
                <td className="py-3 pl-4 text-planet-muted">Eligible for deposit waivers and instant rental approval.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-planet-text">Verified Community Member</td>
                <td className="py-3 px-4 font-mono">3–7 rentals, satisfactory compliance</td>
                <td className="py-3 pl-4 text-planet-muted">Satisfactory track record across campus collectives.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-amber-400">Insufficient History</td>
                <td className="py-3 px-4 font-mono">&lt; 3 verified rentals</td>
                <td className="py-3 pl-4 text-planet-muted">
                  <strong>Not a negative score.</strong> Indicates early-stage participation. Standard escrow deposit applies.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Verifier Demo Box */}
      <div className="rounded-2xl border border-solana-purple/40 bg-[#0D1117] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-planet-text">Try the Independent Verifier</h3>
          <p className="text-xs text-planet-muted max-w-lg">
            Inspect a pre-seeded verifiable presentation token for demo user Alice Vance and see the
            tamper-evident checks in action.
          </p>
        </div>

        <Link
          href="/verify/c460b3de-0863-4ba9-9dc4-83e747b0a390?token=share_token_alice_verified_pass_2026"
          className="flex-shrink-0"
        >
          <Button variant="purple" size="lg" className="gap-2">
            <span>Launch Verifier Page</span>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
