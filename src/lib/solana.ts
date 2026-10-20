import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";

export const DEVNET_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");

export const ESCROW_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_ESCROW_PROGRAM_ID || "BorrEscrow111111111111111111111111111111111"
);

export function getDevnetConnection(): Connection {
  return new Connection(DEVNET_RPC_URL, "confirmed");
}

export function formatPublicKey(pubkey: string | PublicKey | null | undefined): string {
  if (!pubkey) return "Not connected";
  const str = typeof pubkey === "string" ? pubkey : pubkey.toBase58();
  if (str.length <= 10) return str;
  return `${str.slice(0, 4)}...${str.slice(-4)}`;
}

export function lamportsToSol(lamports: number | bigint): string {
  const lamportsBig = BigInt(lamports);
  const solWhole = lamportsBig / BigInt(1_000_000_000);
  const solFraction = lamportsBig % BigInt(1_000_000_000);
  const fractionStr = solFraction.toString().padStart(9, "0").replace(/0+$/, "");
  return fractionStr.length > 0 ? `${solWhole}.${fractionStr}` : `${solWhole}`;
}

export function solToLamports(solAmount: number | string): number {
  const parts = String(solAmount).trim().split(".");
  const whole = BigInt(parts[0] || "0");
  let fracStr = (parts[1] || "").slice(0, 9);
  fracStr = fracStr.padEnd(9, "0");
  const frac = BigInt(fracStr);
  return Number(whole * BigInt(1_000_000_000) + frac);
}

export function getEscrowPda(bookingId: string): [PublicKey, number] {
  // PDA seeded by [b"escrow", booking_id]
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), Buffer.from(bookingId)],
    ESCROW_PROGRAM_ID
  );
}

export function getSolanaExplorerUrl(signatureOrAddress: string, type: "tx" | "address" = "tx"): string {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
  return `https://explorer.solana.com/${type}/${signatureOrAddress}?cluster=${cluster}`;
}
