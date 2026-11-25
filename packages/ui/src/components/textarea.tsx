import type { TextareaHTMLAttributes } from "react";
import { cn } from "../cn.js";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y border-2 border-slate-900 bg-white px-3 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4FD8] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-500",
        props["aria-invalid"] === true && "border-[#B42318] focus-visible:outline-[#B42318]",
        className,
      )}
      {...props}
    />
  );
}
