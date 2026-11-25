import type { ButtonHTMLAttributes } from "react";
import { cn } from "../cn.js";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Readonly<Record<ButtonVariant, string>> = {
  primary: "bg-[#1F4FD8] text-white hover:bg-[#1840B0] focus-visible:ring-[#1F4FD8]",
  secondary: "border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white focus-visible:ring-[#1F4FD8]",
  ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-[#1F4FD8]",
  danger: "bg-[#B42318] text-white hover:bg-red-800 focus-visible:ring-red-700",
};

const sizeClasses: Readonly<Record<ButtonSize, string>> = {
  sm: "min-h-9 gap-2 px-3 text-sm",
  md: "min-h-10 gap-2 px-4 text-sm",
  lg: "min-h-12 gap-2 px-5 text-base",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize | "icon" = "md",
  className?: string,
): string {
  const sizeClass = size === "icon"
    ? "size-10"
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
