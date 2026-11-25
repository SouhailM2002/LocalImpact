import type { HTMLAttributes } from "react";
import { cn } from "../cn.js";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "border border-slate-300 bg-white",
        className,
      )}
      {...props}
    />
  );
}
