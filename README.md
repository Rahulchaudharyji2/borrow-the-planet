# Borrow the Planet 🪐

> **“Borrow more. Own less. Trust travels.”**  
> Built by **Team Beast Coder** | Solana-Powered Campus Resource-Sharing Marketplace

Borrow the Planet helps college students and local communities borrow and lend high-value physical goods (cameras, maker tools, outdoor expedition gear, electronics, textbooks) safely and reliably.

Our key product differentiator is **PlanetPass**: a portable, privacy-conscious rental credential designed to allow borrowers to take their positive rental reputation anywhere across the peer-to-peer ecosystem.

---

## 🌟 Key Product Features

1. **Editorial Campus Marketplace**:
   - Filter items by category (`Electronics`, `Cameras`, `Outdoor`, `Tools`, `Books`, `Campus Essentials`), campus hub, and rate.
   - Evidence-aware trust indicators displayed only when verified history exists.
   - Real item photography, designated public meeting locations (no private dorm addresses exposed).

2. **Solana Devnet Smart Escrow**:
   - Built with **Anchor 0.30.1** (`programs/borrow-escrow/src/lib.rs`).
   - Locks rental payout and 100% refundable security deposit in a Program Derived Address (PDA) seeded by `[b"escrow", booking_id]`.
   - Explicit state transitions: `Funded` → `HandedOver` → `Completed`.
   - Prevents double settlement, re-entrancy, and premature fund release.
   - Cancellation before handover yields 100% immediate refund to borrower.

3. **PlanetPass Cryptographic Credential**:
   - Versioned schema (`planetpass-v1.0`) signed by an authorized campus trust authority.
   - Canonical JSON serialization (RFC 8785 subset) with tamper-evident digital signatures.
   - **Selective Disclosure**: Users explicitly consent to which claims to share (rentals completed, on-time percentage, dispute-free record, campus zone).
   - Sensitive personal information, identity cards, and private chats stay strictly off-chain.
   - Evidence-aware trust tier assessment: Missing history is **never** treated as negative behavior.

4. **Auditable Handover & Return Evidence Workflows**:
   - Guided inspection checklists for item functionality, cleanliness, and included accessories.
   - Timestamped before-and-after photo attachments.
   - Mutual acknowledgement: neither party can unilaterally overwrite prior evidence.
   - Transparent disagreement and incident flagging without forcing false consensus.

5. **Fair Dispute Arbitration**:
   - Restricted reviewer access (`/admin/review`) for campus trust councils.
   - Structured states: `Reported` → `Awaiting Response` → `Under Review` → `Resolved` / `Corrected`.
   - Written rationales, deposit deductions capped at verified loss, and explicit appeal rights.

6. **Defensible Planet Impact Ledger**:
   - Empirical sharing metrics calculated strictly from verified database records.
   - No fabricated CO₂ savings or speculative assumptions.

---

## 🛠 Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript strict mode, Tailwind CSS, Lucide icons, shadcn-inspired primitives.
- **Backend & Database**: Next.js Server Routes, SQLite / PostgreSQL, Prisma ORM 6.
- **Solana Web3**: `@solana/web3.js`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-react-ui`.
- **Escrow Program**: Rust + Anchor 0.30.1.
- **Cryptographic Engine**: WebCrypto HMAC-SHA256 (RFC 2104) / Ed25519 canonical signing, `jose` JWT session tokens, `bcryptjs` password hashing.
- **Validation**: Zod schema validation across all inputs.

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Node.js v20+ (tested on Node v26)
- npm v10+

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Default `.env` configuration:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="borrow-the-planet-secure-dev-jwt-secret-min32-chars-2026"
PLANETPASS_ISSUER_ID="did:planetpass:campus-collective-authority-01"
PLANETPASS_ISSUER_NAME="Campus Trust Network & Beast Coder Federation"
PLANETPASS_ISSUER_SECRET="4d82f7c0068c8b4c062826db2d1be326c2f5424cf9659b8be4bb2f5a89f9e719"
PLANETPASS_ISSUER_PUBLIC="92f9d6c6c4c0f3b06368d1b1f62d1607593b4ffdbcd0b86a07ba1ceef466a012"
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_ESCROW_PROGRAM_ID="BorrEscrow111111111111111111111111111111111"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DEMO_MODE="true"
```

