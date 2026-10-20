"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { formatCents, formatDate } from "@/lib/utils";
import { lamportsToSol } from "@/lib/solana";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingModal } from "@/components/booking/booking-modal";
import {
  MapPin,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Flag,
  Share2,
} from "lucide-react";

interface ItemDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  dailyRateCents: number;
  dailyRateLamports: number;
  depositCents: number;
  depositLamports: number;
  minDays: number;
  maxDays: number;
  pickupArea: string;
  rules?: string | null;
  accessories?: string | null;
  createdAt: string;
  photos: { id: string; url: string; caption?: string | null }[];
  lender: {
    id: string;
    name: string;
    avatar?: string | null;
    bio?: string | null;
    campus: string;
    createdAt: string;
    credentials?: {
      id: string;
      rentalsCompleted: number;
      onTimeReturnRatePercent: number;
      disputeFreeRatePercent: number;
      status: string;
    }[];
  };
}

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Item not found");
        return res.json();
      })
      .then((data) => {
        setItem(data.item);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-xs text-planet-muted">
        Loading item specifications and escrow terms...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-planet-text">Item Not Found</h2>
        <p className="text-xs text-planet-muted">
          This listing might have been archived or removed by its owner.
        </p>
        <Link href="/explore">
          <Button variant="secondary" size="sm">
            Back to Explore
          </Button>
        </Link>
      </div>
    );
  }

  const activePhoto =
    item.photos && item.photos.length > 0
      ? item.photos[selectedPhotoIdx]?.url || item.photos[0].url
      : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80";

  const cred = item.lender.credentials && item.lender.credentials.length > 0
    ? item.lender.credentials[0]
    : null;
  const isProvenLender = cred && cred.rentalsCompleted >= 3;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 text-xs text-planet-muted hover:text-planet-text transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to marketplace</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery & Description */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Gallery Display */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-planet-border bg-surface-elevated">
              <img
                src={activePhoto}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="purple" className="text-xs">
                  {item.category.replace("_", " ")}
                </Badge>
                <Badge variant="default" className="text-xs">
                  {item.condition.replace("_", " ")}
                </Badge>
              </div>
            </div>

            {/* Thumbnail selector */}
            {item.photos && item.photos.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {item.photos.map((p, idx) => (
                  <button
                    key={p.id || idx}
                    onClick={() => setSelectedPhotoIdx(idx)}
                    className={`relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border transition-all ${
                      selectedPhotoIdx === idx
                        ? "border-solana-green ring-2 ring-solana-green/40"
                        : "border-planet-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-planet-text">About This Item</h2>
            <p className="text-sm text-planet-muted leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Included Accessories */}
          {item.accessories && (
            <div className="space-y-2 rounded-xl border border-planet-border bg-surface-primary p-4">
              <h3 className="text-xs font-semibold uppercase text-planet-text tracking-wider">
                Included Accessories & Kit
              </h3>
              <p className="text-xs text-planet-muted leading-relaxed">
                {item.accessories}
              </p>
            </div>
          )}

          {/* Rental Rules & Care Guidelines */}
          {item.rules && (
            <div className="space-y-2 rounded-xl border border-planet-border bg-surface-primary p-4">
              <h3 className="text-xs font-semibold uppercase text-planet-text tracking-wider">
                Lender Care Rules & Guidelines
              </h3>
              <p className="text-xs text-planet-muted leading-relaxed">
                {item.rules}
              </p>
            </div>
          )}

          {/* Safe Pickup Location */}
          <div className="space-y-2 rounded-xl border border-planet-border bg-surface-primary p-4">
            <h3 className="text-xs font-semibold uppercase text-planet-text tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-solana-green" />
              <span>Designated Safe Meeting Zone</span>
            </h3>
            <p className="text-xs text-planet-text font-medium">
              {item.pickupArea}
            </p>
            <p className="text-[11px] text-planet-subtle leading-relaxed">
              For security, exact residential addresses and personal phone numbers are never
              disclosed publicly. Handovers take place in agreed campus public zones.
            </p>
          </div>
        </div>

        {/* Right Column: Pricing Card & Booking Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 shadow-card space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-planet-text leading-tight">
                {item.title}
              </h1>
              <p className="text-xs text-planet-muted mt-1">
                Listed {formatDate(item.createdAt)}
              </p>
            </div>

            {/* Rate Display */}
            <div className="p-4 rounded-xl border border-planet-border bg-surface-elevated flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-solana-green">
                  {lamportsToSol(item.dailyRateLamports)} SOL
                </span>
                <span className="text-xs text-planet-muted"> / day</span>
                <div className="text-xs font-mono text-planet-subtle mt-0.5">
                  ≈ {formatCents(item.dailyRateCents)} daily
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-planet-muted block">Security Deposit</span>
                <span className="text-sm font-bold font-mono text-planet-text">
                  {lamportsToSol(item.depositLamports)} SOL
                </span>
                <span className="text-[10px] text-emerald-400 block font-medium">
                  100% Refundable
                </span>
              </div>
            </div>

            {/* Duration Limits */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg border border-planet-border bg-surface-elevated text-center">
                <span className="text-planet-subtle block text-[10px] uppercase font-semibold">Min Rental</span>
                <span className="font-semibold text-planet-text">{item.minDays} day(s)</span>
              </div>
              <div className="p-2.5 rounded-lg border border-planet-border bg-surface-elevated text-center">
                <span className="text-planet-subtle block text-[10px] uppercase font-semibold">Max Rental</span>
                <span className="font-semibold text-planet-text">{item.maxDays} days</span>
              </div>
            </div>

            {/* Booking CTA Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full text-base font-bold shadow-glow"
              onClick={() => setBookingModalOpen(true)}
            >
              Request to Borrow
            </Button>

            {/* Cancellation & Dispute Terms Note */}
            <div className="space-y-2 pt-2 border-t border-planet-border/60 text-xs text-planet-muted">
              <div className="flex items-center gap-2 text-planet-text font-medium">
                <Lock className="h-3.5 w-3.5 text-solana-green" />
                <span>Protected by Solana Devnet Escrow</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Funds remain locked in the escrow contract until return is verified. Free
                cancellation before physical handover. In case of disagreement, authorized
                campus arbiters review photo evidence before any deposit deduction.
              </p>
            </div>

            {/* Lender Profile Card */}
            <div className="pt-4 border-t border-planet-border/60">
              <div className="flex items-center gap-3">
                {item.lender.avatar ? (
                  <img
                    src={item.lender.avatar}
                    alt={item.lender.name}
                    className="h-11 w-11 rounded-full object-cover border border-planet-border"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-surface-hover flex items-center justify-center font-bold text-planet-text">
                    {item.lender.name[0]}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-planet-text">
                    {item.lender.name}
                  </h4>
                  <p className="text-xs text-planet-subtle">{item.lender.campus}</p>
                </div>
              </div>

              {isProvenLender && (
                <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg border border-solana-green/20 bg-solana-green/5 text-xs text-solana-green">
                  <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                  <span>
                    <strong>PlanetPass Verified:</strong> {cred.rentalsCompleted} completed rentals • {cred.onTimeReturnRatePercent}% on-time
                  </span>
                </div>
              )}
            </div>

            {/* Report Listing Trigger */}
            <div className="pt-2 text-center">
              {reportSubmitted ? (
                <span className="text-[11px] text-emerald-400">
                  Listing flagged for reviewer audit. Thank you for keeping the campus safe.
                </span>
              ) : (
                <button
                  onClick={() => setReportSubmitted(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-planet-subtle hover:text-planet-danger transition-colors"
                >
                  <Flag className="h-3 w-3" />
                  <span>Report inappropriate listing</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      <BookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        listing={{
          id: item.id,
          title: item.title,
          dailyRateCents: item.dailyRateCents,
          dailyRateLamports: item.dailyRateLamports,
          depositCents: item.depositCents,
          depositLamports: item.depositLamports,
          minDays: item.minDays,
          maxDays: item.maxDays,
          pickupArea: item.pickupArea,
        }}
      />
    </div>
  );
}
