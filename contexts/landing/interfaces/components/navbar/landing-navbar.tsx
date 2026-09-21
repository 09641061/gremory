"use client";

import Link from "next/link";
import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";
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
  CheckIcon,
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
  const { t, locale, setLocale } = useLandingI18n();
  const nav = t.landing.nav;

  const navLinks = [
    { label: nav.home, href: "/#hero" },
    { label: nav.features, href: "/#features" },
    { label: nav.preview, href: "/#product-preview" },
    { label: nav.pricing, href: "/pricing" },
    { label: nav.faq, href: "/#faq" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link
          href="#hero"
          className="group flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg transition-transform active:scale-95"
          aria-label={nav.brand}
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary transition-all group-hover:bg-primary/20">
            <KoduStaIcon size={20} className="text-primary" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
            {nav.brand}
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              AI
            </span>
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
                    className="px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md"
                  >
                    {link.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Actions (Language + Auth) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 px-2 text-muted-foreground hover:text-foreground h-8"
                  aria-label={nav.language}
                />
              }
            >
              <GlobeIcon className="size-3.5" />
              <span className="text-xs uppercase font-semibold tracking-wider">
                {locale}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {nav.language}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLocale("es")}
                className="flex items-center justify-between text-xs"
              >
                <span>{nav.spanish}</span>
                {locale === "es" && <CheckIcon className="size-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocale("en")}
                className="flex items-center justify-between text-xs"
              >
                <span>{nav.english}</span>
                {locale === "en" && <CheckIcon className="size-3.5 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
          {/* Mobile Language Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground size-8"
                  aria-label={nav.language}
                />
              }
            >
              <GlobeIcon className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => setLocale("es")}
                className="flex items-center justify-between text-xs"
              >
                <span>ES</span>
                {locale === "es" && <CheckIcon className="size-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocale("en")}
                className="flex items-center justify-between text-xs"
              >
                <span>EN</span>
                {locale === "en" && <CheckIcon className="size-3.5 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
