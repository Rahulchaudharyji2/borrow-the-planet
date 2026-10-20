"use client";

import React from "react";
import {
  Laptop,
  Camera,
  Compass,
  Wrench,
  BookOpen,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export interface CategoryOption {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const CATEGORIES: CategoryOption[] = [
  { id: "ALL", label: "All Items", icon: Sparkles },
  { id: "ELECTRONICS", label: "Electronics", icon: Laptop },
  { id: "CAMERAS", label: "Cameras & Film", icon: Camera },
  { id: "OUTDOOR", label: "Outdoor & Camp", icon: Compass },
  { id: "TOOLS", label: "Tools & DIY", icon: Wrench },
  { id: "BOOKS", label: "Books & Study", icon: BookOpen },
  { id: "CAMPUS_ESSENTIALS", label: "Campus Essentials", icon: GraduationCap },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 whitespace-nowrap px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              isSelected
                ? "bg-solana-green text-[#0D1117] font-semibold shadow-sm shadow-solana-green/20"
                : "bg-surface-elevated text-planet-muted hover:text-planet-text hover:bg-surface-hover border border-planet-border"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
