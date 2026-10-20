"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCents } from "@/lib/utils";
import { lamportsToSol } from "@/lib/solana";
import { ShieldAlert, CheckCircle2, Calendar, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: {
    id: string;
    title: string;
    dailyRateCents: number;
    dailyRateLamports: number;
    depositCents: number;
    depositLamports: number;
    minDays: number;
    maxDays: number;
    pickupArea: string;
  };
}

export function BookingModal({ open, onOpenChange, listing }: BookingModalProps) {
  const router = useRouter();

  // Initialize with tomorrow and day after tomorrow
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const dayAfter = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];

  const [startDateStr, setStartDateStr] = useState(tomorrow);
  const [endDateStr, setEndDateStr] = useState(dayAfter);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  // Financial calculations
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const durationDays = diffTime > 0 ? Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) : 0;

  const validDates = durationDays >= listing.minDays && durationDays <= listing.maxDays;

  // Breakdown in integer cents & lamports
  const rentalSubtotalCents = listing.dailyRateCents * durationDays;
  const platformFeeCents = Math.round(rentalSubtotalCents * 0.05);
  const depositCents = listing.depositCents;
  const totalDueCents = rentalSubtotalCents + depositCents + platformFeeCents;

  const rentalSubtotalLamports = listing.dailyRateLamports * durationDays;
  const platformFeeLamports = Math.round(rentalSubtotalLamports * 0.05);
  const depositLamports = listing.depositLamports;
  const totalDueLamports = rentalSubtotalLamports + depositLamports + platformFeeLamports;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validDates || !termsAccepted) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          startDate: new Date(startDateStr).toISOString(),
          endDate: new Date(endDateStr).toISOString(),
          paymentMode: "DEMO_SOLANA_ESCROW",
          termsAccepted: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking reservation");
      }

      setSuccessBookingId(data.booking.id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToEscrow = () => {
    if (successBookingId) {
      onOpenChange(false);
      router.push(`/dashboard/bookings?highlight=${successBookingId}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Reserve “{listing.title}”</DialogTitle>
          <DialogDescription>
            Safe peer rental backed by Solana Devnet Escrow and verifiable return evidence.
          </DialogDescription>
        </DialogHeader>

        {successBookingId ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-solana-green/20 text-solana-green">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-planet-text">Booking Reservation Created!</h3>
              <p className="text-xs text-planet-muted max-w-sm mx-auto">
                Your reservation has been created with pending escrow status. You can now inspect
                handover checklists and fund the devnet escrow.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleContinueToEscrow}
              className="w-full gap-2 mt-4"
            >
              <span>View Booking in Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-planet-danger/10 border border-planet-danger/20 text-xs text-planet-danger">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={startDateStr}
                  min={tomorrow}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
                  Return Date
                </label>
                <input
                  type="date"
                  value={endDateStr}
                  min={startDateStr || tomorrow}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Duration alert if out of bounds */}
            {!validDates && (
              <p className="text-xs text-amber-400">
                Duration: {durationDays} day(s). Allowed range is {listing.minDays} to {listing.maxDays} days.
              </p>
            )}

            {/* Transparent Financial Breakdown */}
            <div className="rounded-xl border border-planet-border bg-surface-elevated p-4 space-y-2.5">
              <div className="text-xs font-semibold text-planet-text uppercase tracking-wider mb-2">
                Cost Breakdown ({durationDays} day{durationDays !== 1 ? "s" : ""})
              </div>

              <div className="flex justify-between text-xs text-planet-muted">
                <span>Rental fee ({lamportsToSol(listing.dailyRateLamports)} SOL × {durationDays}d)</span>
                <span className="font-mono text-planet-text">
                  {lamportsToSol(rentalSubtotalLamports)} SOL ({formatCents(rentalSubtotalCents)})
                </span>
              </div>

              <div className="flex justify-between text-xs text-planet-muted">
                <div className="flex items-center gap-1">
                  <span>Refundable Security Deposit</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 rounded">100% Refundable</span>
                </div>
                <span className="font-mono text-planet-text">
                  {lamportsToSol(depositLamports)} SOL ({formatCents(depositCents)})
                </span>
              </div>

              <div className="flex justify-between text-xs text-planet-muted">
                <span>Platform Access Fee (5%)</span>
                <span className="font-mono text-planet-text">
                  {lamportsToSol(platformFeeLamports)} SOL ({formatCents(platformFeeCents)})
                </span>
              </div>

              <div className="border-t border-planet-border pt-2 flex justify-between items-baseline font-bold text-sm">
                <span className="text-planet-text">Total Due in Escrow</span>
                <div className="text-right">
                  <div className="font-mono text-solana-green text-base">
                    {lamportsToSol(totalDueLamports)} SOL
                  </div>
                  <div className="text-[11px] font-mono text-planet-subtle font-normal">
                    ≈ {formatCents(totalDueCents)} total
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and conditions agreement */}
            <div className="p-3 rounded-lg border border-planet-border bg-[#0D1117] space-y-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-planet-border bg-surface-elevated text-solana-green focus:ring-solana-green"
                />
                <label htmlFor="agree-terms" className="text-xs text-planet-muted leading-relaxed cursor-pointer">
                  I agree to the peer rental rules, pickup at <strong className="text-planet-text">{listing.pickupArea}</strong>,
                  completing physical handover & return checklists, and arbitrated escrow resolution if a dispute occurs.
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!validDates || !termsAccepted || loading}
              isLoading={loading}
              className="w-full gap-2"
            >
              <span>Confirm & Initialize Escrow</span>
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
