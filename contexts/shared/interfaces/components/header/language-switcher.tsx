"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";
import { useI18n } from "@/contexts/shared/interfaces/i18n";
import type { Locale } from "@/contexts/shared/domain/model/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSelectLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    startTransition(() => {
      setLocale(nextLocale);
      const params = searchParams.toString();
      const targetUrl = params ? `${pathname}?${params}` : pathname;
      router.replace(targetUrl);
      router.refresh();
    });
  };

  const currentLabel = locale === "es" ? "Español" : "English";
  const ariaLabel = locale === "es" ? "Cambiar idioma" : "Change language";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${ariaLabel} (${currentLabel})`}
        title={ariaLabel}
        disabled={isPending}
      >
        <Globe className="size-3.5" aria-hidden="true" />
        <span className="uppercase font-semibold tracking-wide">{locale}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-32">
        <DropdownMenuItem
          onClick={() => handleSelectLocale("en")}
          className={`cursor-pointer justify-between text-xs ${locale === "en" ? "font-semibold text-primary" : ""}`}
        >
          <span>English</span>
          {locale === "en" ? <span className="text-[10px] text-muted-foreground">✓</span> : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelectLocale("es")}
          className={`cursor-pointer justify-between text-xs ${locale === "es" ? "font-semibold text-primary" : ""}`}
        >
          <span>Español</span>
          {locale === "es" ? <span className="text-[10px] text-muted-foreground">✓</span> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
