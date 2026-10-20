"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatCents, formatDate } from "@/lib/utils";
import { lamportsToSol, getSolanaExplorerUrl, getEscrowPda } from "@/lib/solana";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HandoverDialog } from "@/components/handover/handover-dialog";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Camera,
  AlertTriangle,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck,
} from "lucide-react";

interface BookingRecord {
  id: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  rentalSubtotalCents: number;
  depositCents: number;
  platformFeeCents: number;
  totalDueCents: number;
  rentalSubtotalLamports: number;
  depositLamports: number;
  totalDueLamports: number;
  status: string;
  paymentMode: string;
  escrowAccount?: string | null;
  escrowTxSignature?: string | null;
  releaseTxSignature?: string | null;
  listing: {
    id: string;
    title: string;
    pickupArea: string;
    photos: { url: string }[];
  };
  lender: {
    id: string;
    name: string;
    campus: string;
  };
  borrower: {
    id: string;
    name: string;
    campus: string;
  };
  handoverRecord?: {
    lenderConfirmed: boolean;
    borrowerConfirmed: boolean;
    conditionNotes?: string;
    checklistAnswers: string;
    photoUrls: string;
    disagreementFlag: boolean;
  } | null;
  returnRecord?: {
    lenderConfirmed: boolean;
    borrowerConfirmed: boolean;
    conditionComparisonNotes?: string;
    checklistAnswers: string;
    returnPhotoUrls: string;
    depositReleaseApproved: boolean;
    disagreementFlag: boolean;
  } | null;
  disputes?: { id: string; status: string; category: string }[];
}

