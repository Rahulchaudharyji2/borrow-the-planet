"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Copy, Check, ExternalLink, Lock } from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentialId: string;
}

export function PlanetPassShareModal({ open, onOpenChange, credentialId }: ShareModalProps) {
  const [selectedClaims, setSelectedClaims] = useState<string[]>([
    "rentalsCompleted",
    "onTimeReturnRatePercent",
    "historyCoverage",
    "campus",
  ]);
  const [purpose, setPurpose] = useState("External marketplace rental application");
  const [expiryHours, setExpiryHours] = useState(48);
  const [loading, setLoading] = useState(false);
  const [shareResult, setShareResult] = useState<{
    verifyUrl: string;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleClaim = (claim: string) => {
    if (selectedClaims.includes(claim)) {
      if (selectedClaims.length === 1) return; // Keep at least one
      setSelectedClaims(selectedClaims.filter((c) => c !== claim));
    } else {
      setSelectedClaims([...selectedClaims, claim]);
    }
  };

  const handleGeneratePresentation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/planetpass/present", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentialId,
          disclosedClaims: selectedClaims,
          purpose,
          expiryHours,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate presentation");

      setShareResult({
        verifyUrl: data.verifyUrl,
        expiresAt: data.expiresAt,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareResult) {
      navigator.clipboard.writeText(shareResult.verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share PlanetPass Credential</DialogTitle>
          <DialogDescription>
            You control what information is shared. External marketplaces can cryptographically
            verify only the attributes you explicitly consent to disclose.
          </DialogDescription>
        </DialogHeader>

        {shareResult ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl border border-solana-purple/30 bg-solana-purple/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-solana-purple" />
                <span>Consent-Based Presentation Generated</span>
              </div>
              <p className="text-xs text-planet-muted leading-relaxed">
                This link allows any compatible marketplace to verify your selected claims without
                access to your private identity documents, address, or unconsented data.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareResult.verifyUrl}
                  className="w-full h-10 px-3 rounded-lg border border-planet-border bg-[#0D1117] text-xs font-mono text-planet-text select-all"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1 flex-shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-solana-green" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>

              <div className="text-[11px] text-planet-subtle">
                Expires in {expiryHours} hours • Access-controlled & revokable
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <a
                href={shareResult.verifyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-solana-green hover:underline flex items-center gap-1"
              >
                <span>Test Verifier View</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShareResult(null);
                  onOpenChange(false);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGeneratePresentation} className="space-y-4">
            {/* Selective Disclosure Checkboxes */}
            <div className="rounded-xl border border-planet-border bg-surface-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-planet-text">
                  Consented Claims (Selective Disclosure)
                </span>
                <Lock className="h-3.5 w-3.5 text-solana-purple" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0D1117]/60 border border-planet-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClaims.includes("rentalsCompleted")}
                    onChange={() => toggleClaim("rentalsCompleted")}
                    className="h-4 w-4 rounded border-planet-border text-solana-green focus:ring-solana-green"
                  />
                  <span>Total Rentals Completed</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0D1117]/60 border border-planet-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClaims.includes("onTimeReturnRatePercent")}
                    onChange={() => toggleClaim("onTimeReturnRatePercent")}
                    className="h-4 w-4 rounded border-planet-border text-solana-green focus:ring-solana-green"
                  />
                  <span>On-Time Return Rate</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0D1117]/60 border border-planet-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClaims.includes("disputeFreeRatePercent")}
                    onChange={() => toggleClaim("disputeFreeRatePercent")}
                    className="h-4 w-4 rounded border-planet-border text-solana-green focus:ring-solana-green"
                  />
                  <span>Dispute-Free Rate</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0D1117]/60 border border-planet-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClaims.includes("campus")}
                    onChange={() => toggleClaim("campus")}
                    className="h-4 w-4 rounded border-planet-border text-solana-green focus:ring-solana-green"
                  />
                  <span>Campus Community Hub</span>
                </label>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
                Sharing Purpose (Optional Context)
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. PeerGear Camera Rental Application"
                className="w-full h-10 px-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none"
              />
            </div>

            {/* Expiration selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
                Presentation Expiry
              </label>
              <select
                value={expiryHours}
                onChange={(e) => setExpiryHours(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none cursor-pointer"
              >
                <option value={24}>24 Hours (Recommended for single rental)</option>
                <option value={48}>48 Hours (Standard)</option>
                <option value={168}>7 Days (Extended)</option>
                <option value={720}>30 Days (Ongoing membership)</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="purple"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              Generate Verifiable Share Link
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
