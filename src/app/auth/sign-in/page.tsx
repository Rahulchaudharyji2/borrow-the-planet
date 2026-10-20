"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Shield, Sparkles, User, AlertCircle, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-solana-green to-solana-purple p-[1px]">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#0D1117]">
              <Globe className="h-5 w-5 text-solana-green" />
            </div>
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-planet-text tracking-tight">
          Sign In to Borrow the Planet
        </h1>
        <p className="text-xs text-planet-muted">
          Access your bookings, items lent, and PlanetPass credentials.
        </p>
      </div>

      {/* Main Login Form */}
      <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 shadow-card space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-planet-danger/10 border border-planet-danger/20 text-xs text-planet-danger">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="you@campus.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full font-semibold"
          >
            Sign In
          </Button>
        </form>

        {/* Quick Demo Fill Buttons for Easy Evaluation */}
        <div className="pt-4 border-t border-planet-border/60 space-y-2">
          <span className="text-[11px] uppercase font-mono tracking-wider text-planet-subtle block text-center">
            One-Click Demo Profiles
          </span>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("demo_alice@borrowtheplanet.dev")}
              className="flex items-center justify-between p-2.5 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text hover:border-solana-green/40 hover:bg-surface-hover transition-colors"
            >
              <span>Alice Vance (Borrower & Camera Lender)</span>
              <span className="font-mono text-[10px] text-solana-green">Select</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("demo_marcus@borrowtheplanet.dev")}
              className="flex items-center justify-between p-2.5 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text hover:border-solana-green/40 hover:bg-surface-hover transition-colors"
            >
              <span>Marcus Chen (Tool & Tent Owner)</span>
              <span className="font-mono text-[10px] text-solana-green">Select</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("reviewer@borrowtheplanet.dev")}
              className="flex items-center justify-between p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs text-amber-300 hover:border-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <span>Campus Arbiter (Authorized Reviewer)</span>
              <span className="font-mono text-[10px] text-amber-400">Reviewer</span>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-planet-muted">
        Don&apos;t have an account yet?{" "}
        <Link href="/auth/sign-up" className="text-solana-green font-medium hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
