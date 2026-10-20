import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  signPlanetPassClaims,
  PlanetPassClaims,
} from "../src/lib/planetpass-crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed for Borrow the Planet (Team Beast Coder)...");

  // Clean existing demo data
  await prisma.auditLog.deleteMany();
  await prisma.disputeMessage.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.planetPassPresentation.deleteMany();
  await prisma.planetPassCredential.deleteMany();
  await prisma.returnRecord.deleteMany();
  await prisma.handoverRecord.deleteMany();
  await prisma.bookingStateEvent.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.listingPhoto.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Demo Users
  const alice = await prisma.user.create({
    data: {
      email: "demo_alice@borrowtheplanet.dev",
      name: "Alice Vance (Demo)",
      passwordHash,
      role: "USER",
      campus: "UC Berkeley Engineering Hub",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Robotics student. Passionate about circular economy and lending audio/photo gear.",
      solanaWalletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    },
  });

  const marcus = await prisma.user.create({
    data: {
      email: "demo_marcus@borrowtheplanet.dev",
      name: "Marcus Chen (Demo)",
      passwordHash,
      role: "USER",
      campus: "UC Berkeley Southside Hub",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      bio: "Outdoor club leader and electronics tinkerer. Have tools and camping gear available.",
      solanaWalletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    },
  });

  const reviewer = await prisma.user.create({
    data: {
      email: "reviewer@borrowtheplanet.dev",
      name: "Campus Arbiter (Reviewer)",
      passwordHash,
      role: "REVIEWER",
      campus: "Campus Trust & Safety Council",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      bio: "Authorized safety & dispute review officer for student peer marketplace operations.",
      solanaWalletAddress: "Arb11111111111111111111111111111111111111111",
    },
  });

  const elena = await prisma.user.create({
    data: {
      email: "demo_elena@borrowtheplanet.dev",
      name: "Elena Rostova (Demo)",
      passwordHash,
      role: "USER",
      campus: "UC Berkeley Arts & Media Zone",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      bio: "Film & photography major. Renting cinema accessories and studio lights.",
      solanaWalletAddress: "D1tG1111111111111111111111111111111111111111",
    },
  });

  console.log("✅ Seed users created.");

  // 2. Create Realistic Listings
  const listing1 = await prisma.listing.create({
    data: {
      title: "Sony A7 III Full-Frame Camera + 28-70mm OSS Lens",
      description: "Exceptional 24MP full-frame mirrorless camera for campus film projects, photography assignments, or weekend shoots. Includes 2 original NP-FZ100 batteries, dual charger, and 128GB UHS-II high-speed SD card.",
      category: "CAMERAS",
      condition: "LIKE_NEW",
      dailyRateCents: 2800, // $28.00/day
      dailyRateLamports: 180000000, // 0.18 SOL
      depositCents: 15000, // $150 deposit
      depositLamports: 950000000, // 0.95 SOL
      currency: "SOL",
      minDays: 1,
      maxDays: 7,
      pickupArea: "Moffitt Library 3rd Floor / North Gate",
      rules: "Handle with neck strap engaged at all times. Do not clean sensor with compressed air. Return batteries charged.",
      accessories: "Body cap, lens hood, 2x batteries, dual charger, 128GB SD, padded shoulder bag.",
      status: "PUBLISHED",
      lenderId: alice.id,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
            caption: "Sony A7 III with 28-70mm lens mounted",
            sortOrder: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80",
            caption: "Included carrying case and dual charger accessories",
            sortOrder: 1,
          },
        ],
      },
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      title: "DeWalt 20V Cordless Brushless Drill & Driver Kit",
      description: "Heavy duty compact cordless drill kit perfect for dorm furniture assembly, design lab builds, theater set construction, or campus maker projects. Includes 2x 2.0Ah batteries, charger, and 30-piece drill/driver bit set.",
      category: "TOOLS",
      condition: "EXCELLENT",
      dailyRateCents: 1400, // $14.00/day
      dailyRateLamports: 90000000, // 0.09 SOL
      depositCents: 6000,
      depositLamports: 380000000,
      currency: "SOL",
      minDays: 1,
      maxDays: 5,
      pickupArea: "Jacobs Hall Makerspace Entrance",
      rules: "Wear eye protection. Keep dry. Clean drill chuck before return.",
      accessories: "DeWalt carry bag, 2x batteries, charger, magnetic bit holder, 30 bits.",
      status: "PUBLISHED",
      lenderId: marcus.id,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80",
            caption: "Cordless drill in carry case",
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      title: "MSR Hubba Hubba NX 2-Person Ultralight Tent",
      description: "Iconic freestanding 3-season backpacking tent weighing just 3.5 lbs. Weatherproof rainfly, dual vestibules, and color-coded poles for ultra-fast setup in Yosemite, Big Sur, or Marin Headlands.",
      category: "OUTDOOR",
      condition: "LIKE_NEW",
      dailyRateCents: 2200, // $22.00/day
      dailyRateLamports: 140000000, // 0.14 SOL
      depositCents: 12000,
      depositLamports: 750000000,
      currency: "SOL",
      minDays: 2,
      maxDays: 10,
      pickupArea: "Memorial Glade / MLK Student Union",
      rules: "Always use included groundsheet footprint. Shake out all dirt and ensure completely dry before pack-down.",
      accessories: "Tent body, rainfly, DAC aluminum poles, 8 stakes, footprint, compression sack.",
      status: "PUBLISHED",
      lenderId: marcus.id,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80",
            caption: "Pitch in outdoor campsite",
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
      title: "Anker Nebula Capsule Mini Smart Wi-Fi Projector",
      description: "Pocket-sized cinema projector with 360-degree sound. Casts up to 100 inches in darkened rooms. HDMI and wireless streaming compatible. Perfect for outdoor movie nights or dorm presentations.",
      category: "ELECTRONICS",
      condition: "EXCELLENT",
      dailyRateCents: 1800, // $18.00/day
      dailyRateLamports: 115000000, // 0.115 SOL
      depositCents: 9000,
      depositLamports: 570000000,
      currency: "SOL",
      minDays: 1,
      maxDays: 4,
      pickupArea: "Hearst Mining Circle / Soda Hall",
      rules: "Do not touch glass lens. Charge with included 18W adapter.",
      accessories: "Remote control, tripod stand, power adapter, HDMI cable, pouch.",
      status: "PUBLISHED",
      lenderId: elena.id,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
            caption: "Mini smart projector setup",
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const listing5 = await prisma.listing.create({
    data: {
      title: "TI-84 Plus CE Color Graphing Calculator",
      description: "Rechargeable high-resolution graphing calculator for calculus, linear algebra, statistics, and engineering coursework. Preloaded with standard AP/College Board math applications.",
      category: "CAMPUS_ESSENTIALS",
      condition: "GOOD",
      dailyRateCents: 600, // $6.00/day
      dailyRateLamports: 38000000, // 0.038 SOL
      depositCents: 3500,
      depositLamports: 220000000,
      currency: "SOL",
      minDays: 1,
      maxDays: 14,
      pickupArea: "Kresge Engineering Library",
      rules: "No stickers or writing on screen. Slide-case must remain on when packed.",
      accessories: "Slide cover, mini-USB charging cable.",
      status: "PUBLISHED",
      lenderId: alice.id,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80",
            caption: "Color graphing calculator with slide case",
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const listing6 = await prisma.listing.create({
    data: {
      title: "Bose QuietComfort 45 Active Noise-Cancelling Headphones",
      description: "Premium comfort and deep acoustic silence for finals week, quiet study sessions, and focus sprints in busy campus cafes. 24-hour battery life with USB-C quick charge.",
      category: "CAMPUS_ESSENTIALS",
      condition: "LIKE_NEW",
      dailyRateCents: 1200,
      dailyRateLamports: 76000000,
      depositCents: 8000,
      depositLamports: 500000000,
      currency: "SOL",
      minDays: 1,
      maxDays: 7,
      pickupArea: "Main Stacks Library entrance",
      rules: "Keep in hard-shell case when in transit. Do not expose to rain.",
      accessories: "Protective case, audio backup cable, USB-C charge cable.",
      status: "PUBLISHED",
      lenderId: elena.id,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
            caption: "Noise cancelling headphones in matte black",
            sortOrder: 0,
          },
        ],
      },
    },
  });

  console.log("✅ Seed listings created.");

  // 3. Create Sample Bookings & History
  // A) Completed booking with Handover & Return evidence
  const completedBooking = await prisma.booking.create({
    data: {
      listingId: listing1.id,
      borrowerId: marcus.id,
      lenderId: alice.id,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      durationDays: 3,
      rentalSubtotalCents: 8400,
      depositCents: 15000,
      platformFeeCents: 420,
      totalDueCents: 23820,
      rentalSubtotalLamports: 540000000,
      depositLamports: 950000000,
      platformFeeLamports: 27000000,
      totalDueLamports: 1517000000,
      paymentMode: "DEMO_SOLANA_ESCROW",
      status: "COMPLETED",
      escrowAccount: "BorrEscrowDemoPDA111111111111111111111111111",
      escrowTxSignature: "5wKjP...demo_devnet_tx_create_escrow_completed",
      releaseTxSignature: "3hNmQ...demo_devnet_tx_settle_completed",
      handoverRecord: {
        create: {
          lenderConfirmed: true,
          borrowerConfirmed: true,
          conditionNotes: "Camera body pristine. Sensor checked clean. Battery 100% charged.",
          checklistAnswers: JSON.stringify({
            lensGlassClear: true,
            buttonsOperational: true,
            batteriesIncluded: true,
            sdCardEmpty: true,
          }),
          photoUrls: JSON.stringify([
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
          ]),
          lenderSignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
          borrowerSignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
          disagreementFlag: false,
        },
      },
      returnRecord: {
        create: {
          lenderConfirmed: true,
          borrowerConfirmed: true,
          conditionComparisonNotes: "Returned on time, spotless condition, all accessories accounted for.",
          checklistAnswers: JSON.stringify({
            allAccessoriesPresent: true,
            noCosmeticDamage: true,
            glassUnscratched: true,
            batteryRecharged: true,
          }),
          returnPhotoUrls: JSON.stringify([
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
          ]),
          lenderSignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          borrowerSignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          depositReleaseApproved: true,
          disagreementFlag: false,
        },
      },
      events: {
        create: [
          {
            fromStatus: "PENDING",
            toStatus: "ESCROW_FUNDED",
            note: "Devnet Escrow funded by borrower (1.517 SOL)",
            actorId: marcus.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
          },
          {
            fromStatus: "ESCROW_FUNDED",
            toStatus: "HANDED_OVER",
            note: "Dual physical handover acknowledged at Moffitt Library",
            actorId: alice.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
          },
          {
            fromStatus: "HANDED_OVER",
            toStatus: "COMPLETED",
            note: "Lender confirmed return in good order. Escrow settled: payout released, deposit refunded.",
            actorId: alice.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          },
        ],
      },
    },
  });

  // B) Active booking in progress (Handed Over, Escrow Funded)
  const activeBooking = await prisma.booking.create({
    data: {
      listingId: listing2.id,
      borrowerId: alice.id,
      lenderId: marcus.id,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      durationDays: 3,
      rentalSubtotalCents: 4200,
      depositCents: 6000,
      platformFeeCents: 210,
      totalDueCents: 10410,
      rentalSubtotalLamports: 270000000,
      depositLamports: 380000000,
      platformFeeLamports: 13500000,
      totalDueLamports: 663500000,
      paymentMode: "DEMO_SOLANA_ESCROW",
      status: "HANDED_OVER",
      escrowAccount: "BorrEscrowActivePDA22222222222222222222222",
      escrowTxSignature: "4mNvP...demo_devnet_tx_create_escrow_active",
      handoverRecord: {
        create: {
          lenderConfirmed: true,
          borrowerConfirmed: true,
          conditionNotes: "Drill tested working, bits complete, carrying case intact.",
          checklistAnswers: JSON.stringify({
            drillFunctional: true,
            batteriesBothCharged: true,
            bitsCounted: true,
          }),
          photoUrls: JSON.stringify([
            "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80",
          ]),
          lenderSignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
          borrowerSignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
          disagreementFlag: false,
        },
      },
      events: {
        create: [
          {
            fromStatus: "PENDING",
            toStatus: "ESCROW_FUNDED",
            note: "Devnet Escrow funded by Alice Vance (0.6635 SOL)",
            actorId: alice.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
          },
          {
            fromStatus: "ESCROW_FUNDED",
            toStatus: "HANDED_OVER",
            note: "Physical handover confirmed at Jacobs Hall makerspace",
            actorId: marcus.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
          },
        ],
      },
    },
  });

  // C) Sample dispute under review to showcase fair resolution flow
  const disputedBooking = await prisma.booking.create({
    data: {
      listingId: listing4.id,
      borrowerId: alice.id,
      lenderId: elena.id,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      durationDays: 3,
      rentalSubtotalCents: 5400,
      depositCents: 9000,
      platformFeeCents: 270,
      totalDueCents: 14670,
      rentalSubtotalLamports: 345000000,
      depositLamports: 570000000,
      platformFeeLamports: 17250000,
      totalDueLamports: 932250000,
      paymentMode: "DEMO_SOLANA_ESCROW",
      status: "DISPUTED",
      escrowAccount: "BorrEscrowDisputePDA33333333333333333333333",
      disputes: {
        create: {
          reporterId: elena.id,
          respondentId: alice.id,
          category: "MISSING_ACCESSORIES",
          description: "Projector returned in working condition, but the mini tripod stand and HDMI adapter cable were not in the carry bag upon drop-off.",
          status: "UNDER_REVIEW",
          evidenceUrls: JSON.stringify([
            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
          ]),
          reviewerId: reviewer.id,
          messages: {
            create: [
              {
                senderId: elena.id,
                message: "Hi Alice, looks like the small black tripod was left behind. Could you check your bag?",
                isReviewerNote: false,
              },
              {
                senderId: alice.id,
                message: "Apologies! I found the tripod on my study desk. I can drop it off at Moffitt today at 2 PM, or cover replacement cost ($15).",
                isReviewerNote: false,
              },
              {
                senderId: reviewer.id,
                message: "Campus Reviewer Note: Awaiting confirmation from Elena whether handoff drop-off occurred or partial deposit deduction is requested.",
                isReviewerNote: true,
              },
            ],
          },
        },
      },
    },
  });

  console.log("✅ Seed bookings & dispute created.");

  // 4. Create PlanetPass Credentials
  const issuerSecret =
    process.env.PLANETPASS_ISSUER_SECRET ||
    "4d82f7c0068c8b4c062826db2d1be326c2f5424cf9659b8be4bb2f5a89f9e719";

  // Alice's High-Trust Credential
  const aliceClaims: PlanetPassClaims = {
    credentialId: "pp-cred-alice-established-001",
    schemaVersion: "planetpass-v1.0",
    issuer: {
      id: "did:planetpass:campus-collective-authority-01",
      name: "Campus Trust Network & Beast Coder Federation",
      publicKey: "92f9d6c6c4c0f3b06368d1b1f62d1607593b4ffdbcd0b86a07ba1ceef466a012",
    },
    subject: {
      id: alice.id,
      campus: "UC Berkeley Engineering Hub",
      accountAgeDays: 180,
    },
    issuanceDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 350).toISOString(),
    historyCoverage: {
      start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
      end: new Date().toISOString(),
    },
    metrics: {
      rentalsCompleted: 14,
      onTimeReturnRatePercent: 100.0,
      itemsShared: 6,
      disputeFreeRatePercent: 100.0,
      completedBorrowDays: 42,
    },
    status: "ACTIVE",
  };

  const aliceSigned = signPlanetPassClaims(aliceClaims, issuerSecret);

  const aliceCred = await prisma.planetPassCredential.create({
    data: {
      id: "c460b3de-0863-4ba9-9dc4-83e747b0a390",
      userId: alice.id,
      issuerId: aliceClaims.issuer.id,
      issuerName: aliceClaims.issuer.name,
      credentialSubjectId: alice.id,
      schemaVersion: aliceClaims.schemaVersion,
      issuanceDate: new Date(aliceClaims.issuanceDate),
      expirationDate: new Date(aliceClaims.expirationDate!),
      historyCoverageStart: new Date(aliceClaims.historyCoverage.start),
      historyCoverageEnd: new Date(aliceClaims.historyCoverage.end),
      rentalsCompleted: aliceClaims.metrics.rentalsCompleted,
      onTimeReturnRatePercent: aliceClaims.metrics.onTimeReturnRatePercent,
      itemsShared: aliceClaims.metrics.itemsShared,
      disputeFreeRatePercent: aliceClaims.metrics.disputeFreeRatePercent,
      status: "ACTIVE",
      signatureHex: aliceSigned.signatureHex,
      rawCredentialJson: JSON.stringify(aliceSigned),
    },
  });

  // Pre-seed an active presentation share token for Alice so `/verify/[credentialId]` can be visited right away
  await prisma.planetPassPresentation.create({
    data: {
      id: "pres-alice-demo-presentation-01",
      credentialId: aliceCred.id,
      userId: alice.id,
      shareToken: "share_token_alice_verified_pass_2026",
      disclosedClaims: JSON.stringify([
        "rentalsCompleted",
        "onTimeReturnRatePercent",
        "disputeFreeRatePercent",
        "historyCoverage",
        "campus",
      ]),
      purpose: "Cross-platform rental credential presentation for Camera Equipment",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 72), // 72 hours
      accessCount: 3,
      lastAccessedAt: new Date(),
    },
  });

  // Marcus's Emerging Credential (fewer than 3 rentals -> Insufficient History explanation)
  const marcusClaims: PlanetPassClaims = {
    credentialId: "pp-cred-marcus-emerging-002",
    schemaVersion: "planetpass-v1.0",
    issuer: {
      id: "did:planetpass:campus-collective-authority-01",
      name: "Campus Trust Network & Beast Coder Federation",
      publicKey: "92f9d6c6c4c0f3b06368d1b1f62d1607593b4ffdbcd0b86a07ba1ceef466a012",
    },
    subject: {
      id: marcus.id,
      campus: "UC Berkeley Southside Hub",
      accountAgeDays: 20,
    },
    issuanceDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 360).toISOString(),
    historyCoverage: {
      start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      end: new Date().toISOString(),
    },
    metrics: {
      rentalsCompleted: 1,
      onTimeReturnRatePercent: 100.0,
      itemsShared: 2,
      disputeFreeRatePercent: 100.0,
      completedBorrowDays: 3,
    },
    status: "ACTIVE",
  };

  const marcusSigned = signPlanetPassClaims(marcusClaims, issuerSecret);

  await prisma.planetPassCredential.create({
    data: {
      id: "b21840f9-2c06-444a-9b19-f53878b31a29",
      userId: marcus.id,
      issuerId: marcusClaims.issuer.id,
      issuerName: marcusClaims.issuer.name,
      credentialSubjectId: marcus.id,
      schemaVersion: marcusClaims.schemaVersion,
      issuanceDate: new Date(marcusClaims.issuanceDate),
      expirationDate: new Date(marcusClaims.expirationDate!),
      historyCoverageStart: new Date(marcusClaims.historyCoverage.start),
      historyCoverageEnd: new Date(marcusClaims.historyCoverage.end),
      rentalsCompleted: marcusClaims.metrics.rentalsCompleted,
      onTimeReturnRatePercent: marcusClaims.metrics.onTimeReturnRatePercent,
      itemsShared: marcusClaims.metrics.itemsShared,
      disputeFreeRatePercent: marcusClaims.metrics.disputeFreeRatePercent,
      status: "ACTIVE",
      signatureHex: marcusSigned.signatureHex,
      rawCredentialJson: JSON.stringify(marcusSigned),
    },
  });

  console.log("✅ Seed PlanetPass credentials & presentations created.");

  // 5. Seed Audit Logs
  await prisma.auditLog.create({
    data: {
      actorId: alice.id,
      action: "LISTING_CREATED",
      entityType: "Listing",
      entityId: listing1.id,
      metadata: JSON.stringify({ title: listing1.title, dailyRateCents: listing1.dailyRateCents }),
      ipAddress: "127.0.0.1",
    },
  });

  console.log("🚀 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
