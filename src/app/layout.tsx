import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { SolanaWalletProvider } from "@/components/wallet/solana-provider";

export const metadata: Metadata = {
  title: "Borrow the Planet — Community Resource-Sharing Marketplace",
  description:
    "Borrow more. Own less. Trust travels. Peer resource sharing for campus communities powered by Solana Devnet smart escrows and verifiable PlanetPass credentials.",
  keywords: [
    "Borrow the Planet",
    "PlanetPass",
    "Team Beast Coder",
    "Solana Devnet",
    "Escrow",
    "Campus rental",
    "Peer-to-peer sharing",
    "Verifiable Credentials",
  ],
  authors: [{ name: "Team Beast Coder" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🪐</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0D1117] text-[#F5F7FA] antialiased flex flex-col min-h-screen">
        <SolanaWalletProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
