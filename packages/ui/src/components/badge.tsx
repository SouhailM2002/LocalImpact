import type { HTMLAttributes } from "react";
import { cn } from "../cn.js";

export type BadgeVariant = "neutral" | "success" | "info" | "warning";

const variantClasses: Readonly<Record<BadgeVariant, string>> = {
  neutral: "border border-slate-300 bg-slate-50 text-slate-800",
  success: "border border-emerald-700 bg-emerald-50 text-emerald-900",
  info: "border border-[#1F4FD8] bg-blue-50 text-blue-900",
  warning: "border border-amber-700 bg-amber-50 text-amber-950",
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
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold tracking-wide",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
