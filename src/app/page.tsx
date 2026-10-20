import React from "react";
import Link from "next/link";
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  Layers,
  Repeat,
  Compass,
  Camera,
  Laptop,
  Wrench,
  BookOpen,
  GraduationCap,
  Shield,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { ItemCard } from "@/components/marketplace/item-card";

export const revalidate = 60;

export default async function HomePage() {
  // Fetch initial featured items from database
  const featuredListings = await prisma.listing.findMany({
    where: { status: "PUBLISHED" },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      photos: { take: 1 },
      lender: {
        select: {
          id: true,
          name: true,
          avatar: true,
          campus: true,
          credentials: {
            where: { status: "ACTIVE" },
            select: {
              rentalsCompleted: true,
              onTimeReturnRatePercent: true,
              disputeFreeRatePercent: true,
            },
            take: 1,
          },
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-planet-border/60">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[600px] bg-solana-green/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 h-72 w-72 bg-solana-purple/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-solana-green/30 bg-solana-green/5 text-xs font-mono text-solana-green">
              <span className="h-1.5 w-1.5 rounded-full bg-solana-green animate-pulse" />
              <span>Campus Resource Marketplace • Team Beast Coder</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-planet-text leading-[1.1]">
              Good things are <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-solana-green via-white to-purple-300">
                better shared.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-planet-muted leading-relaxed max-w-2xl">
              Borrow quality gear, cameras, and maker tools from students in your campus
              community instead of buying things you only use once. Secured by Solana smart
              escrows and portable, privacy-conscious <strong className="text-purple-300">PlanetPass</strong> credentials.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="/explore">
                <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                  <span>Explore Items</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/dashboard/listings/new">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  List an Item
                </Button>
              </Link>

              <Link href="/planetpass">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto text-purple-300 hover:text-white">
                  Discover PlanetPass →
                </Button>
              </Link>
            </div>
          </div>

          {/* Curated Editorial Grid Preview */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative rounded-2xl border border-planet-border overflow-hidden bg-surface-primary group">
              <img
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"
                alt="Photography and Cinema gear"
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 flex flex-col justify-end">
                <span className="text-xs font-mono text-solana-green uppercase tracking-wider">Cameras & Creative</span>
                <h3 className="text-base font-bold text-white">Full-frame bodies, primes & wireless audio</h3>
              </div>
            </div>

            <div className="relative rounded-2xl border border-planet-border overflow-hidden bg-surface-primary group">
              <img
                src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80"
                alt="Ultralight backpacking gear"
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 flex flex-col justify-end">
                <span className="text-xs font-mono text-solana-green uppercase tracking-wider">Outdoor & Expedition</span>
                <h3 className="text-base font-bold text-white">Ultralight tents, packs & stove cooksets</h3>
              </div>
            </div>

            <div className="relative rounded-2xl border border-planet-border overflow-hidden bg-surface-primary group">
              <img
                src="https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80"
                alt="Maker and DIY tools"
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 flex flex-col justify-end">
                <span className="text-xs font-mono text-solana-green uppercase tracking-wider">Makerspace & Tools</span>
                <h3 className="text-base font-bold text-white">Cordless drills, soldering stations & toolkits</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Item Discovery Categories Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-planet-text tracking-tight">
              Believable Campus Gear Categories
            </h2>
            <p className="text-xs text-planet-muted mt-1">
              Curated resource categories that college students and local communities actually share.
            </p>
          </div>
          <Link href="/explore">
            <Button variant="outline" size="sm" className="gap-1.5 self-start">
              <span>View Marketplace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Electronics", icon: Laptop, category: "ELECTRONICS", desc: "Projectors & displays" },
            { label: "Cameras", icon: Camera, category: "CAMERAS", desc: "Lenses, rigs & lighting" },
            { label: "Outdoor", icon: Compass, category: "OUTDOOR", desc: "Tents, sleeping bags" },
            { label: "Tools", icon: Wrench, category: "TOOLS", desc: "Drills, kits, wrenches" },
            { label: "Books", icon: BookOpen, category: "BOOKS", desc: "Textbooks & reference" },
            { label: "Campus Needs", icon: GraduationCap, category: "CAMPUS_ESSENTIALS", desc: "Calculators & audio" },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.category}
                href={`/explore?category=${cat.category}`}
                className="group flex flex-col p-4 rounded-xl border border-planet-border bg-surface-primary hover:border-solana-green/40 hover:-translate-y-1 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated text-solana-green group-hover:bg-solana-green group-hover:text-black transition-colors mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-planet-text">{cat.label}</h4>
                <p className="text-[11px] text-planet-subtle mt-0.5">{cat.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Active Listings from Database */}
      {featuredListings.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-solana-green" />
                <span className="text-xs font-mono uppercase text-solana-green">Active Campus Listings</span>
              </div>
              <h2 className="text-2xl font-bold text-planet-text tracking-tight">
                Recently Listed on Devnet
              </h2>
            </div>
            <Link href="/explore">
              <Button variant="ghost" size="sm">
                See all items →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredListings.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        </section>
      )}

      {/* 4. How It Works: Step-by-Step */}
      <section className="border-y border-planet-border/60 bg-surface-elevated/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-mono uppercase text-solana-green tracking-wider">Protocol Workflow</span>
            <h2 className="text-3xl font-bold text-planet-text tracking-tight mt-1">
              Discover → Book → Handover → Return
            </h2>
            <p className="text-sm text-planet-muted mt-2">
              Every step is designed for maximum clarity, fair dispute handling, and cryptographic integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-xl border border-planet-border bg-surface-primary p-5 space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated font-mono font-bold text-solana-green">
                01
              </div>
              <h3 className="text-base font-semibold text-planet-text">Discover</h3>
              <p className="text-xs text-planet-muted leading-relaxed">
                Filter by campus hub, category, and daily rates. Inspect lender reputation and
                safe general meeting zones.
              </p>
            </div>

            <div className="rounded-xl border border-planet-border bg-surface-primary p-5 space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated font-mono font-bold text-solana-green">
                02
              </div>
              <h3 className="text-base font-semibold text-planet-text">Book & Escrow</h3>
              <p className="text-xs text-planet-muted leading-relaxed">
                Rental fee and 100% refundable security deposit are locked into a Solana
                Devnet smart escrow PDA. No hidden fees.
              </p>
            </div>

            <div className="rounded-xl border border-planet-border bg-surface-primary p-5 space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated font-mono font-bold text-solana-green">
                03
              </div>
              <h3 className="text-base font-semibold text-planet-text">Inspect Handover</h3>
              <p className="text-xs text-planet-muted leading-relaxed">
                Meet at the campus union or library. Walk through condition checklists and
                upload time-stamped photo evidence together.
              </p>
            </div>

            <div className="rounded-xl border border-planet-border bg-surface-primary p-5 space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated font-mono font-bold text-solana-green">
                04
              </div>
              <h3 className="text-base font-semibold text-planet-text">Return & Settle</h3>
              <p className="text-xs text-planet-muted leading-relaxed">
                Lender verifies item in good order. Escrow automatically releases rental payout
                and refunds the security deposit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PlanetPass Feature Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-solana-purple/30 bg-gradient-to-br from-[#1C2430] via-surface-primary to-[#161B22] p-8 md:p-12 relative overflow-hidden">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-400/30 bg-solana-purple/10 text-xs font-mono text-purple-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Core Differentiator: PlanetPass</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-planet-text tracking-tight">
              Trust Travels. Portable Rental Credentials.
            </h2>

            <p className="text-sm text-planet-muted leading-relaxed">
              Why build rental reputation on a closed platform where you can’t take it with you?
              PlanetPass issues tamper-evident, cryptographically signed credentials based on
              verified rental milestones.
            </p>

            <ul className="space-y-3 text-xs text-planet-text">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-solana-green flex-shrink-0" />
                <span><strong>Consent-Based Sharing:</strong> You choose which claims to disclose using selective disclosure.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-solana-green flex-shrink-0" />
                <span><strong>Privacy-First:</strong> Sensitive identity documents and private chats remain strictly off-chain.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-solana-green flex-shrink-0" />
                <span><strong>Evidence-Aware:</strong> Missing history is never equated with bad behavior.</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link href="/planetpass">
                <Button variant="purple" size="md">
                  Explore PlanetPass Architecture
                </Button>
              </Link>
              <Link href="/verify/c460b3de-0863-4ba9-9dc4-83e747b0a390?token=share_token_alice_verified_pass_2026">
                <Button variant="outline" size="md">
                  View Demo Verification
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Trust, Evidence & Dispute Resolution */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-solana-green tracking-wider">
              <Shield className="h-4 w-4" />
              <span>Trust & Fair Review</span>
            </div>

            <h2 className="text-3xl font-bold text-planet-text tracking-tight">
              Evidence-based mediation, not arbitrary ratings.
            </h2>

            <p className="text-sm text-planet-muted leading-relaxed">
              We never claim that a blockchain can miraculously know whether a physical camera was
              returned intact. Instead, we combine refundable security deposits, timestamped handover
              evidence, and a human dispute arbitration council.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-surface-elevated flex items-center justify-center text-solana-green text-xs font-bold flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-planet-text">No Automatic Punishment</h4>
                  <p className="text-[11px] text-planet-muted">Filing a report does not penalize either party until reviewed by an authorized arbiter.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-surface-elevated flex items-center justify-center text-solana-green text-xs font-bold flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-planet-text">Right of Correction & Appeal</h4>
                  <p className="text-[11px] text-planet-muted">Misunderstandings happen. Users have documented paths to correct mistakes and submit additional proof.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-planet-border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-solana-green" />
                <span className="text-xs font-semibold text-planet-text">Audited Dispute Example</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Under Review
              </span>
            </div>

            <p className="text-xs text-planet-muted">
              “Missing HDMI adapter after projector drop-off. Both parties submitted timestamps; borrower
              returned adapter the next morning at Moffitt Library without penalty.”
            </p>

            <div className="p-3 rounded-lg bg-[#0D1117] text-[11px] font-mono text-planet-subtle space-y-1">
              <div>Resolution: Item returned in order • 100% deposit refunded</div>
              <div>Arbiter: Campus Trust Council • Event ID: btp-audit-2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Planet Impact Ledger Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-planet-border bg-surface-elevated p-8 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase text-solana-green tracking-wider">
              Transparent Activity Ledger
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-planet-text">
              Defensible Sharing Metrics
            </h2>
            <p className="text-xs text-planet-muted">
              We track real database events rather than inventing speculative CO₂ savings numbers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl border border-planet-border bg-surface-primary">
              <div className="text-2xl font-bold font-mono text-solana-green">100%</div>
              <div className="text-[11px] text-planet-muted mt-1">Devnet Escrow Backed</div>
            </div>
            <div className="p-4 rounded-xl border border-planet-border bg-surface-primary">
              <div className="text-2xl font-bold font-mono text-planet-text">0.05 SOL</div>
              <div className="text-[11px] text-planet-muted mt-1">Starting Daily Rate</div>
            </div>
            <div className="p-4 rounded-xl border border-planet-border bg-surface-primary">
              <div className="text-2xl font-bold font-mono text-purple-300">Portable</div>
              <div className="text-[11px] text-planet-muted mt-1">PlanetPass Credentials</div>
            </div>
            <div className="p-4 rounded-xl border border-planet-border bg-surface-primary">
              <div className="text-2xl font-bold font-mono text-solana-green">Consent</div>
              <div className="text-[11px] text-planet-muted mt-1">Privacy-First Data</div>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/dashboard/impact">
              <Button variant="outline" size="sm">
                View Full Impact Ledger →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
