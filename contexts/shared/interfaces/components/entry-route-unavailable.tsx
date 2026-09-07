import Link from "next/link";
import { CircleAlert } from "lucide-react";

import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";

export function EntryRouteUnavailable({
  title,
  description,
  retryLabel,
}: {
  title: string;
  description: string;
  retryLabel: string;
}) {
  return (
    <section className="flex min-h-[70svh] flex-1 items-center justify-center px-4 py-12 text-foreground">
      <section
        role="alert"
        className="w-full max-w-md space-y-5 rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm"
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CircleAlert className="size-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          {retryLabel}
        </Link>
      </section>
    </section>
  );
}
