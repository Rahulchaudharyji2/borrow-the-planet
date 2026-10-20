"use client";

import React, { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  ExternalLink,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface VerificationPayload {
  valid: boolean;
  tamperEvident: boolean;
  status: string;
  trustAssessment: {
    level: string;
    title: string;
    explanation: string;
  };
  checks: {
    signatureValid: boolean;
    issuerTrusted: boolean;
    notExpired: boolean;
    statusActive: boolean;
    historyCoverageSufficient: boolean;
  };
  claims: {
    rentalsCompleted?: number;
    onTimeReturnRatePercent?: number;
    itemsShared?: number;
    disputeFreeRatePercent?: number;
    campus?: string;
    historyCoverage?: { start: string; end: string };
  };
  issuer: {
    id: string;
    name: string;
  };
  verifiedAt: string;
}

export default function VerifyCredentialPage({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}) {
  const { credentialId } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [data, setData] = useState<{
    verification: VerificationPayload;
    credential: {
      id: string;
      issuerId: string;
      issuerName: string;
      schemaVersion: string;
      issuanceDate: string;
      expirationDate?: string;
      status: string;
    };
    presentation?: {
      purpose?: string;
      accessCount: number;
      expiresAt: string;
    } | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/planetpass/verify?credentialId=${credentialId}&token=${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Credential not found on issuer network");
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [credentialId, token]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center space-y-4">
        <div className="mx-auto h-8 w-8 rounded-full border-2 border-solana-purple border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-planet-muted">
          Executing cryptographic verification pipeline against issuer registry...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-planet-text">Verification Failed</h2>
        <p className="text-xs text-planet-muted">
          {error || "The specified credential could not be verified on the issuer network."}
        </p>
      </div>
    );
  }

  const { verification, credential, presentation } = data;
  const isHealthy = verification.valid;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Verification Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-solana-purple/15 text-purple-300 border border-solana-purple/30">
          <Layers className="h-3.5 w-3.5" />
          <span>Independent Platform Verifier</span>
        </div>
        <h1 className="text-3xl font-extrabold text-planet-text tracking-tight">
          PlanetPass Verification Result
        </h1>
        <p className="text-xs text-planet-muted max-w-md mx-auto">
          Tamper-evident verification executed against authorized campus trust issuer registry.
        </p>
      </div>

      {/* Main Status Badge Card */}
      <div
        className={`rounded-2xl border p-6 text-center space-y-3 ${
          isHealthy
            ? "border-emerald-500/40 bg-emerald-500/5 shadow-glow"
            : "border-rose-500/40 bg-rose-500/5"
        }`}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated">
          {isHealthy ? (
            <ShieldCheck className="h-9 w-9 text-emerald-400" />
          ) : (
            <ShieldAlert className="h-9 w-9 text-rose-400" />
          )}
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-planet-subtle">
            Verification Outcome
          </span>
          <h2
            className={`text-2xl font-bold tracking-tight ${
              isHealthy ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isHealthy ? "Cryptographically Valid Credential" : `Status: ${verification.status}`}
          </h2>
        </div>

        {/* Evidence-aware Trust Assessment explanation */}
        <div className="max-w-xl mx-auto rounded-xl border border-planet-border bg-[#0D1117] p-4 text-left space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-planet-subtle">
              Evidence Trust Tier
            </span>
            <span className="text-xs font-bold font-mono text-solana-green">
              {verification.trustAssessment.title}
            </span>
          </div>
          <p className="text-xs text-planet-muted leading-relaxed">
            {verification.trustAssessment.explanation}
          </p>
        </div>
      </div>

      {/* Verification Pipeline Checks Breakdown */}
      <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-4">
        <h3 className="text-sm font-bold text-planet-text uppercase tracking-wider">
          Verification Pipeline Checks
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg border border-planet-border bg-surface-elevated">
            <span className="text-planet-text font-medium">Digital Signature Integrity (Tamper-Evidence)</span>
            <span
              className={`font-mono font-bold flex items-center gap-1 ${
                verification.checks.signatureValid ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {verification.checks.signatureValid ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> PASS
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" /> TAMPER DETECTED
                </>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-planet-border bg-surface-elevated">
            <span className="text-planet-text font-medium">Authorized Issuer Trust Anchor</span>
            <span
              className={`font-mono font-bold flex items-center gap-1 ${
                verification.checks.issuerTrusted ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" /> TRUSTED ISSUER
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-planet-border bg-surface-elevated">
            <span className="text-planet-text font-medium">Presentation & Credential Expiration</span>
            <span
              className={`font-mono font-bold flex items-center gap-1 ${
                verification.checks.notExpired ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {verification.checks.notExpired ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> VALID
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" /> EXPIRED
                </>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-planet-border bg-surface-elevated">
            <span className="text-planet-text font-medium">Issuer Revocation Registry</span>
            <span
              className={`font-mono font-bold flex items-center gap-1 ${
                verification.checks.statusActive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {verification.checks.statusActive ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> ACTIVE
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" /> REVOKED
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Selectively Disclosed Consented Claims */}
      <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-planet-text uppercase tracking-wider">
            Consented Claims (Selective Disclosure)
          </h3>
          <span className="text-[11px] font-mono text-purple-300">Data Minimization Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {verification.claims.rentalsCompleted !== undefined && (
            <div className="p-3 rounded-xl border border-planet-border bg-surface-elevated text-center">
              <span className="text-[10px] text-planet-subtle uppercase block">Rentals Completed</span>
              <span className="text-lg font-bold font-mono text-planet-text">
                {verification.claims.rentalsCompleted}
              </span>
            </div>
          )}

          {verification.claims.onTimeReturnRatePercent !== undefined && (
            <div className="p-3 rounded-xl border border-planet-border bg-surface-elevated text-center">
              <span className="text-[10px] text-planet-subtle uppercase block">On-Time Return Rate</span>
              <span className="text-lg font-bold font-mono text-solana-green">
                {verification.claims.onTimeReturnRatePercent.toFixed(1)}%
              </span>
            </div>
          )}

          {verification.claims.disputeFreeRatePercent !== undefined && (
            <div className="p-3 rounded-xl border border-planet-border bg-surface-elevated text-center">
              <span className="text-[10px] text-planet-subtle uppercase block">Dispute-Free Rate</span>
              <span className="text-lg font-bold font-mono text-purple-300">
                {verification.claims.disputeFreeRatePercent.toFixed(1)}%
              </span>
            </div>
          )}

          {verification.claims.campus && (
            <div className="p-3 rounded-xl border border-planet-border bg-surface-elevated text-center col-span-2 sm:col-span-3">
              <span className="text-[10px] text-planet-subtle uppercase block">Campus Collective</span>
              <span className="text-xs font-semibold text-planet-text">
                {verification.claims.campus}
              </span>
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-[#0D1117] text-[11px] text-planet-subtle flex items-start gap-2">
          <Info className="h-4 w-4 text-planet-subtle flex-shrink-0 mt-0.5" />
          <span>
            Personal contact details, dorm addresses, and unconsented claims were not transmitted
            to this verifier, honoring the user&apos;s privacy boundary.
          </span>
        </div>
      </div>

      {/* Technical Audit Metadata */}
      <div className="rounded-xl border border-planet-border/60 bg-[#0D1117] p-4 text-xs font-mono text-planet-subtle space-y-1.5">
        <div>Credential ID: {credential.id}</div>
        <div>Issuer: {credential.issuerName} ({credential.issuerId})</div>
        <div>Verified At: {verification.verifiedAt}</div>
        {presentation && (
          <div>Presentation Access Count: {presentation.accessCount}</div>
        )}
      </div>
    </div>
  );
}
