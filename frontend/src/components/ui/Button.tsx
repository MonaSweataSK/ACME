import * as React from "react";
import { cn } from "../../lib/utils";
import { Spinner } from "./Spinner";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading = false, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow hover:from-indigo-400 hover:to-violet-500": variant === "primary",
            "bg-slate-800 text-slate-100 shadow-sm border border-slate-700 hover:bg-slate-700 hover:text-white": variant === "secondary",
            "bg-red-600/90 text-white shadow-sm hover:bg-red-500": variant === "danger",
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 py-2": size === "md",
            "h-12 px-8 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading && <Spinner size="small" className="mr-2" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
