import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Camera,
  FileCheck,
  CheckCircle2,
  HelpCircle,
  Scale,
} from "lucide-react";

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Page Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-solana-green">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Trust & Protection</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-planet-text">
          Trust, Safety & Incident Handling
        </h1>
        <p className="text-base text-planet-muted leading-relaxed">
          How Borrow the Planet safeguards peer rentals using Solana Devnet escrows,
          verifiable condition evidence, and a fair human arbitration model.
        </p>
      </div>

      {/* Safety Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-solana-green/10 text-solana-green">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-planet-text">Refundable Escrow Deposits</h3>
          <p className="text-xs text-planet-muted leading-relaxed">
            Borrowers place a security deposit into the smart escrow account prior to handover.
            If the item is returned on time and undamaged, 100% of the deposit is refunded.
          </p>
        </div>

        <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-solana-purple/20 text-purple-300">
            <Camera className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-planet-text">Auditable Photo Checklists</h3>
          <p className="text-xs text-planet-muted leading-relaxed">
            Before handing over equipment, both parties inspect items together and submit
            photo evidence. History cannot be silently overwritten or modified after the fact.
          </p>
        </div>

        <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <Scale className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-planet-text">Fair Incident Review</h3>
          <p className="text-xs text-planet-muted leading-relaxed">
            In the event of damage or a missing cable, funds remain locked in escrow while an
            authorized reviewer audits evidence and resolves the matter with written rationale.
          </p>
        </div>
      </div>

      {/* Incident Handling Workflow */}
      <div id="disputes" className="rounded-2xl border border-planet-border bg-surface-elevated p-8 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-mono uppercase text-solana-green tracking-wider">Dispute Protocol</span>
          <h2 className="text-2xl font-bold text-planet-text tracking-tight">
            How Incidents Are Handled
          </h2>
          <p className="text-xs text-planet-muted leading-relaxed">
            We follow a structured incident progression designed to prevent knee-jerk accusations
            and give both parties ample opportunity to respond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-planet-border bg-surface-primary space-y-2">
            <span className="font-mono text-amber-400 font-bold">State 1: REPORTED</span>
            <p className="text-planet-muted">
              Lender or borrower reports an issue (e.g. missing accessory, delayed return).
              Escrow release is paused automatically.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-planet-border bg-surface-primary space-y-2">
            <span className="font-mono text-blue-400 font-bold">State 2: AWAITING RESPONSE</span>
            <p className="text-planet-muted">
              The counter-party is alerted and can submit counter-evidence, photos, or arrange
              for immediate return of forgotten accessories.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-planet-border bg-surface-primary space-y-2">
            <span className="font-mono text-purple-300 font-bold">State 3: UNDER REVIEW</span>
            <p className="text-planet-muted">
              An authorized campus review officer reviews handover vs. return photo records
              and checklist signatures.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-planet-border bg-surface-primary space-y-2">
            <span className="font-mono text-solana-green font-bold">State 4: RESOLVED / APPEALED</span>
            <p className="text-planet-muted">
              Reviewer issues a documented ruling. Deductions are capped at exact replacement
              costs. Users maintain a formal appeal right.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Platform Disclosure Banner */}
      <div className="p-6 rounded-2xl border border-planet-border bg-[#0D1117] space-y-3">
        <h4 className="text-sm font-bold text-planet-text flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>Honest Platform Disclosure</span>
        </h4>
        <p className="text-xs text-planet-muted leading-relaxed">
          No technology, blockchain, or automated algorithm can guarantee zero risk or physically
          prevent someone from misplacing an item. Anyone claiming otherwise is misleading you.
          Our platform minimizes risk through transparency: escrow deposits provide financial backing,
          photographic evidence minimizes ambiguity, and clear human mediation provides justice.
        </p>
      </div>
    </div>
  );
}
