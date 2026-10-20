"use client";

import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  campusFilter: string;
  onCampusChange: (value: string) => void;
  sortOrder: string;
  onSortChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  campusFilter,
  onCampusChange,
  sortOrder,
  onSortChange,
  onClear,
  hasActiveFilters,
}: SearchBarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
      {/* Main search text input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-planet-subtle" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search items by name, brand, or description (e.g. Sony, Drill, Tent)..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-planet-border bg-surface-elevated text-sm text-planet-text placeholder:text-planet-subtle focus:border-solana-green focus:outline-none focus:ring-1 focus:ring-solana-green/40 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-planet-muted hover:text-planet-text"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Campus / Zone quick filter */}
      <div className="w-full md:w-56">
        <input
          type="text"
          value={campusFilter}
          onChange={(e) => onCampusChange(e.target.value)}
          placeholder="Filter by campus / hub..."
          className="w-full h-11 px-3.5 rounded-xl border border-planet-border bg-surface-elevated text-sm text-planet-text placeholder:text-planet-subtle focus:border-solana-green focus:outline-none focus:ring-1 focus:ring-solana-green/40 transition-colors"
        />
      </div>

      {/* Sort order dropdown */}
      <div className="w-full md:w-44">
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full h-11 px-3 rounded-xl border border-planet-border bg-surface-elevated text-sm text-planet-text focus:border-solana-green focus:outline-none focus:ring-1 focus:ring-solana-green/40 transition-colors cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Clear Filters Button if any active */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs text-planet-muted hover:text-planet-text whitespace-nowrap"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
