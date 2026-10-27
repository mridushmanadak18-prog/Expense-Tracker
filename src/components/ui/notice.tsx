import { Info } from "lucide-react";
import { cn } from "@/lib/cn";

export function Notice({
  title,
  children,
  className,
}: {
  title: string;
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-navy-200 bg-navy-50 px-4 py-3 text-sm text-navy-700",
        className,
      )}
      role="status"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" aria-hidden />
      <div>
        <p className="font-medium text-navy-950">{title}</p>
        <p className="mt-0.5 text-navy-600">{children}</p>
      </div>
    </div>
  );
}
