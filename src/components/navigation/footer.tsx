import React from "react";
import Link from "next/link";
import { Globe, Shield, Sparkles, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-planet-border bg-[#0D1117] text-planet-muted text-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-solana-green to-solana-purple p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#0D1117]">
                  <Globe className="h-4 w-4 text-solana-green" />
                </div>
              </div>
              <span className="text-base font-bold text-planet-text tracking-tight">
                Borrow the Planet
              </span>
            </div>
            <p className="text-xs font-mono text-solana-green tracking-wide">
              “Borrow more. Own less. Trust travels.”
            </p>
            <p className="text-xs text-planet-muted leading-relaxed max-w-sm">
              A community resource-sharing marketplace built for campus collectives and
              beyond. Empowered by Solana devnet smart escrows and verifiable,
              privacy-conscious PlanetPass credentials.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-elevated border border-planet-border text-[11px] font-mono text-planet-text">
              <span className="h-1.5 w-1.5 rounded-full bg-solana-green" />
              <span>Created by Team Beast Coder</span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-planet-text">
              Product
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/explore" className="hover:text-solana-green transition-colors">
                  Explore Items
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-solana-green transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/planetpass" className="hover:text-solana-green transition-colors">
                  PlanetPass Credential
                </Link>
              </li>
              <li>
                <Link href="/dashboard/impact" className="hover:text-solana-green transition-colors">
                  Impact Ledger
                </Link>
              </li>
              <li>
                <Link href="/dashboard/listings/new" className="hover:text-solana-green transition-colors">
                  List an Item
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-planet-text">
              Trust & Protocol
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/safety" className="hover:text-solana-green transition-colors">
                  Fair Escrow & Safety
                </Link>
              </li>
              <li>
                <Link href="/safety#disputes" className="hover:text-solana-green transition-colors">
                  Dispute Resolution
                </Link>
              </li>
              <li>
                <Link href="/planetpass#verify" className="hover:text-solana-green transition-colors">
                  Independent Verifier
                </Link>
              </li>
              <li>
                <a
                  href="https://explorer.solana.com/?cluster=devnet"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-solana-green transition-colors"
                >
                  <span>Solana Devnet Explorer</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-planet-text">
              Governance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-solana-green transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-solana-green transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/admin/review" className="hover:text-solana-green transition-colors">
                  Reviewer Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-planet-border/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Borrow the Planet. Built by Team Beast Coder.</p>
          <p className="font-mono text-planet-subtle text-[11px]">
            Solana Devnet • Anchor 0.30.1 • Ed25519/HMAC PlanetPass Core
          </p>
        </div>
      </div>
    </footer>
  );
}
