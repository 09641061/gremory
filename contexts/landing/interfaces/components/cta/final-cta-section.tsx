import Link from "next/link";
import { KoduMinimalistIcon } from "@/contexts/shared/interfaces/components/icons/kodu-minimalist";
import type { LandingFinalCta } from "@/contexts/landing/interfaces/i18n";

export function FinalCtaSection({
  finalCta,
}: {
  finalCta: LandingFinalCta;
}) {
  return (
    <section className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:py-28">
        <span className="text-primary">
          <KoduMinimalistIcon size={96} />
        </span>
        <h2 className="mt-8 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
          {finalCta.title}
        </h2>
        <Link
          href="/login"
          className="mt-8 inline-flex h-11 items-center rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {finalCta.cta}
        </Link>
      </div>
    </section>
  );
}
