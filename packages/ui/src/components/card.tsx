import type { HTMLAttributes } from "react";
import { cn } from "../cn.js";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.02]",
        className,
      )}
      {...props}
    />
  );
}