function BookingsListContent() {
  const searchParams = useSearchParams();
  const highlightedBookingId = searchParams.get("highlight");

  const [activeTab, setActiveTab] = useState<"borrowed" | "lent">("borrowed");
  const [borrowed, setBorrowed] = useState<BookingRecord[]>([]);
  const [lent, setLent] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Evidence Dialog State
  const [activeDialog, setActiveDialog] = useState<{
    bookingId: string;
    itemTitle: string;
    isLender: boolean;
    mode: "handover" | "return";
  } | null>(null);

  // Expanded evidence view state
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(
    highlightedBookingId || null
  );

  const fetchBookings = () => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        setBorrowed(data.borrowed || []);
        setLent(data.lent || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch bookings error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [fundingBookingId, setFundingBookingId] = useState<string | null>(null);
  const [txNotice, setTxNotice] = useState<{ msg: string; sig?: string; error?: boolean } | null>(null);

  const handleFundEscrow = async (booking: BookingRecord, forceSimulated = false) => {
    setFundingBookingId(booking.id);
    setTxNotice(null);

    try {
      let finalSignature = `demo_devnet_tx_${Date.now()}`;
      let isSimulated = true;

      if (!forceSimulated && connected && publicKey) {
        setTxNotice({ msg: "Please approve the transaction in your Solana Devnet wallet (Phantom/Solflare)..." });
        const [escrowPda] = getEscrowPda(booking.id);

        // For smooth demo testing, transfer a safe nominal devnet amount (e.g. 0.001 SOL = 1,000,000 lamports)
        // so the user never fails even if they have only a tiny amount of airdropped devnet SOL
        const lamportsToSend = Math.min(booking.totalDueLamports, 1_000_000);

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: escrowPda,
            lamports: lamportsToSend,
          })
        );

        const signature = await sendTransaction(transaction, connection);
        setTxNotice({
          msg: "Transaction broadcast to Solana Devnet! Awaiting blockchain confirmation...",
          sig: signature,
        });

        await connection.confirmTransaction(signature, "confirmed");
        finalSignature = signature;
        isSimulated = false;
        setTxNotice({
          msg: "Escrow successfully funded on Solana Devnet!",
          sig: signature,
        });
      }

      const res = await fetch(`/api/bookings/${booking.id}/escrow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txSignature: finalSignature,
          demoSimulated: isSimulated,
        }),
      });

      if (res.ok) {
        fetchBookings();
      }
    } catch (err: any) {
      console.error("Fund escrow error:", err);
      setTxNotice({
        msg: `Devnet error: ${err.message || "Wallet transaction was rejected or timed out"}`,
        error: true,
      });
    } finally {
      setFundingBookingId(null);
    }
  };

  const currentList = activeTab === "borrowed" ? borrowed : lent;

  return (
    <div className="space-y-6">
      {/* Page Title & Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-planet-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-planet-text tracking-tight">
            Bookings & Escrow Management
          </h1>
          <p className="text-xs text-planet-muted mt-0.5">
            Manage physical handovers, photo checklists, and Solana escrow settlements.
          </p>
        </div>

        <div className="flex rounded-lg border border-planet-border bg-surface-elevated p-1">
          <button
            onClick={() => setActiveTab("borrowed")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "borrowed"
                ? "bg-solana-green text-[#0D1117]"
                : "text-planet-muted hover:text-planet-text"
            }`}
          >
            I&apos;m Borrowing ({borrowed.length})
          </button>
          <button
            onClick={() => setActiveTab("lent")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "lent"
                ? "bg-solana-green text-[#0D1117]"
                : "text-planet-muted hover:text-planet-text"
            }`}
          >
            I&apos;m Lending ({lent.length})
          </button>
        </div>
      </div>

      {/* Live Transaction Status Banner */}
      {txNotice && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in ${
            txNotice.error
              ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
              : "border-solana-green/40 bg-solana-green/10 text-solana-green"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-solana-green animate-ping" />
            <span className="font-medium">{txNotice.msg}</span>
          </div>

          {txNotice.sig && (
            <a
              href={getSolanaExplorerUrl(txNotice.sig)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] underline font-bold hover:text-white"
            >
              <span>View On Solana Devnet Explorer</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-planet-muted">Loading bookings...</div>
      ) : currentList.length > 0 ? (
        <div className="space-y-4">
          {currentList.map((b) => {
            const isLender = activeTab === "lent";
            const counterpart = isLender ? b.borrower : b.lender;
            const isExpanded = expandedBookingId === b.id;

            return (
              <div
                key={b.id}
                className={`rounded-2xl border transition-all ${
                  highlightedBookingId === b.id
                    ? "border-solana-green/50 bg-surface-primary shadow-glow"
                    : "border-planet-border bg-surface-primary"
                }`}
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Item and Counterpart Details */}
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-surface-elevated overflow-hidden border border-planet-border flex-shrink-0">
                      {b.listing.photos[0] ? (
                        <img
                          src={b.listing.photos[0].url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-planet-text">
                        {b.listing.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-planet-muted">
                        <span>
                          {isLender ? "Borrower" : "Lender"}:{" "}
                          <strong className="text-planet-text">{counterpart.name}</strong>
                        </span>
                        <span>•</span>
                        <span>{formatDate(b.startDate)} – {formatDate(b.endDate)}</span>
                        <span>({b.durationDays}d)</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Status Actions */}
                  <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-solana-green">
                        {lamportsToSol(b.totalDueLamports)} SOL
                      </div>
                      <div className="text-[11px] text-planet-subtle font-mono">
                        Dep: {lamportsToSol(b.depositLamports)} SOL (refundable)
                      </div>
                    </div>

                    <Badge
                      variant={
                        b.status === "COMPLETED"
                          ? "success"
                          : b.status === "DISPUTED"
                          ? "danger"
                          : "purple"
                      }
                    >
                      {b.status}
                    </Badge>

                    {/* Action Buttons based on status */}
                    {b.status === "PENDING" && !isLender && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={fundingBookingId === b.id}
                          onClick={() => handleFundEscrow(b, false)}
                          className="gap-1 font-semibold"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          <span>{connected ? "Fund on Devnet" : "Fund Escrow"}</span>
                        </Button>
                        <button
                          onClick={() => handleFundEscrow(b, true)}
                          title="Instant Simulation Mode (no wallet needed)"
                          className="text-[10px] text-planet-subtle hover:text-solana-green underline px-1"
                        >
                          Simulate
                        </button>
                      </div>
                    )}

                    {b.status === "ESCROW_FUNDED" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          setActiveDialog({
                            bookingId: b.id,
                            itemTitle: b.listing.title,
                            isLender,
                            mode: "handover",
                          })
                        }
                        className="gap-1"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Sign Handover</span>
                      </Button>
                    )}

                    {b.status === "HANDED_OVER" && (
                      <Button
                        variant={isLender ? "primary" : "secondary"}
                        size="sm"
                        onClick={() =>
                          setActiveDialog({
                            bookingId: b.id,
                            itemTitle: b.listing.title,
                            isLender,
                            mode: "return",
                          })
                        }
                        className="gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isLender ? "Inspect Return & Settle" : "Return Checklist"}</span>
                      </Button>
                    )}

                    <button
                      onClick={() =>
                        setExpandedBookingId(isExpanded ? null : b.id)
                      }
                      className="p-1.5 text-planet-muted hover:text-planet-text rounded-lg hover:bg-surface-hover"
                      title="Inspect evidence details"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Auditable Evidence & Contract Details */}
                {isExpanded && (
                  <div className="border-t border-planet-border bg-[#0D1117]/80 p-5 rounded-b-2xl space-y-4 text-xs animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Handover Evidence Record */}
                      <div className="rounded-xl border border-planet-border bg-surface-primary p-4 space-y-2">
                        <div className="flex items-center justify-between font-semibold text-planet-text">
                          <span className="flex items-center gap-1.5">
                            <Camera className="h-4 w-4 text-solana-green" />
                            Handover Inspection Evidence
                          </span>
                          <span className="font-mono text-[10px] text-planet-subtle">
                            {b.handoverRecord
                              ? b.handoverRecord.lenderConfirmed && b.handoverRecord.borrowerConfirmed
                                ? "Dual Confirmed"
                                : "Partially Signed"
                              : "Not recorded yet"}
                          </span>
                        </div>

                        {b.handoverRecord ? (
                          <div className="space-y-2 text-planet-muted">
                            <p>
                              Notes:{" "}
                              <strong className="text-planet-text">
                                {b.handoverRecord.conditionNotes || "No condition notes logged."}
                              </strong>
                            </p>
                            {JSON.parse(b.handoverRecord.photoUrls || "[]").length > 0 && (
                              <div className="flex gap-2 pt-1">
                                {JSON.parse(b.handoverRecord.photoUrls || "[]").map(
                                  (url: string, i: number) => (
                                    <img
                                      key={i}
                                      src={url}
                                      alt="Handover"
                                      className="h-12 w-12 rounded object-cover border border-planet-border"
                                    />
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-planet-subtle">
                            Handover evidence will be captured together at the campus meeting zone.
                          </p>
                        )}
                      </div>

                      {/* Return Evidence Record */}
                      <div className="rounded-xl border border-planet-border bg-surface-primary p-4 space-y-2">
                        <div className="flex items-center justify-between font-semibold text-planet-text">
                          <span className="flex items-center gap-1.5">
                            <FileCheck className="h-4 w-4 text-purple-300" />
                            Return & Deposit Settlement
                          </span>
                          <span className="font-mono text-[10px] text-planet-subtle">
                            {b.returnRecord
                              ? b.returnRecord.depositReleaseApproved
                                ? "Deposit Refund Approved"
                                : "Under Review"
                              : "Pending return"}
                          </span>
                        </div>

                        {b.returnRecord ? (
                          <div className="space-y-2 text-planet-muted">
                            <p>
                              Comparison:{" "}
                              <strong className="text-planet-text">
                                {b.returnRecord.conditionComparisonNotes || "Clean condition returned."}
                              </strong>
                            </p>
                            {JSON.parse(b.returnRecord.returnPhotoUrls || "[]").length > 0 && (
                              <div className="flex gap-2 pt-1">
                                {JSON.parse(b.returnRecord.returnPhotoUrls || "[]").map(
                                  (url: string, i: number) => (
                                    <img
                                      key={i}
                                      src={url}
                                      alt="Return"
                                      className="h-12 w-12 rounded object-cover border border-planet-border"
                                    />
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-planet-subtle">
                            Return comparison checklist will be executed when the item is returned.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* On-Chain Solana PDA & Tx Signatures */}
                    <div className="rounded-xl border border-planet-border bg-surface-elevated p-3 font-mono text-[11px] text-planet-subtle space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Solana Devnet Escrow PDA:</span>
                        <span className="text-planet-text">{b.escrowAccount || "Pending escrow initialization"}</span>
                      </div>
                      {b.escrowTxSignature && (
                        <div className="flex items-center justify-between">
                          <span>Deposit Tx:</span>
                          <a
                            href={getSolanaExplorerUrl(b.escrowTxSignature)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-solana-green hover:underline flex items-center gap-1"
                          >
                            <span>{b.escrowTxSignature.slice(0, 24)}...</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                      {b.releaseTxSignature && (
                        <div className="flex items-center justify-between">
                          <span>Settlement Tx:</span>
                          <a
                            href={getSolanaExplorerUrl(b.releaseTxSignature)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-solana-green hover:underline flex items-center gap-1"
                          >
                            <span>{b.releaseTxSignature.slice(0, 24)}...</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-planet-border bg-surface-primary p-12 text-center space-y-3">
          <Calendar className="h-8 w-8 text-planet-subtle mx-auto" />
          <h3 className="text-base font-bold text-planet-text">No bookings found</h3>
          <p className="text-xs text-planet-muted">
            {activeTab === "borrowed"
              ? "You haven't reserved any items yet. Explore campus gear to borrow what you need."
              : "No one has rented your items yet. Make sure your listings are published."}
          </p>
        </div>
      )}

      {/* Handover & Return Evidence Modal */}
      {activeDialog && (
        <HandoverDialog
          open={Boolean(activeDialog)}
          onOpenChange={(open) => {
            if (!open) setActiveDialog(null);
          }}
          bookingId={activeDialog.bookingId}
          itemTitle={activeDialog.itemTitle}
          isLender={activeDialog.isLender}
          mode={activeDialog.mode}
          onSuccess={() => {
            fetchBookings();
            setActiveDialog(null);
          }}
        />
      )}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-planet-muted">Loading bookings...</div>}>
      <BookingsListContent />
    </Suspense>
  );
}
