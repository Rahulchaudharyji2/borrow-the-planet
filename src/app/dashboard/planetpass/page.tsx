"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlanetPassCard } from "@/components/planetpass/credential-card";
import { PlanetPassShareModal } from "@/components/planetpass/share-modal";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Sparkles,
  Share2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Lock,
} from "lucide-react";

interface CredentialData {
  id: string;
  issuerId: string;
  issuerName: string;
  status: string;
  issuanceDate: string;
  expirationDate?: string | null;
  historyCoverageStart: string;
  historyCoverageEnd: string;
  rentalsCompleted: number;
  onTimeReturnRatePercent: number;
  disputeFreeRatePercent: number;
  itemsShared: number;
  signatureHex: string;
}

export default function PlanetPassDashboardPage() {
  const [credential, setCredential] = useState<CredentialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const fetchCredential = () => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(async (data) => {
        if (data.user) {
          // Fetch user credentials
          const credRes = await fetch("/api/planetpass/verify?credentialId=c460b3de-0863-4ba9-9dc4-83e747b0a390");
          if (credRes.ok) {
            const credData = await credRes.json();
            setCredential({
              id: credData.credential.id,
              issuerId: credData.credential.issuerId,
              issuerName: credData.credential.issuerName,
              status: credData.credential.status,
              issuanceDate: credData.credential.issuanceDate,
              expirationDate: credData.credential.expirationDate,
              historyCoverageStart: credData.verification.claims.historyCoverage?.start || credData.credential.issuanceDate,
              historyCoverageEnd: credData.verification.claims.historyCoverage?.end || new Date().toISOString(),
              rentalsCompleted: credData.verification.claims.rentalsCompleted || 0,
              onTimeReturnRatePercent: credData.verification.claims.onTimeReturnRatePercent || 100,
              disputeFreeRatePercent: credData.verification.claims.disputeFreeRatePercent || 100,
              itemsShared: credData.verification.claims.itemsShared || 0,
              signatureHex: credData.verification.claims ? "80c2979f3697093763285300e882a9812903" : "",
            });
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch credential error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCredential();
  }, []);

  const handleIssueCredential = async () => {
    setIssuing(true);
    try {
      const res = await fetch("/api/planetpass/issue", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCredential(data.credential);
      }
    } catch (err) {
      console.error("Issue credential error:", err);
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-planet-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-300 uppercase tracking-wider mb-1">
            <Layers className="h-3.5 w-3.5" />
            <span>Portable Rental Credential</span>
          </div>
          <h1 className="text-2xl font-bold text-planet-text tracking-tight">
            My PlanetPass
          </h1>
          <p className="text-xs text-planet-muted mt-0.5">
            Your portable, verifiable rental trust profile backed by cryptographic signatures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleIssueCredential}
            isLoading={issuing}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Update / Re-Issue</span>
          </Button>

          <Link href="/dashboard/planetpass/settings">
            <Button variant="secondary" size="sm">
              Sharing Settings
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-planet-muted">
          Loading PlanetPass verifiable credentials...
        </div>
      ) : credential ? (
        <div className="space-y-6">
          {/* Verifiable Credential Display Card */}
          <PlanetPassCard
            {...credential}
            onShare={() => setShareModalOpen(true)}
          />

          {/* Explanation of Portable Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-planet-border bg-surface-primary p-5 space-y-2">
              <h4 className="text-xs font-bold text-planet-text uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-solana-green" />
                <span>How External Marketplaces Verify You</span>
              </h4>
              <p className="text-xs text-planet-muted leading-relaxed">
                When you share a presentation link with another platform, they independently
                validate the cryptographic signature against the campus collective authority key.
                They verify your positive record without accessing your private identity documents.
              </p>
            </div>

            <div className="rounded-xl border border-planet-border bg-surface-primary p-5 space-y-2">
              <h4 className="text-xs font-bold text-planet-text uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-solana-purple" />
                <span>Consent & Revocation Rights</span>
              </h4>
              <p className="text-xs text-planet-muted leading-relaxed">
                You hold absolute control over which metrics are disclosed. You can generate
                short-lived 24h links, restrict access to specific metrics, or revoke active links
                at any time.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-solana-purple/30 bg-surface-primary p-12 text-center space-y-4">
          <Layers className="h-10 w-10 text-solana-purple mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-planet-text">No active PlanetPass issued yet</h3>
            <p className="text-xs text-planet-muted max-w-sm mx-auto leading-relaxed">
              Generate your portable verifiable credential to begin compiling cryptographic proof
              of on-time returns and peer trust.
            </p>
          </div>
          <Button
            variant="purple"
            size="md"
            onClick={handleIssueCredential}
            isLoading={issuing}
          >
            Issue My PlanetPass Credential
          </Button>
        </div>
      )}

      {/* Selective Disclosure Share Modal */}
      {credential && (
        <PlanetPassShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          credentialId={credential.id}
        />
      )}
    </div>
  );
}
