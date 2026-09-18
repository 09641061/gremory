import "server-only";

import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, type Locale, normalizeLocale } from "@/contexts/shared/domain/model/i18n";
import { LOCALE_COOKIE_NAME } from "./i18n-cookie";
import { getDictionary, type LocaleDictionary } from "./locales";

export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
    if (cookieLocale) {
      return normalizeLocale(cookieLocale);
    }
  } catch {
    // cookies() might not be available in certain build or static contexts
  }

  try {
    const reqHeaders = await headers();
    const acceptLanguage = reqHeaders.get("accept-language");
    if (acceptLanguage) {
      const primaryLang = acceptLanguage.split(",")[0]?.trim().toLowerCase();
      if (primaryLang?.startsWith("en")) {
        return "en";
      }
      if (primaryLang?.startsWith("es")) {
        return "es";
      }
    }
  } catch {
    // headers() might not be available
  }

  return DEFAULT_LOCALE;
}

export async function getServerDictionary(): Promise<LocaleDictionary> {
  const locale = await getServerLocale();
  return getDictionary(locale);
}
