import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toUpperCase()) {
    case "PUBLISHED":
    case "APPROVED":
    case "COMPLETED":
    case "ACTIVE":
    case "RESOLVED":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    case "PENDING":
    case "AWAITING_RESPONSE":
    case "UNDER_REVIEW":
    case "RETURN_PENDING":
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    case "ESCROW_FUNDED":
    case "HANDED_OVER":
      return "bg-purple-500/10 text-purple-300 border border-purple-500/20";
    case "CANCELLED":
    case "DISPUTED":
    case "REVOKED":
    case "SUSPENDED":
    case "TAMPERED":
      return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    default:
      return "bg-slate-700/40 text-slate-300 border border-slate-700";
  }
}
