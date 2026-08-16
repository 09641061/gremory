import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageShell({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}

export function PageHeader({
  className,
  title,
  description,
  actions,
}: {
  className?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        <h1 className="page-title">{title}</h1>
        {description ? (
          <p className="page-description max-w-2xl">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
