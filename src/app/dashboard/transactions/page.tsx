import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCents, formatDate } from "@/lib/utils";
import { lamportsToSol, getSolanaExplorerUrl } from "@/lib/solana";
import { Receipt, ExternalLink, ArrowDownLeft, ArrowUpRight, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function TransactionsDashboardPage() {
  const session = await getSession();
  if (!session) return null;

  // Gather all transactions for user
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ borrowerId: session.userId }, { lenderId: session.userId }],
    },
    include: {
      listing: { select: { title: true } },
      borrower: { select: { name: true } },
      lender: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-planet-border pb-4">
        <h1 className="text-2xl font-bold text-planet-text tracking-tight">
          Financial & Escrow Ledger
        </h1>
        <p className="text-xs text-planet-muted mt-0.5">
          Auditable record of all rental payments, escrow deposits, and settlements.
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="rounded-2xl border border-planet-border bg-surface-primary overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-planet-border bg-surface-elevated/60 text-planet-subtle uppercase font-mono text-[11px]">
                  <th className="py-3 px-4">Transaction / Item</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Rental Fee</th>
                  <th className="py-3 px-4">Deposit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Devnet Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-planet-border/60 text-planet-text">
                {bookings.map((b) => {
                  const isLender = b.lenderId === session.userId;
                  return (
                    <tr key={b.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3 px-4 font-medium">
                        <div>{b.listing.title}</div>
                        <div className="text-[10px] text-planet-subtle font-mono">
                          {formatDate(b.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-planet-muted">
                          {isLender ? "Lender (Payout)" : "Borrower (Payer)"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-solana-green">
                        {lamportsToSol(b.rentalSubtotalLamports)} SOL
                      </td>
                      <td className="py-3 px-4 font-mono text-planet-muted">
                        {lamportsToSol(b.depositLamports)} SOL
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={b.status === "COMPLETED" ? "success" : "purple"}>
                          {b.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {b.escrowTxSignature ? (
                          <a
                            href={getSolanaExplorerUrl(b.escrowTxSignature)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-solana-green hover:underline flex items-center gap-1 font-mono text-[11px]"
                          >
                            <span>{b.escrowTxSignature.slice(0, 10)}...</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-planet-subtle font-mono text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-planet-border bg-surface-primary p-12 text-center space-y-3">
          <Receipt className="h-8 w-8 text-planet-subtle mx-auto" />
          <h3 className="text-base font-bold text-planet-text">No transactions recorded</h3>
          <p className="text-xs text-planet-muted">
            Completed rentals and escrow deposits will appear here with cryptographic signatures.
          </p>
        </div>
      )}
    </div>
  );
}
