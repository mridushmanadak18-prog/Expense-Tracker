import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-navy-950">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-navy-500">{description}</p>
      </div>
      {actions}
    </div>
  );
}
