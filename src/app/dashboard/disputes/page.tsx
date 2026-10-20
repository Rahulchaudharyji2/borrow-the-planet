"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  AlertTriangle,
  Scale,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Shield,
  FileText,
} from "lucide-react";

interface DisputeRecord {
  id: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  resolutionNotes?: string | null;
  depositDeductionCents?: number | null;
  booking: {
    listing: { title: string };
  };
  reporter: { id: string; name: string };
  respondent: { id: string; name: string };
  reviewer?: { name: string } | null;
}

export default function UserDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [activeDisputeDetails, setActiveDisputeDetails] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchDisputes = () => {
    fetch("/api/disputes")
      .then((res) => res.json())
      .then((data) => {
        setDisputes(data.disputes || []);
        if (data.disputes && data.disputes.length > 0 && !selectedDisputeId) {
          setSelectedDisputeId(data.disputes[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch disputes error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    if (selectedDisputeId) {
      fetch(`/api/disputes/${selectedDisputeId}`)
        .then((res) => res.json())
        .then((data) => {
          setActiveDisputeDetails(data.dispute);
        })
        .catch(console.error);
    }
  }, [selectedDisputeId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedDisputeId) return;
    setSending(true);

    try {
      const res = await fetch(`/api/disputes/${selectedDisputeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });
      if (res.ok) {
        setReplyMessage("");
        const refreshed = await fetch(`/api/disputes/${selectedDisputeId}`);
        const data = await refreshed.json();
        setActiveDisputeDetails(data.dispute);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-planet-border pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
          <Scale className="h-3.5 w-3.5" />
          <span>Fair Review & Incident Handling</span>
        </div>
        <h1 className="text-2xl font-bold text-planet-text tracking-tight">
          Disputes & Resolution Council
        </h1>
        <p className="text-xs text-planet-muted mt-0.5">
          Auditable incident tracking with human review and correction rights.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-planet-muted">Loading incidents...</div>
      ) : disputes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Dispute List on left */}
          <div className="md:col-span-5 space-y-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDisputeId(d.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedDisputeId === d.id
                    ? "border-amber-500/50 bg-amber-500/10"
                    : "border-planet-border bg-surface-primary hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-planet-text truncate max-w-[180px]">
                    {d.booking.listing.title}
                  </span>
                  <Badge variant={d.status === "RESOLVED" ? "success" : "warning"}>
                    {d.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-planet-muted">
                  Reported by {d.reporter.name} • {formatDate(d.createdAt)}
                </div>
                <p className="text-xs text-planet-subtle line-clamp-1 mt-1">
                  {d.description}
                </p>
              </div>
            ))}
          </div>

          {/* Active Dispute Thread on right */}
          <div className="md:col-span-7">
            {activeDisputeDetails ? (
              <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-5">
                <div className="border-b border-planet-border pb-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                      {activeDisputeDetails.category.replace("_", " ")}
                    </span>
                    <Badge variant={activeDisputeDetails.status === "RESOLVED" ? "success" : "warning"}>
                      {activeDisputeDetails.status}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-planet-text">
                    {activeDisputeDetails.booking.listing.title}
                  </h3>
                  <p className="text-xs text-planet-muted">
                    Reported on {formatDate(activeDisputeDetails.createdAt)}
                  </p>
                </div>

                {/* Official Resolution Rationale if resolved */}
                {activeDisputeDetails.resolutionNotes && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1.5 text-xs text-emerald-300">
                    <h4 className="font-bold flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Official Reviewer Rationale
                    </h4>
                    <p className="leading-relaxed">{activeDisputeDetails.resolutionNotes}</p>
                    {activeDisputeDetails.depositDeductionCents && (
                      <div className="font-mono text-[11px] text-emerald-400 font-bold pt-1">
                        Deposit Adjustment: ${activeDisputeDetails.depositDeductionCents / 100}
                      </div>
                    )}
                  </div>
                )}

                {/* Conversation & Evidence Messages Stream */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {activeDisputeDetails.messages &&
                    activeDisputeDetails.messages.map((m: any) => (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                          m.isReviewerNote
                            ? "border-amber-500/30 bg-amber-500/5 text-amber-200"
                            : "border-planet-border bg-surface-elevated text-planet-text"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-planet-subtle">
                          <span className="font-semibold text-planet-text">
                            {m.sender.name}{" "}
                            {m.isReviewerNote && (
                              <span className="text-amber-400 font-mono ml-1">(Campus Arbiter)</span>
                            )}
                          </span>
                          <span className="font-mono">{formatDate(m.createdAt)}</span>
                        </div>
                        <p className="leading-relaxed">{m.message}</p>
                      </div>
                    ))}
                </div>

                {/* Send Reply in Thread */}
                {activeDisputeDetails.status !== "RESOLVED" && (
                  <form onSubmit={handleSendMessage} className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Submit counter-evidence, comment, or drop-off update..."
                      className="flex-1 h-10 px-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none"
                    />
                    <Button type="submit" variant="primary" size="sm" isLoading={sending}>
                      <Send className="h-3.5 w-3.5 mr-1" />
                      <span>Reply</span>
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-planet-border bg-surface-primary p-12 text-center text-xs text-planet-muted">
                Select an incident to view details
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-planet-border bg-surface-primary p-12 text-center space-y-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-planet-text">Clean Record — No Active Disputes</h3>
          <p className="text-xs text-planet-muted max-w-sm mx-auto">
            You have zero unresolved incidents or dispute claims. All previous transactions were
            completed without substantiated complaints.
          </p>
        </div>
      )}
    </div>
  );
}
