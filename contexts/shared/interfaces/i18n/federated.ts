import type { Locale } from "@/contexts/shared/domain/model/i18n";
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
    const dict = locales[locale] ?? locales.en;
    return Object.assign(Object.create(dict), dict, {
      t: dict,
      locale,
    });
  };
}

export function createLocalDictionaryGetter<T>(locales: ContextLocales<T>) {
  return function getDictionary(locale?: Locale | null): T {
    if (!locale) return locales.en;
    return locales[locale] ?? locales.en;
  };
}
