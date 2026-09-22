"use client";

import Link from "next/link";
import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import { Separator } from "@/contexts/shared/interfaces/components/ui/separator";
import { KoduStaIcon } from "@/contexts/shared/interfaces/components/icons/kodu";

export function LandingFooter() {
  const { t } = useLandingI18n();
  const f = t.landing.footer;
  const nav = t.landing.nav;

  const quickLinks = [
    { label: nav.home, href: "/#hero" },
    { label: nav.features, href: "/#features" },
    { label: nav.preview, href: "/#product-preview" },
    { label: nav.pricing, href: "/pricing" },
    { label: nav.faq, href: "/#faq" },
  ];

  const accessLinks = [
    { label: nav.login, href: "/login" },
    { label: nav.getStarted, href: "/login" },
  ];

  return (
    <footer className="border-t border-border/40 bg-muted/20 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-10">
          {/* Brand Col */}
          <div className="space-y-3 max-w-sm">
            <Link
              href="/#hero"
              className="inline-flex items-center gap-2 outline-none rounded-lg group"
              aria-label={nav.brand}
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary transition-colors group-hover:bg-primary/20">
                <KoduStaIcon size={18} className="text-primary" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">
                {nav.brand}
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
              {f.brandDescription}
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-foreground/80">{f.status}</span>
            </div>
          </div>

          {/* Functional Navigation Links */}
          <div className="flex flex-wrap gap-12 sm:gap-16">
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {nav.brand}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                {quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {nav.login}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                {accessLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* Bottom copyright bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>{f.copyright}</p>
          <p className="text-[11px] text-muted-foreground/70">
            {f.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
