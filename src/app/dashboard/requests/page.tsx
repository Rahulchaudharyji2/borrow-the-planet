"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCents, formatDate } from "@/lib/utils";
import { lamportsToSol } from "@/lib/solana";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox, CheckCircle2, XCircle, ShieldCheck, User } from "lucide-react";

interface RequestItem {
  id: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  totalDueLamports: number;
  depositLamports: number;
  status: string;
  listing: {
    id: string;
    title: string;
    pickupArea: string;
  };
  borrower: {
    id: string;
    name: string;
    campus: string;
    avatar?: string | null;
  };
}

export default function LendingRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        const pending = (data.lent || []).filter(
          (b: RequestItem) => b.status === "PENDING"
        );
        setRequests(pending);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch requests error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (bookingId: string, action: "approve" | "decline") => {
    try {
      // For approval, status moves to APPROVED or ESCROW_FUNDED
      await fetch(`/api/bookings/${bookingId}/escrow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txSignature: `lender_${action}_${Date.now()}`,
          demoSimulated: true,
        }),
      });
      fetchRequests();
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-planet-border pb-4">
        <h1 className="text-2xl font-bold text-planet-text tracking-tight">
          Lending Requests
        </h1>
        <p className="text-xs text-planet-muted mt-0.5">
          Review incoming rental requests from campus borrowers for your listed equipment.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-planet-muted">Loading requests...</div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-planet-border bg-surface-primary p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-planet-text">{r.listing.title}</h3>
                  <Badge variant="warning">Awaiting Approval</Badge>
                </div>

                <div className="flex items-center gap-3">
                  {r.borrower.avatar ? (
                    <img
                      src={r.borrower.avatar}
                      alt={r.borrower.name}
                      className="h-8 w-8 rounded-full object-cover border border-planet-border"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-surface-hover flex items-center justify-center font-bold text-xs text-planet-text">
                      {r.borrower.name[0]}
                    </div>
                  )}
                  <div className="text-xs">
                    <span className="font-semibold text-planet-text">{r.borrower.name}</span>
                    <span className="text-planet-subtle"> • {r.borrower.campus}</span>
                  </div>
                </div>

                <div className="text-xs text-planet-muted">
                  Requested Dates:{" "}
                  <strong className="text-planet-text">
                    {formatDate(r.startDate)} to {formatDate(r.endDate)} ({r.durationDays} days)
                  </strong>{" "}
                  • Meeting: {r.listing.pickupArea}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <div className="text-right mr-2">
                  <div className="font-mono text-sm font-bold text-solana-green">
                    {lamportsToSol(r.totalDueLamports)} SOL
                  </div>
                  <div className="text-[11px] text-planet-subtle font-mono">
                    Includes {lamportsToSol(r.depositLamports)} SOL deposit
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAction(r.id, "approve")}
                  className="gap-1 font-semibold"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Accept Request</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(r.id, "decline")}
                  className="text-planet-danger hover:text-red-400"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-planet-border bg-surface-primary p-12 text-center space-y-3">
          <Inbox className="h-8 w-8 text-planet-subtle mx-auto" />
          <h3 className="text-base font-bold text-planet-text">No pending lending requests</h3>
          <p className="text-xs text-planet-muted">
            When students request to borrow your gear, their requests will appear here for your approval.
          </p>
        </div>
      )}
    </div>
  );
}