### 4. Database Setup & Seeding
```bash
# Push schema and generate Prisma client
npx prisma db push

# Seed realistic demo data (users, listings, bookings, credentials)
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Accounts (Pre-Seeded)

For testing and demonstration, use these accounts (password is `Password123!` for all):

| Account | Email | Role | Profile Context |
| :--- | :--- | :--- | :--- |
| **Alice Vance** | `demo_alice@borrowtheplanet.dev` | `USER` | High-trust borrower & Sony A7 III camera lender with active PlanetPass (14 rentals, 100% on-time). |
| **Marcus Chen** | `demo_marcus@borrowtheplanet.dev` | `USER` | DeWalt cordless drill & MSR Hubba tent lender. Emerging borrower. |
| **Campus Arbiter** | `reviewer@borrowtheplanet.dev` | `REVIEWER` | Authorized dispute reviewer with access to `/admin/review`. |
| **Elena Rostova** | `demo_elena@borrowtheplanet.dev` | `USER` | Anker projector lender involved in the sample incident review. |

*Quick login buttons are available directly on the sign-in screen (`/auth/sign-in`).*

---

## 🧪 Automated Testing

Borrow the Planet includes automated unit, integration, and independent verifier test suites:

```bash
# Run all 20 automated tests
npm test

# Run PlanetPass cryptographic tamper-resistance and selective disclosure tests
npm run test:planetpass

# Run Independent Cross-Marketplace Verifier test simulation
npm run test:verifier

# Run Anchor Escrow program instruction constraints & state transition tests
npm run test:escrow

# Run TypeScript compilation check
npm run typecheck

# Run Next.js production build verification
npm run build
```

---

## 🏛 Solana Anchor Escrow Program

The Anchor program is organized under `programs/borrow-escrow/`:
- `programs/borrow-escrow/src/lib.rs`: Full Rust program with `create_escrow`, `confirm_handover`, `complete_return`, `cancel_booking`, `raise_dispute`, and `resolve_dispute` instructions.
- `Anchor.toml`: Devnet & localnet configuration.

### Program State Transitions
```
                [ create_escrow (Borrower funds rental + deposit) ]
                                      │
                                      ▼
                                  [ Funded ]
                                  /        \
          [ confirm_handover ]   /          \   [ cancel_booking ]
                                ▼            ▼
                        [ HandedOver ]    [ Cancelled ]
                          /        \      (100% refund to borrower)
    [ complete_return ]  /          \  [ raise_dispute ]
                        ▼            ▼
                  [ Completed ]   [ Disputed ]
         (Payout to lender,             │  [ resolve_dispute by Arbiter ]
          refund to borrower)           ▼
                                  [ Completed ]
                              (Fair award distribution)
```

To build SBF when cargo-build-sbf is configured:
```bash
npm run anchor:build
```

---

## 🛡️ Security, Privacy & Compliance Notes

1. **Server-Side Authorization**: Every state change, listing modification, handover signature, and dispute update is verified server-side with session cookies and database ownership checks.
2. **Integer Arithmetic**: All financial calculations use integer minor units (cents for USD) and base integer units (lamports for SOL). Never floating point math.
3. **No Keys in Frontend**: Signing keys for authorized issuers remain exclusively server-side. Users interact via their own connected Solana wallet or session cookies.
4. **Data Minimization**: Third-party verification links (`/verify/[credentialId]`) disclose only explicitly consented claims.

---

## 📄 License & Attribution

- **Product**: Borrow the Planet 🪐
- **Team**: Beast Coder
- **Tagline**: *“Borrow more. Own less. Trust travels.”*
