import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "purple";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solana-green/50 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer rounded-lg";

    const variants = {
      primary:
        "bg-solana-green text-[#0D1117] font-semibold hover:bg-solana-green-hover active:scale-[0.98] shadow-sm shadow-solana-green/20",
      secondary:
        "bg-surface-elevated text-planet-text hover:bg-surface-hover active:scale-[0.98] border border-planet-border",
      outline:
        "border border-planet-border text-planet-text hover:border-solana-green/50 hover:bg-surface-hover active:scale-[0.98]",
      ghost:
        "text-planet-muted hover:text-planet-text hover:bg-surface-hover/60",
      danger:
        "bg-planet-danger text-white hover:bg-red-600 active:scale-[0.98]",
      purple:
        "bg-solana-purple text-white font-semibold hover:bg-solana-purple-hover active:scale-[0.98] shadow-sm shadow-solana-purple/20",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
