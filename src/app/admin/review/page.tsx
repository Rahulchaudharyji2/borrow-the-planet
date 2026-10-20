"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Shield,
  Scale,
  Camera,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  ArrowLeft,
  Coins,
} from "lucide-react";

interface AdminDispute {
  id: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  depositDeductionCents?: number | null;
  resolutionNotes?: string | null;
  booking: {
    id: string;
    rentalSubtotalCents: number;
    depositCents: number;
    listing: { title: string };
    handoverRecord?: any;
    returnRecord?: any;
  };
  reporter: { id: string; name: string; email: string };
  respondent: { id: string; name: string; email: string };
  reviewer?: { name: string } | null;
  messages: any[];
}

export default function AdminReviewPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Resolution form state
  const [resolutionStatus, setResolutionStatus] = useState<
    "RESOLVED" | "SUBSTANTIATED" | "NOT_SUBSTANTIATED" | "CORRECTED"
  >("RESOLVED");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [deductionAmount, setDeductionAmount] = useState(0);
  const [resolving, setResolving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAdminDisputes = () => {
    fetch("/api/disputes")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or forbidden");
        return res.json();
      })
      .then((data) => {
        setDisputes(data.disputes || []);
        if (data.disputes && data.disputes.length > 0 && !selectedId) {
          setSelectedId(data.disputes[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdminDisputes();
  }, []);

  const selectedDispute = disputes.find((d) => d.id === selectedId);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !resolutionNotes.trim()) return;
    setResolving(true);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/disputes/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: resolutionStatus,
          resolutionNotes,
          depositDeductionCents: deductionAmount * 100,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resolve dispute");

      setSuccessMessage(
        `Dispute successfully finalized with status [${resolutionStatus}]. Rationale and escrow settlement logged to audit trail.`
      );
      fetchAdminDisputes();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to resolve dispute");
      }
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-xs text-planet-muted">
        Verifying reviewer credentials and loading incident docket...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-planet-border pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 uppercase tracking-wider">
            <Shield className="h-4 w-4" />
            <span>Authorized Arbiter Docket</span>
          </div>
          <h1 className="text-2xl font-bold text-planet-text tracking-tight">
            Incident Review & Dispute Arbitration
          </h1>
          <p className="text-xs text-planet-muted">
            Independent evidence auditing, checklist inspection, and fair escrow settlement determinations.
          </p>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
        </Link>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300">
          {successMessage}
        </div>
      )}

      {disputes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Dispute List (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-planet-muted">
              Active Docket ({disputes.length})
            </h3>
            {disputes.map((d) => (
              <div
                key={d.id}
                onClick={() => {
                  setSelectedId(d.id);
                  setSuccessMessage(null);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                  selectedId === d.id
                    ? "border-amber-500/60 bg-amber-500/10 shadow-sm"
                    : "border-planet-border bg-surface-primary hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-amber-400">
                    {d.category.replace("_", " ")}
                  </span>
                  <Badge variant={d.status === "RESOLVED" ? "success" : "warning"}>
                    {d.status}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-planet-text truncate">
                  {d.booking.listing.title}
                </h4>
                <div className="text-[11px] text-planet-muted">
                  Reporter: {d.reporter.name} vs. {d.respondent.name}
                </div>
              </div>
            ))}
          </div>

          {/* Active Review Workspace (Right 8 cols) */}
          <div className="lg:col-span-8">
            {selectedDispute ? (
              <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-6">
                {/* Dispute Metadata */}
                <div className="border-b border-planet-border pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                      Incident Category: {selectedDispute.category.replace("_", " ")}
                    </span>
                    <Badge variant={selectedDispute.status === "RESOLVED" ? "success" : "warning"}>
                      Status: {selectedDispute.status}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-planet-text">
                    {selectedDispute.booking.listing.title}
                  </h2>
                  <p className="text-xs text-planet-muted leading-relaxed">
                    Filed on {formatDate(selectedDispute.createdAt)} • Reporter:{" "}
                    <strong className="text-planet-text">{selectedDispute.reporter.name}</strong>{" "}
                    ({selectedDispute.reporter.email}) • Respondent:{" "}
                    <strong className="text-planet-text">{selectedDispute.respondent.name}</strong>
                  </p>
                </div>

                {/* Evidence Comparison: Handover vs Return */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-planet-text flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-solana-green" />
                    <span>Auditable Evidence & Photographic Record</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Handover Evidence */}
                    <div className="rounded-xl border border-planet-border bg-surface-elevated p-4 space-y-2 text-xs">
                      <span className="font-bold text-planet-text block">1. Handover Milestone</span>
                      <p className="text-planet-muted">
                        Notes: {selectedDispute.booking.handoverRecord?.conditionNotes || "Standard condition confirmed"}
                      </p>
                      {selectedDispute.booking.handoverRecord?.photoUrls && (
                        <div className="flex gap-2 pt-1">
                          {JSON.parse(selectedDispute.booking.handoverRecord.photoUrls || "[]").map(
                            (url: string, i: number) => (
                              <img
                                key={i}
                                src={url}
                                alt="Handover Proof"
                                className="h-16 w-16 rounded object-cover border border-planet-border"
                              />
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Return Evidence */}
                    <div className="rounded-xl border border-planet-border bg-surface-elevated p-4 space-y-2 text-xs">
                      <span className="font-bold text-planet-text block">2. Return Milestone</span>
                      <p className="text-planet-muted">
                        Comparison: {selectedDispute.booking.returnRecord?.conditionComparisonNotes || "Flagged incident at drop-off"}
                      </p>
                      {selectedDispute.booking.returnRecord?.returnPhotoUrls && (
                        <div className="flex gap-2 pt-1">
                          {JSON.parse(selectedDispute.booking.returnRecord.returnPhotoUrls || "[]").map(
                            (url: string, i: number) => (
                              <img
                                key={i}
                                src={url}
                                alt="Return Proof"
                                className="h-16 w-16 rounded object-cover border border-planet-border"
                              />
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Incident Description */}
                <div className="rounded-xl border border-planet-border bg-[#0D1117] p-4 space-y-1.5 text-xs">
                  <span className="font-bold text-planet-text uppercase text-[10px] tracking-wider block">
                    Claim Description:
                  </span>
                  <p className="text-planet-muted leading-relaxed">
                    {selectedDispute.description}
                  </p>
                </div>

                {/* Reviewer Determination Form */}
                <form
                  onSubmit={handleResolve}
                  className="rounded-xl border border-amber-500/30 bg-surface-elevated p-5 space-y-4"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Scale className="h-4 w-4" />
                    <span>Issue Reviewer Ruling & Escrow Instruction</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
                        Ruling Outcome
                      </label>
                      <select
                        value={resolutionStatus}
                        onChange={(e) => setResolutionStatus(e.target.value as any)}
                        className="w-full h-10 px-3 rounded-lg border border-planet-border bg-[#0D1117] text-xs text-planet-text focus:border-solana-green focus:outline-none cursor-pointer"
                      >
                        <option value="RESOLVED">Resolved (Mutual Settlement / Return Finished)</option>
                        <option value="SUBSTANTIATED">Substantiated Claim (Valid damage/loss)</option>
                        <option value="NOT_SUBSTANTIATED">Not Substantiated (Dismissed without penalty)</option>
                        <option value="CORRECTED">Corrected Record (Mistake rectified)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
                        Deposit Deduction Amount ($ USD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={deductionAmount}
                        onChange={(e) => setDeductionAmount(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-lg border border-planet-border bg-[#0D1117] text-xs text-planet-text focus:border-solana-green focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
                      Written Rationale & Findings (Required)
                    </label>
                    <textarea
                      rows={3}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Explain findings, evidence examined, and reason for deduction or dismissal..."
                      className="w-full p-3 rounded-lg border border-planet-border bg-[#0D1117] text-xs text-planet-text focus:border-solana-green focus:outline-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={resolving}
                    className="w-full font-bold"
                  >
                    Execute Official Determination
                  </Button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-planet-border bg-surface-primary p-12 text-center text-xs text-planet-muted">
                Select an incident from the docket to review evidence
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-planet-border bg-surface-primary p-12 text-center space-y-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-planet-text">Docket Empty — No Active Incidents</h3>
          <p className="text-xs text-planet-muted">
            All campus peer rentals are currently operating without unresolved disputes.
          </p>
        </div>
      )}
    </div>
  );
}
