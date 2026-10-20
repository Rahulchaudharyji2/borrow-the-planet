"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchBar } from "@/components/marketplace/search-bar";
import { CategoryFilter } from "@/components/marketplace/category-filter";
import { ItemCard, ItemCardProps } from "@/components/marketplace/item-card";
import { Button } from "@/components/ui/button";
import { Sparkles, PackageSearch, Filter, Plus } from "lucide-react";
import Link from "next/link";

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<ItemCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "ALL";
  const initialCampus = searchParams.get("campus") || "";
  const initialSort = searchParams.get("sort") || "newest";

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [campus, setCampus] = useState(initialCampus);
  const [sort, setSort] = useState(initialSort);

  // Sync state to URL and fetch items
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (category && category !== "ALL") params.set("category", category);
    if (campus) params.set("campus", campus);
    if (sort) params.set("sort", sort);

    const queryString = params.toString();
    fetch(`/api/items?${queryString}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch items error:", err);
        setLoading(false);
      });
  }, [searchTerm, category, campus, sort]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategory("ALL");
    setCampus("");
    setSort("newest");
    router.push("/explore");
  };

  const hasActiveFilters =
    Boolean(searchTerm) || category !== "ALL" || Boolean(campus) || sort !== "newest";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-planet-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-solana-green uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Community Inventory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-planet-text tracking-tight">
            Explore Campus Marketplace
          </h1>
          <p className="text-xs text-planet-muted mt-1">
            Browse verified peer gear available for rental across campus collective hubs.
          </p>
        </div>

        <Link href="/dashboard/listings/new">
          <Button variant="primary" size="md" className="gap-2">
            <Plus className="h-4 w-4" />
            <span>List an Item</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          campusFilter={campus}
          onCampusChange={setCampus}
          sortOrder={sort}
          onSortChange={setSort}
          onClear={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <CategoryFilter
          selectedCategory={category}
          onSelectCategory={setCategory}
        />
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-planet-muted">
        <span>
          Showing <strong className="text-planet-text font-mono">{items.length}</strong> available item{items.length !== 1 ? "s" : ""}
        </span>
        {hasActiveFilters && (
          <span className="font-mono text-[11px] text-solana-green">Filtered View</span>
        )}
      </div>

      {/* Item Grid or Loading or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 rounded-xl border border-planet-border bg-surface-primary animate-pulse p-4 space-y-4"
            >
              <div className="h-48 w-full bg-surface-elevated rounded-lg" />
              <div className="h-4 w-3/4 bg-surface-elevated rounded" />
              <div className="h-4 w-1/2 bg-surface-elevated rounded" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-planet-border bg-surface-primary p-12 text-center space-y-4 max-w-md mx-auto my-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-elevated text-planet-muted">
            <PackageSearch className="h-7 w-7 text-planet-subtle" />
          </div>
          <h3 className="text-base font-bold text-planet-text">No items match your filters</h3>
          <p className="text-xs text-planet-muted leading-relaxed">
            Try adjusting your search terms, campus hub, or category filter to discover more gear.
          </p>
          <Button variant="secondary" size="sm" onClick={handleClearFilters}>
            Reset All Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-planet-muted">Loading marketplace...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
