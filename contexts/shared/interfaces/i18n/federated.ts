import { DEFAULT_LOCALE, type Locale } from "@/contexts/shared/domain/model/i18n";
import { useI18n } from "./i18n-provider";

export type StringLeaf<T> = T extends string
  ? string
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
};

export function createLocalTranslationHook<T extends object>(locales: ContextLocales<T>) {
  return function useTranslations(): LocalTranslationResult<T> {
    const { locale } = useI18n();
    const resolvedLocale = locale ?? DEFAULT_LOCALE;
    const dict = locales[resolvedLocale] ?? locales.en ?? locales.es;
    return Object.assign(Object.create(dict), dict, {
      t: dict,
      locale: resolvedLocale,
    });
  };
}

export function createLocalDictionaryGetter<T>(locales: ContextLocales<T>) {
  return function getDictionary(locale?: Locale | null): T {
    if (!locale) return locales.en ?? locales.es;
    return locales[locale] ?? locales.en ?? locales.es;
  };
}
