"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Lock, AlertTriangle, Key, ExternalLink } from "lucide-react";

export default function PlanetPassSettingsPage() {
  const [revokedMessage, setRevokedMessage] = useState<string | null>(null);

  const handleRevokePresentation = (token: string) => {
    setRevokedMessage(`Presentation token ${token.slice(0, 10)}... has been revoked. External verifications using this token will now fail.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-planet-border pb-4">
        <Link href="/dashboard/planetpass" className="text-planet-muted hover:text-planet-text">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-planet-text tracking-tight">
            PlanetPass Credential & Privacy Settings
          </h1>
          <p className="text-xs text-planet-muted mt-0.5">
            Manage selective disclosure consent, active share tokens, and revocation policies.
          </p>
        </div>
      </div>

      {revokedMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400">
          {revokedMessage}
        </div>
      )}

      {/* Active Presentations List */}
      <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-4">
        <h3 className="text-sm font-bold text-planet-text uppercase tracking-wider">
          Active Shared Presentations
        </h3>
        <p className="text-xs text-planet-muted leading-relaxed">
          These are temporary links you previously consented to share with external rental platforms.
        </p>

        <div className="space-y-3 pt-2">
          <div className="rounded-xl border border-planet-border bg-surface-elevated p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-planet-text">
                  Camera Equipment Application (PeerGear)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400">
                  Active
                </span>
              </div>
              <p className="text-[11px] font-mono text-planet-subtle">
                Token: share_token_alice_verified_pass_2026 • Access count: 3
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/verify/c460b3de-0863-4ba9-9dc4-83e747b0a390?token=share_token_alice_verified_pass_2026"
                target="_blank"
              >
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <span>Inspect</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRevokePresentation("share_token_alice_verified_pass_2026")}
                className="text-xs text-planet-danger hover:text-red-400"
              >
                Revoke Link
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Revocation & Correction Guidelines */}
      <div className="rounded-2xl border border-planet-border bg-surface-elevated p-6 space-y-4">
        <h3 className="text-sm font-bold text-planet-text uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-solana-purple" />
          <span>Correction & Appeal Protocol</span>
        </h3>
        <p className="text-xs text-planet-muted leading-relaxed">
          If you believe a metric on your PlanetPass credential is inaccurate due to an error,
          delayed checklist sync, or an overturned dispute finding:
        </p>
        <ul className="list-disc pl-5 text-xs text-planet-muted space-y-1.5 leading-relaxed">
          <li>
            <strong>Automatic Sync:</strong> Updating or re-issuing your credential will re-calculate metrics
            from all verified database booking records.
          </li>
          <li>
            <strong>Dispute Corrections:</strong> If an incident was resolved or corrected by an arbiter,
            your dispute-free percentage updates immediately upon re-issuance.
          </li>
          <li>
            <strong>Issuer Key Rotation:</strong> Credentials signed by revoked or superseded keys are
            flagged on receiving platforms, ensuring cryptographic integrity.
          </li>
        </ul>
      </div>
    </div>
  );
}
