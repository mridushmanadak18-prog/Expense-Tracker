import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  href = "/",
  inverted = false,
  className,
}: {
  href?: string;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold",
          inverted ? "bg-emerald-400 text-navy-950" : "bg-navy-900 text-white",
        )}
        aria-hidden
      >
        S
      </span>
      <span
        className={cn(
          "text-sm font-semibold tracking-tight",
          inverted ? "text-white" : "text-navy-950",
        )}
      >
        SpendSmart
      </span>
    </Link>
  );
}
