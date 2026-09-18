"use client";

import { useEffect } from "react";
import { normalizeLocale } from "@/contexts/shared/domain/model/i18n";
import { useI18n } from "./i18n-provider";

export function LocaleSync({
  profileLanguage,
}: {
  profileLanguage?: string | null;
}) {
  const { locale, setLocale } = useI18n();

  useEffect(() => {
    if (profileLanguage) {
      const targetLocale = normalizeLocale(profileLanguage);
      if (targetLocale !== locale) {
        setLocale(targetLocale);
      }
    }
  }, [profileLanguage, locale, setLocale]);

  return null;
}
