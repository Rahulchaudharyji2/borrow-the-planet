import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  campus: z.string().min(2, "Campus/location required").default("North Campus Community"),
});

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ListingFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  category: z.enum([
    "ELECTRONICS",
    "CAMERAS",
    "OUTDOOR",
    "TOOLS",
    "BOOKS",
    "CAMPUS_ESSENTIALS",
    "OTHER",
  ]),
  condition: z.enum(["LIKE_NEW", "EXCELLENT", "GOOD", "FAIR"]),
  dailyRateCents: z.number().int().positive("Daily rate must be greater than zero"),
  dailyRateLamports: z.number().int().positive().default(50000000),
  depositCents: z.number().int().min(0, "Deposit cannot be negative"),
  depositLamports: z.number().int().min(0).default(150000000),
  currency: z.enum(["SOL", "USD"]).default("SOL"),
  minDays: z.number().int().min(1).default(1),
  maxDays: z.number().int().max(90).default(30),
  pickupArea: z.string().min(3, "Pickup zone required (e.g. Student Center, North Quad)"),
  rules: z.string().max(1000).optional(),
  accessories: z.string().max(1000).optional(),
  photoUrls: z.array(z.string().url()).min(1, "Please provide at least one photo URL"),
});

export const BookingRequestSchema = z.object({
  listingId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  paymentMode: z.enum(["DEMO_SOLANA_ESCROW", "NATIVE_ESCROW", "FIAT_SIMULATED"]).default("DEMO_SOLANA_ESCROW"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the rental and dispute terms" }),
  }),
});

export const HandoverSubmissionSchema = z.object({
  conditionConfirmed: z.boolean(),
  conditionNotes: z.string().max(1000).optional(),
  checklist: z.record(z.boolean()),
  photoUrls: z.array(z.string()).default([]),
  hasDisagreement: z.boolean().default(false),
  disagreementNote: z.string().max(1000).optional(),
});

export const ReturnSubmissionSchema = z.object({
  conditionConfirmed: z.boolean(),
  comparisonNotes: z.string().max(1000).optional(),
  checklist: z.record(z.boolean()),
  photoUrls: z.array(z.string()).default([]),
  depositReleaseApproved: z.boolean().default(true),
  hasDisagreement: z.boolean().default(false),
  disagreementNote: z.string().max(1000).optional(),
});

export const DisputeSubmissionSchema = z.object({
  bookingId: z.string().uuid(),
  category: z.enum([
    "DAMAGED_ITEM",
    "LATE_RETURN",
    "NEVER_RETURNED",
    "MISSING_ACCESSORIES",
    "INACCURATE_LISTING",
    "OTHER",
  ]),
  description: z.string().min(15, "Please describe the incident with at least 15 characters").max(2000),
  evidenceUrls: z.array(z.string()).default([]),
});

export const DisputeResolutionSchema = z.object({
  status: z.enum(["RESOLVED", "SUBSTANTIATED", "NOT_SUBSTANTIATED", "CORRECTED"]),
  resolutionNotes: z.string().min(10, "Resolution rationale required"),
  depositDeductionCents: z.number().int().min(0).optional(),
  depositDeductionLamports: z.number().int().min(0).optional(),
});

export const PlanetPassShareSchema = z.object({
  credentialId: z.string().uuid(),
  disclosedClaims: z.array(z.string()).min(1, "Select at least one claim to share"),
  purpose: z.string().max(200).optional(),
  expiryHours: z.number().int().min(1).max(720).default(48), // Default 48 hours
});
