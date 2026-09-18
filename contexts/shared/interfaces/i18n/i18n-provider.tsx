"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_LOCALE, normalizeLocale, type Locale } from "@/contexts/shared/domain/model/i18n";
import { LOCALE_COOKIE_NAME } from "@/contexts/shared/infrastructure/i18n/i18n-cookie";
import {
  getDictionary,
  interpolate,
  type LocaleDictionary,
} from "@/contexts/shared/infrastructure/i18n/locales";

export type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: LocaleDictionary;
  translate: (path: string, params?: Record<string, string | number>) => string;
};

export function getBrowserLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  // 1. Check persistent cookie
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`));
    if (match?.[1]) {
      return normalizeLocale(decodeURIComponent(match[1]));
    }
  } catch {
    // ignore
  }

  // 2. Check browser navigator language
  if (typeof navigator !== "undefined") {
    const candidateLanguages = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
    for (const lang of candidateLanguages) {
      if (typeof lang === "string" && lang.trim()) {
        const lower = lang.toLowerCase();
        if (lower.startsWith("es")) {
          return "es";
        }
        if (lower.startsWith("en")) {
          return "en";
        }
      }
    }
  }

  return DEFAULT_LOCALE;
}

const fallbackDictionary = getDictionary(DEFAULT_LOCALE);

const defaultContextValue: I18nContextValue = {
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: fallbackDictionary,
  translate: (path: string, params?: Record<string, string | number>) => {
    const parts = path.split(".");
    let current: unknown = fallbackDictionary;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return path;
      }
    }
    if (typeof current === "string") {
      return interpolate(current, params);
    }
    return path;
  },
};

const I18nContext = createContext<I18nContextValue>(defaultContextValue);

export function I18nProvider({
  initialLocale = DEFAULT_LOCALE,
  children,
}: {
  initialLocale?: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [prevInitialLocale, setPrevInitialLocale] = useState(initialLocale);
  if (initialLocale !== prevInitialLocale) {
    setPrevInitialLocale(initialLocale);
    setLocaleState(initialLocale);
  }

  useEffect(() => {
    const hasCookie =
      typeof document !== "undefined" &&
      document.cookie.includes(`${LOCALE_COOKIE_NAME}=`);

    if (hasCookie || initialLocale === DEFAULT_LOCALE) {
      const detected = getBrowserLocale();
      queueMicrotask(() => {
        setLocaleState((current) => {
          if (detected !== current) {
            if (typeof document !== "undefined") {
              document.documentElement.lang = detected;
            }
            return detected;
          }
          return current;
        });
      });
    }
  }, [initialLocale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof document !== "undefined") {
      document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLocale;
    }
  }, []);

  const t = useMemo(() => getDictionary(locale), [locale]);

  const translate = useCallback(
    (path: string, params?: Record<string, string | number>) => {
      const parts = path.split(".");
      let current: unknown = t;
      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          return path;
        }
      }
      if (typeof current === "string") {
        return interpolate(current, params);
      }
      return path;
    },
    [t]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      translate,
    }),
    [locale, setLocale, t, translate]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
