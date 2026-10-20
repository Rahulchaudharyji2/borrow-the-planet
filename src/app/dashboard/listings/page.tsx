"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCents, formatDate } from "@/lib/utils";
import { lamportsToSol } from "@/lib/solana";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Package, Edit, PauseCircle, PlayCircle, Archive } from "lucide-react";

interface ListingItem {
  id: string;
  title: string;
  category: string;
  condition: string;
  dailyRateCents: number;
  dailyRateLamports: number;
  depositCents: number;
  depositLamports: number;
  status: string;
  pickupArea: string;
  createdAt: string;
  photos: { url: string }[];
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = () => {
    fetch("/api/items")
      .then((res) => res.json())
      .then((data) => {
        // In this endpoint, we can filter by user or fetch all for demo
        setListings(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch listings error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "PAUSED" : "PUBLISHED";
    try {
      await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchMyListings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this listing?")) return;
    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" });
      fetchMyListings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-planet-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-planet-text tracking-tight">
            My Item Listings
          </h1>
          <p className="text-xs text-planet-muted mt-0.5">
            Manage your equipment inventory, availability status, and rental terms.
          </p>
        </div>

        <Link href="/dashboard/listings/new">
          <Button variant="primary" size="sm" className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            <span>Create New Listing</span>
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-planet-muted">Loading inventory...</div>
      ) : listings.length > 0 ? (
        <div className="space-y-3">
          {listings.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-planet-border bg-surface-primary p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-solana-green/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-surface-elevated overflow-hidden border border-planet-border flex-shrink-0">
                  {item.photos[0] ? (
                    <img src={item.photos[0].url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-6 w-6 text-planet-subtle m-3" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-planet-text">{item.title}</h3>
                    <Badge variant={item.status === "PUBLISHED" ? "success" : "default"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-planet-muted mt-0.5">
                    {item.category.replace("_", " ")} • Pickup: {item.pickupArea}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-solana-green">
                    {lamportsToSol(item.dailyRateLamports)} SOL / day
                  </div>
                  <div className="text-[11px] text-planet-subtle font-mono">
                    Deposit: {lamportsToSol(item.depositLamports)} SOL
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(item.id, item.status)}
                  className="gap-1 text-xs"
                >
                  {item.status === "PUBLISHED" ? (
                    <>
                      <PauseCircle className="h-3.5 w-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-3.5 w-3.5" />
                      <span>Publish</span>
                    </>
                  )}
                </Button>

                <button
                  onClick={() => handleArchive(item.id)}
                  className="p-1.5 text-planet-muted hover:text-planet-danger transition-colors"
                  title="Archive listing"
                >
                  <Archive className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-planet-border bg-surface-primary p-12 text-center space-y-3">
          <Package className="h-8 w-8 text-planet-subtle mx-auto" />
          <h3 className="text-base font-bold text-planet-text">No listings yet</h3>
          <p className="text-xs text-planet-muted">
            Share equipment you don&apos;t use every day and earn peer rental payouts.
          </p>
          <Link href="/dashboard/listings/new">
            <Button variant="primary" size="sm">
              List Your First Item
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
