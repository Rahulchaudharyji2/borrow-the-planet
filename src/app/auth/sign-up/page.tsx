"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, AlertCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [campus, setCampus] = useState("North Campus Community Hub");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, campus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
          Join Borrow the Planet
        </h1>
        <p className="text-xs text-planet-muted">
          Start borrowing and lending in your campus community.
        </p>
      </div>

      <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 shadow-card space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-planet-danger/10 border border-planet-danger/20 text-xs text-planet-danger">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            type="text"
            label="Full Name"
            placeholder="Alex Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            id="email"
            type="email"
            label="Campus or Personal Email"
            placeholder="alex@campus.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="campus"
            type="text"
            label="Campus or Neighborhood Hub"
            placeholder="e.g. UC Berkeley Northside"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            required
          />

          <Input
            id="password"
            type="password"
            label="Password (min 8 characters)"
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
            Create Account
          </Button>
        </form>
      </div>

      <div className="text-center text-xs text-planet-muted">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-solana-green font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
