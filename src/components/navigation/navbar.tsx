"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet/wallet-button";
import {
  Globe,
  Menu,
  X,
  User,
  Shield,
  Layers,
  Sparkles,
  LogOut,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  campus?: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/explore", label: "Explore" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/planetpass", label: "PlanetPass" },
    { href: "/safety", label: "Safety" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-planet-border bg-[#0D1117]/85 backdrop-blur-md">
      {/* Devnet Environment Banner */}
      <div className="w-full bg-solana-green/10 border-b border-solana-green/20 px-4 py-1 text-center text-[11px] font-mono text-solana-green flex items-center justify-center gap-2">
        <span className="flex h-1.5 w-1.5 rounded-full bg-solana-green animate-ping" />
        <span>Solana Devnet Active</span>
        <span className="text-planet-subtle">|</span>
        <span className="text-planet-muted">Powered by Team Beast Coder</span>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-solana-green to-solana-purple p-[1px] transition-transform group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#0D1117]">
                <Globe className="h-5 w-5 text-solana-green transition-transform group-hover:rotate-12" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-planet-text leading-none group-hover:text-solana-green transition-colors">
                Borrow the Planet
              </span>
              <span className="text-[10px] font-mono tracking-wider text-planet-subtle uppercase">
                Team Beast Coder
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-solana-green bg-solana-green/10"
                      : "text-planet-muted hover:text-planet-text hover:bg-surface-hover"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Center */}
        <div className="hidden md:flex items-center gap-3">
          <WalletButton />

          {!loading && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-planet-border">
              <Link href="/dashboard">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 border-solana-green/30"
                >
                  <LayoutDashboard className="h-4 w-4 text-solana-green" />
                  <span>Dashboard</span>
                </Button>
              </Link>

              {user.role === "REVIEWER" && (
                <Link href="/admin/review">
                  <Button variant="outline" size="sm" className="text-amber-400 border-amber-500/30">
                    <Shield className="h-3.5 w-3.5 mr-1" />
                    Reviewer Panel
                  </Button>
                </Link>
              )}

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-lg text-planet-muted hover:text-planet-danger hover:bg-surface-hover transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/sign-in">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="primary" size="sm">
                  Start borrowing
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-planet-muted hover:bg-surface-hover hover:text-planet-text"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-planet-border bg-[#0D1117] px-4 pt-2 pb-6 space-y-4 animate-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-planet-muted hover:text-planet-text rounded-lg hover:bg-surface-hover"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-planet-border space-y-3">
            <div className="flex justify-center">
              <WalletButton />
            </div>

            {user ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block"
                >
                  <Button variant="secondary" className="w-full justify-center">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-center text-planet-danger"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="primary" className="w-full">
                    Start borrowing
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
