"use client";

import Link from "next/link";
import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import { Separator } from "@/contexts/shared/interfaces/components/ui/separator";
import { KoduStaIcon } from "@/contexts/shared/interfaces/components/icons/kodu";

export function LandingFooter() {
  const { t } = useLandingI18n();
  const f = t.landing.footer;
  const nav = t.landing.nav;

  const productLinks = [
    { label: f.sections.product.features, href: "#features" },
    { label: f.sections.product.scheduling, href: "#product-preview" },
    { label: f.sections.product.aiAssistant, href: "#product-preview" },
    { label: f.sections.product.crm, href: "#features" },
    { label: f.sections.product.analytics, href: "#product-preview" },
    { label: f.sections.product.pricing, href: "#pricing" },
  ];

  const companyLinks = [
    { label: f.sections.company.about, href: "#" },
    { label: f.sections.company.careers, href: "#" },
    { label: f.sections.company.blog, href: "#" },
    { label: f.sections.company.contact, href: "#" },
  ];

  const resourcesLinks = [
    { label: f.sections.resources.helpCenter, href: "#" },
    { label: f.sections.resources.apiDocs, href: "#" },
    { label: f.sections.resources.guides, href: "#" },
    { label: f.sections.resources.community, href: "#" },
  ];

  const legalLinks = [
    { label: f.sections.legal.privacy, href: "#" },
    { label: f.sections.legal.terms, href: "#" },
    { label: f.sections.legal.security, href: "#" },
    { label: f.sections.legal.cookies, href: "#" },
  ];

  return (
    <footer className="border-t border-border/60 bg-muted/40 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-12">
          {/* Brand Col (2 spans) */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="#hero"
              className="inline-flex items-center gap-2.5 outline-none rounded-lg"
              aria-label={nav.brand}
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <KoduStaIcon size={22} className="text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                {nav.brand}
              </span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm font-normal">
              {f.brandDescription}
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-foreground/80">{f.status}</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {f.sections.product.title}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {productLinks.map((link, idx) => (
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

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {f.sections.company.title}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {companyLinks.map((link, idx) => (
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

          {/* Resources Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {f.sections.resources.title}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {resourcesLinks.map((link, idx) => (
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

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {f.sections.legal.title}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {legalLinks.map((link, idx) => (
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

        <Separator className="bg-border/60" />

        {/* Bottom copyright bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>{f.copyright}</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              {f.sections.legal.privacy}
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              {f.sections.legal.terms}
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              {f.sections.legal.cookies}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
