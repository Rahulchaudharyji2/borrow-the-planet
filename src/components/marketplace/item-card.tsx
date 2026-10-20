import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCents } from "@/lib/utils";
import { lamportsToSol } from "@/lib/solana";
import { MapPin, ShieldCheck, Sparkles, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ItemCardProps {
  id: string;
  title: string;
  category: string;
  condition: string;
  dailyRateCents: number;
  dailyRateLamports: number;
  depositCents: number;
  pickupArea: string;
  photos: { url: string; caption?: string | null }[];
  lender: {
    id: string;
    name: string;
    avatar?: string | null;
    campus: string;
    credentials?: {
      rentalsCompleted: number;
      onTimeReturnRatePercent: number;
      disputeFreeRatePercent: number;
    }[];
  };
}

export function ItemCard({
  id,
  title,
  category,
  condition,
  dailyRateCents,
  dailyRateLamports,
  pickupArea,
  photos,
  lender,
}: ItemCardProps) {
  const photoUrl =
    photos && photos.length > 0
      ? photos[0].url
      : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80";

  // Evidence-aware trust indicator: only if 3+ completed rentals exist on credential
  const cred = lender.credentials && lender.credentials.length > 0 ? lender.credentials[0] : null;
  const isProvenLender = cred && cred.rentalsCompleted >= 3;

  return (
    <Link
      href={`/item/${id}`}
      className="group flex flex-col rounded-xl border border-planet-border bg-surface-primary overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-solana-green/40 hover:shadow-card"
    >
      {/* Photo Preview Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-elevated">
        <img
          src={photoUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category & Condition Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-black/70 backdrop-blur-md text-planet-text border border-white/10">
            {category.replace("_", " ")}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-solana-purple/80 backdrop-blur-md text-white border border-purple-400/20">
            {condition.replace("_", " ")}
          </span>
        </div>

        {/* Trust Badge overlay if proven history */}
        {isProvenLender && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/75 backdrop-blur-md text-solana-green border border-solana-green/30">
            <ShieldCheck className="h-3 w-3 text-solana-green" />
            <span>PlanetPass Verified</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 justify-between">
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-planet-text line-clamp-1 group-hover:text-solana-green transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-planet-muted">
            <MapPin className="h-3.5 w-3.5 text-planet-subtle flex-shrink-0" />
            <span className="truncate">{pickupArea}</span>
          </div>
        </div>

        {/* Pricing & Lender Metadata */}
        <div className="mt-4 pt-3 border-t border-planet-border/60 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold font-mono text-solana-green">
                {lamportsToSol(dailyRateLamports)} SOL
              </span>
              <span className="text-xs text-planet-muted">/ day</span>
            </div>
            <div className="text-[11px] text-planet-subtle font-mono">
              ≈ {formatCents(dailyRateCents)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-medium text-planet-text truncate max-w-[100px]">
                {lender.name}
              </p>
              <p className="text-[10px] text-planet-subtle truncate max-w-[100px]">
                {lender.campus}
              </p>
            </div>
            {lender.avatar ? (
              <img
                src={lender.avatar}
                alt={lender.name}
                className="h-7 w-7 rounded-full object-cover border border-planet-border"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-surface-hover flex items-center justify-center text-xs text-planet-muted font-bold">
                {lender.name[0]}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
