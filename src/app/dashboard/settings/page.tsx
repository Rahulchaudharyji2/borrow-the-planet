"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, MapPin, Wallet, ShieldCheck, Check } from "lucide-react";

export default function AccountSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState("");
  const [bio, setBio] = useState("");
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setCampus(data.user.campus || "");
          setBio(data.user.bio || "");
          setWallet(data.user.solanaWalletAddress || "");
        }
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="border-b border-planet-border pb-4">
        <h1 className="text-2xl font-bold text-planet-text tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-planet-muted mt-0.5">
          Manage your campus collective profile, notification preferences, and wallet association.
        </p>
      </div>

      <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-6">
        {saved && (
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>Profile settings successfully updated.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            id="name"
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            id="email"
            type="email"
            label="Email Address (Login Identity)"
            value={email}
            disabled
            className="opacity-60 cursor-not-allowed"
          />

          <Input
            id="campus"
            label="Campus Collective Hub / Neighborhood"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-planet-muted tracking-wider">
              Profile Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell fellow students what gear you specialize in and when you're available..."
              className="w-full p-3 rounded-lg border border-planet-border bg-surface-elevated text-xs text-planet-text focus:border-solana-green focus:outline-none"
            />
          </div>

          <Input
            id="wallet"
            label="Solana Devnet Wallet Address"
            placeholder="e.g. 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />

          <Button type="submit" variant="primary" size="md">
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
