import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCents, formatDate } from "@/lib/utils";
import { lamportsToSol } from "@/lib/solana";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default async function DashboardOverviewPage() {
  const session = await getSession();
  if (!session) return null;

  // Real database metrics for authenticated user
  const [borrowedBookings, lentBookings, listings, credentials, activeDisputes] =
    await Promise.all([
      prisma.booking.findMany({
        where: { borrowerId: session.userId },
        include: {
          listing: { include: { photos: { take: 1 } } },
          lender: { select: { id: true, name: true, campus: true } },
          handoverRecord: true,
          returnRecord: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.booking.findMany({
        where: { lenderId: session.userId },
        include: {
          listing: { include: { photos: { take: 1 } } },
          borrower: { select: { id: true, name: true, campus: true } },
          handoverRecord: true,
          returnRecord: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.listing.findMany({
        where: { lenderId: session.userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.planetPassCredential.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 1,
      }),
      prisma.dispute.findMany({
        where: {
          OR: [
            { reporterId: session.userId },
            { respondentId: session.userId },
          ],
          status: { in: ["REPORTED", "AWAITING_RESPONSE", "UNDER_REVIEW"] },
        },
      }),
    ]);

  const activeBorrowings = borrowedBookings.filter(
    (b) => b.status === "ESCROW_FUNDED" || b.status === "HANDED_OVER" || b.status === "RETURN_PENDING"
  );
  const pendingRequests = lentBookings.filter((b) => b.status === "PENDING");
  const activeCredential = credentials.length > 0 ? credentials[0] : null;

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-planet-text tracking-tight">
            Welcome back, {session.name}
          </h1>
          <p className="text-xs text-planet-muted mt-1">
            Real-time status of your peer borrowings, lent equipment, and verifiable reputation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/listings/new">
            <Button variant="primary" size="sm" className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              <span>List New Item</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Required Banner if active dispute or pending request exists */}
      {(pendingRequests.length > 0 || activeDisputes.length > 0) && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <AlertCircle className="h-4 w-4" />
            <span>Items Requiring Your Attention</span>
          </div>
          <div className="text-xs text-planet-text space-y-1">
            {pendingRequests.length > 0 && (
              <div>
                • You have <strong className="text-amber-300">{pendingRequests.length}</strong> new rental request(s) awaiting review.{" "}
                <Link href="/dashboard/requests" className="underline text-solana-green ml-1">
                  View Requests →
                </Link>
              </div>
            )}
            {activeDisputes.length > 0 && (
              <div>
                • You have <strong className="text-amber-300">{activeDisputes.length}</strong> active incident report under mediation.{" "}
                <Link href="/dashboard/disputes" className="underline text-solana-green ml-1">
                  View Incident Details →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-planet-border bg-surface-primary p-4 space-y-1">
          <span className="text-[10px] font-semibold uppercase text-planet-subtle tracking-wider">
            Active Borrowings
          </span>
          <div className="text-2xl font-bold font-mono text-solana-green">
            {activeBorrowings.length}
          </div>
          <p className="text-[11px] text-planet-muted">Currently in possession</p>
        </div>

        <div className="rounded-xl border border-planet-border bg-surface-primary p-4 space-y-1">
          <span className="text-[10px] font-semibold uppercase text-planet-subtle tracking-wider">
            Active Listings
          </span>
          <div className="text-2xl font-bold font-mono text-planet-text">
            {listings.filter((l) => l.status === "PUBLISHED").length}
          </div>
          <p className="text-[11px] text-planet-muted">Published on campus</p>
        </div>

        <div className="rounded-xl border border-planet-border bg-surface-primary p-4 space-y-1">
          <span className="text-[10px] font-semibold uppercase text-planet-subtle tracking-wider">
            Completed Rentals
          </span>
          <div className="text-2xl font-bold font-mono text-solana-green">
            {borrowedBookings.filter((b) => b.status === "COMPLETED").length}
          </div>
          <p className="text-[11px] text-planet-muted">Full return verified</p>
        </div>

        <div className="rounded-xl border border-solana-purple/30 bg-solana-purple/10 p-4 space-y-1">
          <span className="text-[10px] font-semibold uppercase text-purple-300 tracking-wider">
            PlanetPass Status
          </span>
          <div className="text-2xl font-bold font-mono text-purple-200">
            {activeCredential ? activeCredential.status : "Pending"}
          </div>
          <p className="text-[11px] text-planet-muted">
            {activeCredential ? `${activeCredential.rentalsCompleted} verified rentals` : "Issue via dashboard"}
          </p>
        </div>
      </div>

      {/* Active Borrowings Section */}
      <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-planet-border">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-solana-green" />
            <h3 className="text-sm font-bold text-planet-text uppercase tracking-wider">
              Current Borrowings
            </h3>
          </div>
          <Link href="/dashboard/bookings" className="text-xs text-solana-green hover:underline">
            View All ({borrowedBookings.length}) →
          </Link>
        </div>

        {borrowedBookings.length > 0 ? (
          <div className="divide-y divide-planet-border/60">
            {borrowedBookings.map((b) => (
              <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-surface-elevated overflow-hidden border border-planet-border flex-shrink-0">
                    {b.listing.photos[0] ? (
                      <img src={b.listing.photos[0].url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6 text-planet-subtle m-3" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-planet-text">{b.listing.title}</h4>
                    <p className="text-xs text-planet-muted">
                      Lender: {b.lender.name} • {formatDate(b.startDate)} to {formatDate(b.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="font-mono text-xs font-semibold text-solana-green">
                    {lamportsToSol(b.totalDueLamports)} SOL
                  </span>
                  <Badge variant={b.status === "COMPLETED" ? "success" : "purple"}>
                    {b.status}
                  </Badge>
                  <Link href={`/dashboard/bookings?highlight=${b.id}`}>
                    <Button variant="outline" size="sm">
                      Inspect
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-planet-muted space-y-2">
            <p>You have no active borrowings at this moment.</p>
            <Link href="/explore">
              <Button variant="secondary" size="sm">
                Browse Campus Gear
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* PlanetPass Quick Preview */}
      <div className="rounded-2xl border border-solana-purple/30 bg-gradient-to-br from-[#1C2430] via-surface-primary to-[#161B22] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-solana-purple/20 text-purple-300">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-planet-text">
                PlanetPass Portable Credential
              </h3>
              <p className="text-xs text-planet-muted">
                Cryptographic trust profile portable across peer networks.
              </p>
            </div>
          </div>

          <Link href="/dashboard/planetpass">
            <Button variant="purple" size="sm" className="gap-1.5">
              <span>Manage Credential</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {activeCredential && (
          <div className="pt-2 border-t border-planet-border/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-planet-subtle text-[10px] uppercase block">Rentals</span>
              <span className="font-mono font-bold text-planet-text">{activeCredential.rentalsCompleted} verified</span>
            </div>
            <div>
              <span className="text-planet-subtle text-[10px] uppercase block">On-Time Rate</span>
              <span className="font-mono font-bold text-solana-green">{activeCredential.onTimeReturnRatePercent.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-planet-subtle text-[10px] uppercase block">Dispute-Free</span>
              <span className="font-mono font-bold text-purple-300">{activeCredential.disputeFreeRatePercent.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-planet-subtle text-[10px] uppercase block">Status</span>
              <span className="font-mono font-bold text-emerald-400">{activeCredential.status}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
