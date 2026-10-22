"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlobeIcon, MenuIcon } from "lucide-react";
import { KoduFaceMinimalistIcon } from "@/contexts/shared/interfaces/components/icons/kodu-face-minimalist";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/contexts/shared/interfaces/components/ui/sheet";
import { useI18n } from "@/contexts/shared/interfaces/i18n";
import type { LandingNav } from "@/contexts/landing/interfaces/i18n";

export function LandingNavbar({ nav }: { nav: LandingNav }) {
  const router = useRouter();
  const { locale, setLocale } = useI18n();

  const navLinks = [
    { href: "#como-funciona", label: nav.howItWorks },
    { href: "#funciones", label: nav.features },
    { href: "#precios", label: nav.pricing },
    { href: "#preguntas", label: nav.questions },
  ];

  // The landing copy is rendered on the server, so the locale change needs a
  // refresh to re-render it with the dictionary of the new locale.
  const toggleLocale = () => {
    setLocale(locale === "en" ? "es" : "en");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-label={nav.brand}
        >
          <span className="text-primary">
            <KoduFaceMinimalistIcon size={24} />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">
            {nav.brand}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            className="h-8 cursor-pointer gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            aria-label={nav.language}
            title={locale === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            <GlobeIcon className="size-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {locale}
            </span>
          </Button>

          <Button
            size="sm"
            nativeButton={false}
            className="hidden h-9 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 md:inline-flex"
            render={<Link href="/login" />}
          >
            {nav.login}
          </Button>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={nav.openMenu}
                  className="size-8 rounded-lg border-border/60 md:hidden"
                />
              }
            >
              <MenuIcon className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col justify-between p-6">
              <div>
                <SheetHeader className="border-b border-border/40 p-0 pb-6 text-left">
                  <SheetTitle className="flex items-center gap-2 text-base font-bold">
                    <span className="text-primary">
                      <KoduFaceMinimalistIcon size={22} />
                    </span>
                    {nav.brand}
                  </SheetTitle>
                </SheetHeader>

                <nav className="mt-6 flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <SheetClose
                      key={link.href}
                      render={
                        <Link
                          href={link.href}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                        />
                      }
                    >
                      {link.label}
                    </SheetClose>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-2.5 border-t border-border/40 pt-6">
                <SheetClose
                  render={
                    <Button
                      nativeButton={false}
                      className="h-10 w-full justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      render={<Link href="/login" />}
                    />
                  }
                >
                  {nav.login}
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
