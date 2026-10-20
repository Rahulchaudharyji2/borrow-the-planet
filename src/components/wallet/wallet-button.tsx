"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { formatPublicKey, getSolanaExplorerUrl } from "@/lib/solana";
import { Wallet, LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WalletButton() {
  const { publicKey, disconnect, connected, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // If wallet adapter is connecting or user clicked
  if (!connected || !publicKey) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setVisible(true)}
        isLoading={connecting}
        className="border-solana-green/40 hover:border-solana-green text-solana-green hover:bg-solana-green/10"
      >
        <Wallet className="h-4 w-4 mr-1.5" />
        Connect Wallet
        <span className="ml-1.5 px-1.5 py-0.2 text-[10px] uppercase font-mono tracking-wider bg-solana-green/15 text-solana-green rounded">
          Devnet
        </span>
      </Button>
    );
  }

  const shortened = formatPublicKey(publicKey);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-planet-border bg-surface-elevated text-xs font-mono text-planet-text hover:border-solana-green/50 transition-colors"
      >
        <div className="h-2 w-2 rounded-full bg-solana-green animate-pulse" />
        <span>{shortened}</span>
        <span className="px-1.5 py-0.5 text-[10px] uppercase font-sans font-semibold bg-emerald-500/15 text-emerald-400 rounded">
          Devnet
        </span>
      </button>

      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-planet-border bg-surface-primary p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="p-2 border-b border-planet-border/60 mb-2">
              <div className="flex items-center gap-1.5 text-xs text-planet-muted font-medium mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-solana-green" />
                <span>Connected to Solana Devnet</span>
              </div>
              <p className="font-mono text-xs text-planet-text break-all">
                {publicKey.toBase58()}
              </p>
            </div>

            <div className="space-y-1">
              <a
                href={getSolanaExplorerUrl(publicKey.toBase58(), "address")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs text-planet-muted hover:text-planet-text hover:bg-surface-hover rounded-lg transition-colors"
              >
                <span>View on Solana Explorer</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                onClick={() => {
                  disconnect();
                  setDropdownOpen(false);
                }}
                className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <span>Disconnect</span>
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
