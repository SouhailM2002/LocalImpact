import type { TextareaHTMLAttributes } from "react";
import { cn } from "../cn.js";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm shadow-slate-950/[0.02] outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
        props["aria-invalid"] === true && "border-rose-400 focus:border-rose-600 focus:ring-rose-600/15",
        className,
      )}
      {...props}
    />
  );
}
