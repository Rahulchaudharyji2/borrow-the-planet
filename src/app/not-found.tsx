import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, ArrowLeft, PackageSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated text-solana-green border border-planet-border">
        <PackageSearch className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <div className="font-mono text-xs uppercase text-solana-green tracking-wider">
          404 • Resource Not Found
        </div>
        <h1 className="text-3xl font-extrabold text-planet-text tracking-tight">
          Page or Item Not Found
        </h1>
        <p className="text-xs text-planet-muted leading-relaxed">
          The listing, credential presentation, or route you requested does not exist or has been moved.
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <Link href="/">
          <Button variant="secondary" size="md" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Home</span>
          </Button>
        </Link>
        <Link href="/explore">
          <Button variant="primary" size="md">
            Explore Marketplace
          </Button>
        </Link>
      </div>
    </div>
  );
}
