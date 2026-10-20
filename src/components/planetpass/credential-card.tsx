import React from "react";
import { formatPublicKey } from "@/lib/solana";
import { formatDate } from "@/lib/utils";
import { computeTrustAssessment } from "@/lib/planetpass-crypto";
import { ShieldCheck, Calendar, Key, CheckCircle, AlertCircle, Share2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PlanetPassCardProps {
  id: string;
  issuerId: string;
  issuerName: string;
  status: string;
  issuanceDate: string | Date;
  expirationDate?: string | Date | null;
  historyCoverageStart: string | Date;
  historyCoverageEnd: string | Date;
  rentalsCompleted: number;
  onTimeReturnRatePercent: number;
  disputeFreeRatePercent: number;
  itemsShared: number;
  signatureHex: string;
  onShare?: () => void;
}

export function PlanetPassCard({
  id,
  issuerId,
  issuerName,
  status,
  issuanceDate,
  expirationDate,
  historyCoverageStart,
  historyCoverageEnd,
  rentalsCompleted,
  onTimeReturnRatePercent,
  disputeFreeRatePercent,
  itemsShared,
  signatureHex,
  onShare,
}: PlanetPassCardProps) {
  const trust = computeTrustAssessment(
    rentalsCompleted,
    onTimeReturnRatePercent,
    disputeFreeRatePercent
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-solana-purple/30 bg-gradient-to-br from-[#1C2430] via-surface-primary to-[#161B22] p-6 shadow-glow-purple text-planet-text">
      {/* Background cryptographic watermark pattern */}
      <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-solana-purple/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-planet-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-solana-purple/20 border border-solana-purple/40 text-purple-300">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-planet-text tracking-tight">
                PlanetPass Portable Credential
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {status}
              </span>
            </div>
            <p className="text-xs text-planet-muted font-mono">{issuerName}</p>
          </div>
        </div>

        {onShare && (
          <Button
            variant="purple"
            size="sm"
            onClick={onShare}
            className="gap-1.5 self-start sm:self-auto"
          >
            <Share2 className="h-4 w-4" />
            <span>Consent & Share</span>
          </Button>
        )}
      </div>

      {/* Trust Assessment Banner */}
      <div className="my-5 rounded-xl border border-planet-border/60 bg-[#0D1117]/60 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-planet-muted">
            Evidence-Aware Trust Assessment
          </span>
          <span className="text-xs font-mono font-bold text-solana-green">
            {trust.title}
          </span>
        </div>
        <p className="text-xs text-planet-text leading-relaxed">
          {trust.explanation}
        </p>
      </div>

      {/* Verifiable Metric Claims Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="rounded-xl border border-planet-border bg-surface-elevated/80 p-3 text-center">
          <span className="text-[10px] uppercase font-semibold text-planet-subtle tracking-wider">
            Completed Rentals
          </span>
          <div className="text-xl font-bold font-mono text-planet-text mt-1">
            {rentalsCompleted}
          </div>
        </div>

        <div className="rounded-xl border border-planet-border bg-surface-elevated/80 p-3 text-center">
          <span className="text-[10px] uppercase font-semibold text-planet-subtle tracking-wider">
            On-Time Return Rate
          </span>
          <div className="text-xl font-bold font-mono text-solana-green mt-1">
            {onTimeReturnRatePercent.toFixed(1)}%
          </div>
        </div>

        <div className="rounded-xl border border-planet-border bg-surface-elevated/80 p-3 text-center">
          <span className="text-[10px] uppercase font-semibold text-planet-subtle tracking-wider">
            Dispute-Free Record
          </span>
          <div className="text-xl font-bold font-mono text-purple-300 mt-1">
            {disputeFreeRatePercent.toFixed(1)}%
          </div>
        </div>

        <div className="rounded-xl border border-planet-border bg-surface-elevated/80 p-3 text-center">
          <span className="text-[10px] uppercase font-semibold text-planet-subtle tracking-wider">
            Items Shared
          </span>
          <div className="text-xl font-bold font-mono text-planet-text mt-1">
            {itemsShared}
          </div>
        </div>
      </div>

      {/* Metadata & Cryptographic Proof Details */}
      <div className="space-y-2 pt-4 border-t border-planet-border/60 text-xs">
        <div className="flex flex-col sm:flex-row sm:justify-between text-planet-muted gap-1">
          <span>
            History Period: {formatDate(historyCoverageStart)} – {formatDate(historyCoverageEnd)}
          </span>
          <span>
            Issued: {formatDate(issuanceDate)}
            {expirationDate && ` • Expires: ${formatDate(expirationDate)}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-planet-subtle pt-1">
          <Key className="h-3 w-3 text-solana-purple flex-shrink-0" />
          <span className="truncate">
            Issuer DID: {issuerId} • Sig: {signatureHex.slice(0, 18)}...
          </span>
        </div>
      </div>
    </div>
  );
}
