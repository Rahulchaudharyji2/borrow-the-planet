"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Inbox,
  Package,
  PlusCircle,
  Layers,
  Wallet,
  Receipt,
  Leaf,
  AlertTriangle,
  Settings,
  Shield,
  ExternalLink,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  campus?: string;
  solanaWalletAddress?: string | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/auth/sign-in");
        } else {
          setUser(data.user);
          setLoading(false);
        }
      })
      .catch(() => {
        router.push("/auth/sign-in");
      });
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-xs text-planet-muted">
        Authenticating session and loading dashboard...
      </div>
    );
  }

  const sidebarLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/bookings", label: "My Bookings", icon: CalendarCheck },
    { href: "/dashboard/requests", label: "Lending Requests", icon: Inbox },
    { href: "/dashboard/listings", label: "My Listings", icon: Package },
    { href: "/dashboard/listings/new", label: "New Listing", icon: PlusCircle },
    { href: "/dashboard/planetpass", label: "PlanetPass", icon: Layers, highlight: true },
    { href: "/dashboard/wallet", label: "Solana Wallet", icon: Wallet },
    { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
    { href: "/dashboard/impact", label: "Impact Ledger", icon: Leaf },
    { href: "/dashboard/disputes", label: "Disputes & Incidents", icon: AlertTriangle },
    { href: "/dashboard/settings", label: "Account Settings", icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="md:col-span-3 space-y-6">
          {/* User Quick Info */}
          <div className="rounded-2xl border border-planet-border bg-surface-primary p-4 space-y-3">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover border border-planet-border"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-solana-green/10 text-solana-green flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name[0] : "U"}
                </div>
              )}
              <div className="overflow-hidden">
                <h3 className="text-sm font-bold text-planet-text truncate">{user?.name}</h3>
                <p className="text-[11px] text-planet-subtle truncate">{user?.campus}</p>
              </div>
            </div>

            {user?.role === "REVIEWER" && (
              <Link href="/admin/review" className="block">
                <div className="flex items-center justify-between p-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 hover:bg-amber-500/15 transition-colors">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Shield className="h-3.5 w-3.5" />
                    Reviewer Panel
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </Link>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="rounded-2xl border border-planet-border bg-surface-primary p-2 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-solana-green/10 text-solana-green font-semibold"
                      : link.highlight
                      ? "text-purple-300 hover:bg-solana-purple/10"
                      : "text-planet-muted hover:text-planet-text hover:bg-surface-hover"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${link.highlight && !isActive ? "text-solana-purple" : ""}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.highlight && (
                    <span className="h-1.5 w-1.5 rounded-full bg-solana-purple" />
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Dashboard Content Area */}
        <main className="md:col-span-9">{children}</main>
      </div>
    </div>
  );
}
