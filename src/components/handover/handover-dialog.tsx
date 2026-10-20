"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Camera, CheckSquare, AlertTriangle, Image as ImageIcon } from "lucide-react";

interface HandoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  itemTitle: string;
  isLender: boolean;
  mode: "handover" | "return";
  onSuccess: () => void;
}

export function HandoverDialog({
  open,
  onOpenChange,
  bookingId,
  itemTitle,
  isLender,
  mode,
  onSuccess,
}: HandoverDialogProps) {
  const [conditionConfirmed, setConditionConfirmed] = useState(true);
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoList, setPhotoList] = useState<string[]>([]);
  const [hasDisagreement, setHasDisagreement] = useState(false);
  const [disagreementNote, setDisagreementNote] = useState("");
  const [depositReleaseApproved, setDepositReleaseApproved] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Checklists based on mode
  const [checkFunctional, setCheckFunctional] = useState(true);
  const [checkAccessories, setCheckAccessories] = useState(true);
  const [checkCleanliness, setCheckCleanliness] = useState(true);

  const handleAddPhoto = () => {
    if (photoUrl && photoUrl.startsWith("http")) {
      setPhotoList([...photoList, photoUrl.trim()]);
      setPhotoUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = mode === "handover"
      ? `/api/bookings/${bookingId}/handover`
      : `/api/bookings/${bookingId}/return`;

    const payload = mode === "handover"
      ? {
          conditionConfirmed,
          conditionNotes: notes,
          checklist: {
            itemFunctional: checkFunctional,
            accessoriesComplete: checkAccessories,
            cleanlinessStandard: checkCleanliness,
          },
          photoUrls: photoList,
          hasDisagreement,
          disagreementNote: hasDisagreement ? disagreementNote : undefined,
        }
      : {
          conditionConfirmed,
          comparisonNotes: notes,
          checklist: {
            itemFunctional: checkFunctional,
            accessoriesComplete: checkAccessories,
            cleanlinessStandard: checkCleanliness,
          },
          photoUrls: photoList,
          depositReleaseApproved: isLender ? depositReleaseApproved : false,
          hasDisagreement,
          disagreementNote: hasDisagreement ? disagreementNote : undefined,
        };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record evidence checklist");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit evidence");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "handover" ? "Handover Inspection" : "Return & Settlement Verification"}
          </DialogTitle>
          <DialogDescription>
            {mode === "handover"
              ? `Acknowledge physical receipt and condition for “${itemTitle}”.`
              : `Inspect item returned by borrower before releasing deposit and settling escrow.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-planet-danger/10 border border-planet-danger/20 text-xs text-planet-danger">
              {error}
            </div>
          )}

          {/* Checklist Primitives */}
          <div className="rounded-xl border border-planet-border bg-surface-elevated p-4 space-y-2.5">
            <h4 className="text-xs font-semibold text-planet-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-solana-green" />
              <span>Inspection Checklist</span>
            </h4>

            <label className="flex items-center gap-2.5 text-xs text-planet-text cursor-pointer">
              <input
                type="checkbox"
                checked={checkFunctional}
                onChange={(e) => setCheckFunctional(e.target.checked)}
                className="h-4 w-4 rounded border-planet-border bg-[#0D1117] text-solana-green focus:ring-solana-green"
              />
              <span>Item powers on and operates as expected</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-planet-text cursor-pointer">
              <input
                type="checkbox"
                checked={checkAccessories}
                onChange={(e) => setCheckAccessories(e.target.checked)}
                className="h-4 w-4 rounded border-planet-border bg-[#0D1117] text-solana-green focus:ring-solana-green"
              />
              <span>All cables, batteries, cases, and accessories accounted for</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-planet-text cursor-pointer">
              <input
                type="checkbox"
                checked={checkCleanliness}
                onChange={(e) => setCheckCleanliness(e.target.checked)}
                className="h-4 w-4 rounded border-planet-border bg-[#0D1117] text-solana-green focus:ring-solana-green"
              />
              <span>Clean and undamaged beyond normal expected cosmetic wear</span>
            </label>
          </div>

          {/* Condition Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
              {mode === "handover" ? "Condition Observations" : "Before/After Comparison Notes"}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lens checked clean, battery 100%, minor surface scratch on left corner..."
              className="w-full p-2.5 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none"
            />
          </div>

          {/* Photo Evidence attachments */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-planet-subtle" />
              <span>Attach Verification Photo URL</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or image link"
                className="flex-1 h-9 px-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddPhoto}>
                Add Photo
              </Button>
            </div>

            {photoList.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-1">
                {photoList.map((url, i) => (
                  <div key={i} className="relative h-14 w-14 rounded-lg overflow-hidden border border-planet-border flex-shrink-0">
                    <img src={url} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mode specific settlement controls */}
          {mode === "return" && isLender && (
            <div className="p-3 rounded-lg border border-solana-green/30 bg-solana-green/5 space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-planet-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={depositReleaseApproved}
                  onChange={(e) => setDepositReleaseApproved(e.target.checked)}
                  className="h-4 w-4 rounded border-planet-border text-solana-green focus:ring-solana-green"
                />
                <span>Approve full security deposit refund back to borrower</span>
              </label>
            </div>
          )}

          {/* Record Disagreement without forcing false consensus */}
          <div className="pt-2 border-t border-planet-border/60">
            <label className="flex items-center gap-2 text-xs text-amber-400 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={hasDisagreement}
                onChange={(e) => setHasDisagreement(e.target.checked)}
                className="h-4 w-4 rounded border-planet-border text-amber-500 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" />
                Flag condition disagreement or missing accessory
              </span>
            </label>

            {hasDisagreement && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <textarea
                  rows={2}
                  value={disagreementNote}
                  onChange={(e) => setDisagreementNote(e.target.value)}
                  placeholder="Explain exactly what is missing or damaged so reviewer can fairly evaluate..."
                  className="w-full p-2.5 rounded-lg border border-amber-500/30 bg-surface-elevated text-xs text-planet-text focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant={hasDisagreement ? "danger" : "primary"}
            size="lg"
            isLoading={loading}
            className="w-full"
          >
            {hasDisagreement
              ? "Submit Evidence & Open Incident Review"
              : `Sign & Confirm ${mode === "handover" ? "Handover" : "Return Settlement"}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
