import type { ButtonHTMLAttributes } from "react";
import { cn } from "../cn.js";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Readonly<Record<ButtonVariant, string>> = {
  primary: "bg-teal-700 text-white shadow-sm hover:bg-teal-800 focus-visible:ring-teal-600",
  secondary: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-teal-600",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-teal-600",
  danger: "bg-rose-700 text-white shadow-sm hover:bg-rose-800 focus-visible:ring-rose-600",
};

const sizeClasses: Readonly<Record<ButtonSize, string>> = {
  sm: "min-h-9 gap-2 rounded-lg px-3 text-sm",
  md: "min-h-10 gap-2 rounded-xl px-4 text-sm",
  lg: "min-h-12 gap-2 rounded-xl px-5 text-base",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize | "icon" = "md",
  className?: string,
): string {
  const sizeClass = size === "icon"
    ? "size-10 rounded-xl"
    : sizeClasses[size];

  return cn(
    "inline-flex shrink-0 items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClass,
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClassName(variant, size, className)}
      type={type}
      {...props}
    />
  );
}
