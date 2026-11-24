import type { HTMLAttributes } from "react";
import { cn } from "../cn.js";

export type BadgeVariant = "neutral" | "success" | "info" | "warning";

const variantClasses: Readonly<Record<BadgeVariant, string>> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  info: "bg-teal-50 text-teal-800 ring-teal-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
