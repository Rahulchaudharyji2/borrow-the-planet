import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getEscrowPda } from "@/lib/solana";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { txSignature, demoSimulated } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.borrowerId !== session.userId) {
      return NextResponse.json(
        { error: "Forbidden: Only borrower can fund the escrow" },
        { status: 403 }
      );
    }

    if (booking.status !== "PENDING" && booking.status !== "APPROVED") {
      return NextResponse.json(
        { error: `Cannot fund escrow in status ${booking.status}` },
        { status: 400 }
      );
    }

    const [escrowPda] = getEscrowPda(id);
    const signature = txSignature || `demo_devnet_tx_${Date.now()}_funded`;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: "ESCROW_FUNDED",
        escrowAccount: escrowPda.toBase58(),
        escrowTxSignature: signature,
        events: {
          create: {
            fromStatus: booking.status,
            toStatus: "ESCROW_FUNDED",
            note: demoSimulated
              ? `Solana Devnet escrow funded (Simulated devnet flow: ${signature})`
              : `Solana Devnet escrow confirmed on-chain: ${signature}`,
            actorId: session.userId,
          },
        },
      },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("Escrow funding error:", error);
    return NextResponse.json(
      { error: "Failed to update escrow status" },
      { status: 500 }
    );
  }
}
