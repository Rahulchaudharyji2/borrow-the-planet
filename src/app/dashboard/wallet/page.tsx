"use client";

import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Coins,
  AlertCircle,
} from "lucide-react";
import {
  getSolanaExplorerUrl,
  ESCROW_PROGRAM_ID,
  lamportsToSol,
} from "@/lib/solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function WalletDashboardPage() {
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();

  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [airdropping, setAirdropping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!publicKey) return;
    setLoadingBalance(true);
    try {
      const bal = await connection.getBalance(publicKey);
      setBalance(bal);
    } catch (err) {
      console.error("Balance fetch error:", err);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey]);

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRequestAirdrop = async () => {
    if (!publicKey) return;
    setAirdropping(true);
    setMessage(null);
    try {
      const sig = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig, "confirmed");
      setMessage(`Airdrop of 1 SOL confirmed on Devnet! Signature: ${sig.slice(0, 16)}...`);
      fetchBalance();
    } catch (err: unknown) {
      console.error("Airdrop error:", err);
      setMessage(
        "Devnet RPC rate limit reached. You can also use https://faucet.solana.com to fund your devnet address."
      );
    } finally {
      setAirdropping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-planet-border pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-solana-green uppercase tracking-wider mb-1">
          <Wallet className="h-3.5 w-3.5" />
          <span>Solana Web3 Integration</span>
        </div>
        <h1 className="text-2xl font-bold text-planet-text tracking-tight">
          Solana Devnet Wallet & Escrow
        </h1>
        <p className="text-xs text-planet-muted mt-0.5">
          Connect your Solana wallet to interact with on-chain rental escrows.
        </p>
      </div>

      {/* Network Transparency Notice */}
      <div className="rounded-xl border border-solana-green/30 bg-solana-green/5 p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-solana-green flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-solana-green">Active Network: Solana Devnet</h4>
          <p className="text-planet-muted leading-relaxed">
            All rental payments, escrows, and deposit refunds operate strictly on{" "}
            <strong>Solana Devnet</strong>. No real mainnet funds are ever at risk.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl border border-planet-border bg-surface-elevated text-xs text-planet-text">
          {message}
        </div>
      )}

      {/* Wallet State Card */}
      <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-6">
        {connected && publicKey ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-planet-border">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-planet-subtle tracking-wider">
                  Connected Public Key
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-planet-text break-all">
                    {publicKey.toBase58()}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1 text-planet-muted hover:text-planet-text"
                    title="Copy Address"
                  >
                    {copied ? <Check className="h-4 w-4 text-solana-green" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => disconnect()}
                className="text-xs text-planet-danger hover:text-red-400 self-start sm:self-center"
              >
                Disconnect
              </Button>
            </div>

            {/* Balance & Devnet Faucet Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-planet-border bg-surface-elevated p-4 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-planet-subtle tracking-wider">
                  Devnet Balance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-solana-green">
                    {balance !== null ? `${lamportsToSol(balance)} SOL` : "—"}
                  </span>
                  <button
                    onClick={fetchBalance}
                    disabled={loadingBalance}
                    className="text-planet-muted hover:text-planet-text"
                    title="Refresh Balance"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingBalance ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-planet-border bg-surface-elevated p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-planet-subtle tracking-wider">
                    Devnet Test Faucet
                  </span>
                  <p className="text-[11px] text-planet-muted mt-1">
                    Request 1 test SOL for peer rentals.
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRequestAirdrop}
                  isLoading={airdropping}
                  className="mt-2 self-start gap-1.5"
                >
                  <Coins className="h-3.5 w-3.5 text-solana-green" />
                  <span>Request Devnet Airdrop</span>
                </Button>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 text-xs">
              <a
                href={getSolanaExplorerUrl(publicKey.toBase58(), "address")}
                target="_blank"
                rel="noreferrer"
                className="text-solana-green hover:underline flex items-center gap-1"
              >
                <span>View on Solana Devnet Explorer</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <a
                href="https://faucet.solana.com"
                target="_blank"
                rel="noreferrer"
                className="text-planet-muted hover:text-planet-text flex items-center gap-1"
              >
                <span>Official Solana Faucet</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-elevated text-solana-green">
              <Wallet className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-planet-text">No Wallet Connected</h3>
              <p className="text-xs text-planet-muted max-w-sm mx-auto">
                Connect your Phantom, Solflare, or standard Solana wallet configured for Devnet.
              </p>
            </div>
            <Button variant="primary" size="lg" onClick={() => setVisible(true)}>
              Connect Solana Wallet
            </Button>
          </div>
        )}
      </div>

      {/* Escrow Program Information */}
      <div className="rounded-2xl border border-planet-border bg-surface-primary p-6 space-y-3">
        <h3 className="text-sm font-bold text-planet-text uppercase tracking-wider">
          On-Chain Escrow Anchor Program
        </h3>
        <p className="text-xs text-planet-muted leading-relaxed">
          The Anchor escrow program manages rental custody, handover confirmation, return
          milestone settlement, and mutual cancellation locks.
        </p>

        <div className="p-3 rounded-lg border border-planet-border bg-[#0D1117] font-mono text-xs text-planet-text flex items-center justify-between">
          <span className="text-planet-subtle text-[11px]">Program ID:</span>
          <span>{ESCROW_PROGRAM_ID.toBase58()}</span>
        </div>
      </div>
    </div>
  );
}
