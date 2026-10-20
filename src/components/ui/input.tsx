import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium text-planet-muted uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-planet-border bg-surface-elevated px-3 py-2 text-sm text-planet-text placeholder:text-planet-subtle transition-colors focus:border-solana-green focus:outline-none focus:ring-1 focus:ring-solana-green/40 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-planet-danger focus:border-planet-danger focus:ring-planet-danger/30",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-planet-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
