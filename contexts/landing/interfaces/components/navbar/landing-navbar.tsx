"use client";

import Link from "next/link";
import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/contexts/shared/interfaces/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/contexts/shared/interfaces/components/ui/sheet";
import { KoduStaIcon } from "@/contexts/shared/interfaces/components/icons/kodu";
import {
  GlobeIcon,
  MenuIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "lucide-react";

export interface LandingNavbarProps {
  isAuthenticated?: boolean;
  workspaceHref?: string;
}

export function LandingNavbar({
  isAuthenticated = false,
  workspaceHref = "/schedule",
}: LandingNavbarProps) {
  const { locale, setLocale, t } = useLandingI18n();
  const nav = t.landing.nav;

  const toggleLocale = () => {
    setLocale(locale === "en" ? "es" : "en");
  };

  const navLinks = [
    { href: "#features", label: nav.features },
    { href: "#preview", label: nav.preview },
    { href: "/pricing", label: nav.pricing },
    { href: "#faq", label: nav.faq },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
          aria-label="Takodu"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KoduStaIcon size={20} />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            {nav.brand}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    href={link.href}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50 rounded-md"
                  >
                    {link.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Actions (Language Toggle + Auth) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Direct Language Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            className="gap-1.5 px-2 text-muted-foreground hover:text-foreground h-8 cursor-pointer"
            aria-label={nav.language}
            title={locale === "es" ? "Cambiar a English" : "Switch to Español"}
          >
            <GlobeIcon className="size-3.5" />
            <span className="text-xs uppercase font-semibold tracking-wider">
              {locale}
            </span>
          </Button>

          {isAuthenticated ? (
            <Button
              size="sm"
              nativeButton={false}
              className="gap-1.5 font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs"
              render={<Link href={workspaceHref} />}
            >
              <span>{nav.workspace}</span>
              <ArrowRightIcon className="size-3.5" />
            </Button>
          ) : (
            <>
              {/* Login Button */}
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                className="text-foreground hover:text-primary transition-colors font-medium h-8 text-xs px-3"
                render={<Link href="/login" />}
              >
                {nav.login}
              </Button>

              {/* CTA Button */}
              <Button
                size="sm"
                nativeButton={false}
                className="gap-1.5 font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs px-3.5"
                render={<Link href="/login" />}
              >
                <span>{nav.getStarted}</span>
                <ArrowRightIcon className="size-3.5" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Drawer */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Language Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            className="text-muted-foreground hover:text-foreground h-8 px-2 gap-1 text-xs uppercase font-semibold cursor-pointer"
            aria-label={nav.language}
            title={locale === "es" ? "Cambiar a English" : "Switch to Español"}
          >
            <GlobeIcon className="size-3.5" />
            <span>{locale}</span>
          </Button>

          {/* Hamburger Sheet */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={nav.menu}
                  className="size-8 rounded-lg border-border/60"
                />
              }
            >
              <MenuIcon className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col justify-between p-6">
              <div>
                <SheetHeader className="p-0 pb-6 border-b border-border/40 text-left">
                  <SheetTitle className="flex items-center gap-2 text-base font-bold">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <KoduStaIcon size={18} />
                    </div>
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
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                        />
                      }
                    >
                      {link.label}
                    </SheetClose>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t border-border/40 flex flex-col gap-2.5">
                {isAuthenticated ? (
                  <SheetClose
                    render={
                      <Button
                        nativeButton={false}
                        className="w-full justify-center gap-2 bg-primary text-primary-foreground font-medium text-xs"
                        render={<Link href={workspaceHref} />}
                      />
                    }
                  >
                    <span>{nav.workspace}</span>
                    <ArrowRightIcon className="size-3.5" />
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose
                      render={
                        <Button
                          variant="outline"
                          nativeButton={false}
                          className="w-full justify-center text-xs font-medium border-border/60"
                          render={<Link href="/login" />}
                        />
                      }
                    >
                      {nav.login}
                    </SheetClose>

                    <SheetClose
                      render={
                        <Button
                          nativeButton={false}
                          className="w-full justify-center gap-2 bg-primary text-primary-foreground font-medium text-xs"
                          render={<Link href="/login" />}
                        />
                      }
                    >
                      <SparklesIcon className="size-3.5" />
                      <span>{nav.getStarted}</span>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
