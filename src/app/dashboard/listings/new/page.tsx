"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Camera,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { solToLamports } from "@/lib/solana";

export default function NewListingPage() {
  const router = useRouter();

  // Multi-step form state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basic Info
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("CAMPUS_ESSENTIALS");
  const [condition, setCondition] = useState("EXCELLENT");
  const [description, setDescription] = useState("");

  // Step 2: Photos & Accessories
  const [photoUrl, setPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"
  );
  const [accessories, setAccessories] = useState("");
  const [rules, setRules] = useState("");

  // Step 3: Pricing, Rates & Location
  const [dailyRateSol, setDailyRateSol] = useState("0.10");
  const [depositSol, setDepositSol] = useState("0.50");
  const [minDays, setMinDays] = useState(1);
  const [maxDays, setMaxDays] = useState(14);
  const [pickupArea, setPickupArea] = useState("Moffitt Library 3rd Floor / North Gate");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dailyRateLamports = solToLamports(dailyRateSol);
    const depositLamports = solToLamports(depositSol);
    const dailyRateCents = Math.round(Number(dailyRateSol) * 160 * 100); // approx fiat conversion for display
    const depositCents = Math.round(Number(depositSol) * 160 * 100);

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          condition,
          dailyRateCents,
          dailyRateLamports,
          depositCents,
          depositLamports,
          minDays: Number(minDays),
          maxDays: Number(maxDays),
          pickupArea,
          rules,
          accessories,
          photoUrls: [photoUrl],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create listing");
      }

      router.push(`/item/${data.listing.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to publish listing. Please check required fields.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b border-planet-border pb-4">
        <h1 className="text-2xl font-bold text-planet-text tracking-tight">
          List an Item for Peer Borrowing
        </h1>
        <p className="text-xs text-planet-muted mt-0.5">
          Step {step} of 3 • Earn peer payouts and contribute to circular campus reuse.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className={`h-1.5 rounded-full transition-colors ${
            step >= 1 ? "bg-solana-green" : "bg-surface-elevated"
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-colors ${
            step >= 2 ? "bg-solana-green" : "bg-surface-elevated"
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-colors ${
            step >= 3 ? "bg-solana-green" : "bg-surface-elevated"
          }`}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-planet-danger/10 border border-planet-danger/20 text-xs text-planet-danger">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Item Overview */}
        {step === 1 && (
          <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-4 animate-in fade-in duration-150">
            <h3 className="text-sm font-bold text-planet-text uppercase tracking-wider mb-2">
              Item Details & Condition
            </h3>

            <Input
              id="title"
              label="Item Title"
              placeholder="e.g. Sony A7 III Camera Body + 28-70mm Lens"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none cursor-pointer"
                >
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="CAMERAS">Cameras & Film</option>
                  <option value="OUTDOOR">Outdoor & Gear</option>
                  <option value="TOOLS">Tools & DIY</option>
                  <option value="BOOKS">Books & Reference</option>
                  <option value="CAMPUS_ESSENTIALS">Campus Essentials</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none cursor-pointer"
                >
                  <option value="LIKE_NEW">Like New (Mint)</option>
                  <option value="EXCELLENT">Excellent (Minor cosmetic)</option>
                  <option value="GOOD">Good (Fully functional)</option>
                  <option value="FAIR">Fair (Noticeable wear)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
                Full Description (Min 20 characters)
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key specs, included accessories, battery life, condition nuances..."
                className="w-full p-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none"
                required
              />
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                if (title.length < 5 || description.length < 20) {
                  setError("Please fill in a descriptive title and at least 20 characters for description.");
                  return;
                }
                setError(null);
                setStep(2);
              }}
              className="w-full"
            >
              Continue to Photos & Rules →
            </Button>
          </div>
        )}

        {/* Step 2: Photos, Included Accessories & Rules */}
        {step === 2 && (
          <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-4 animate-in fade-in duration-150">
            <h3 className="text-sm font-bold text-planet-text uppercase tracking-wider mb-2">
              Photos & Lender Guidelines
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-solana-green" />
                <span>Primary Photo URL</span>
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or direct image link"
                className="w-full h-10 px-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none"
                required
              />

              {photoUrl && (
                <div className="mt-2 h-36 w-full rounded-xl overflow-hidden border border-planet-border bg-surface-elevated">
                  <img src={photoUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
                Included Accessories & Bag Items
              </label>
              <input
                type="text"
                value={accessories}
                onChange={(e) => setAccessories(e.target.value)}
                placeholder="e.g. 2x batteries, dual charger, carrying bag, lens cap"
                className="w-full h-10 px-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
                Care Rules & Warnings
              </label>
              <textarea
                rows={3}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="e.g. Handle with neck strap engaged. Keep dry. Return batteries charged."
                className="w-full p-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep(1)} className="w-1/3">
                ← Back
              </Button>
              <Button type="button" variant="primary" onClick={() => setStep(3)} className="w-2/3">
                Continue to Rates & Escrow →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Rates, Escrow Deposit & Meeting Zone */}
        {step === 3 && (
          <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-4 animate-in fade-in duration-150">
            <h3 className="text-sm font-bold text-planet-text uppercase tracking-wider mb-2">
              Rental Rates & Safe Meeting Zone
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0.01"
                label="Daily Rate (SOL)"
                value={dailyRateSol}
                onChange={(e) => setDailyRateSol(e.target.value)}
                required
              />

              <Input
                id="deposit"
                type="number"
                step="0.01"
                min="0"
                label="Refundable Deposit (SOL)"
                value={depositSol}
                onChange={(e) => setDepositSol(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="minDays"
                type="number"
                min="1"
                label="Min Rental Days"
                value={minDays}
                onChange={(e) => setMinDays(Number(e.target.value))}
                required
              />

              <Input
                id="maxDays"
                type="number"
                max="90"
                label="Max Rental Days"
                value={maxDays}
                onChange={(e) => setMaxDays(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-solana-green" />
                <span>Designated Campus Meeting Zone</span>
              </label>
              <input
                type="text"
                value={pickupArea}
                onChange={(e) => setPickupArea(e.target.value)}
                placeholder="e.g. Moffitt Library 3rd Floor / Student Union North Quad"
                className="w-full h-10 px-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none"
                required
              />
              <p className="text-[11px] text-planet-subtle">
                Keep it general (library, dining hall, makerspace). Do NOT write your dorm room number.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setStep(2)} className="w-1/3">
                ← Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-2/3 font-bold"
              >
                Publish Listing to Campus
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
