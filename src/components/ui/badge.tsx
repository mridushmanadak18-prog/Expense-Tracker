import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const tones = {
  emerald: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  navy: "bg-navy-50 text-navy-800 ring-navy-100",
  warning: "bg-amber-50 text-amber-900 ring-amber-100",
  muted: "bg-navy-50 text-navy-500 ring-navy-100",
} as const;

export function Badge({
  className,
  tone = "navy",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
