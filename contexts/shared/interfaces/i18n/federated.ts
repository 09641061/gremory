import { DEFAULT_LOCALE, type Locale } from "@/contexts/shared/domain/model/i18n";
import { interpolate } from "@/contexts/shared/infrastructure/i18n/locales";
import { useI18n } from "./i18n-provider";

export { interpolate };

export type StringLeaf<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly StringLeaf<U>[]
    : T extends object
      ? { readonly [K in keyof T]: StringLeaf<T[K]> }
      : T;

export type ContextLocales<T> = {
  en: T;
  es: T;
};

export type LocalTranslationResult<T> = T & {
  t: T;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  interpolate: (template: string, params?: Record<string, string | number>) => string;
};

export function createLocalTranslationHook<T extends object>(locales: ContextLocales<T>) {
  return function useTranslations(): LocalTranslationResult<T> {
    const { locale, setLocale } = useI18n();
    const resolvedLocale = locale ?? DEFAULT_LOCALE;
    const dict = locales[resolvedLocale] ?? locales.en ?? locales.es;
    return Object.assign(Object.create(dict), dict, {
      t: dict,
      locale: resolvedLocale,
      setLocale,
      interpolate,
    });
  };
}

export function createLocalDictionaryGetter<T>(locales: ContextLocales<T>) {
  return function getDictionary(locale?: Locale | null): T {
    if (!locale) return locales.en ?? locales.es;
    return locales[locale] ?? locales.en ?? locales.es;
  };
}
