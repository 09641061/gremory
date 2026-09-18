import type { Locale } from "@/contexts/shared/domain/model/i18n";
import { en } from "./en";
import { es } from "./es";

type StringLeaf<T> = T extends string
  ? string
  : T extends object
    ? { readonly [K in keyof T]: StringLeaf<T[K]> }
    : T;

export type LocaleDictionary = StringLeaf<typeof en>;

export const dictionaries: Record<Locale, LocaleDictionary> = {
  en,
  es,
};

export function getDictionary(locale: Locale): LocaleDictionary {
  return dictionaries[locale] ?? dictionaries.es;
}

export function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return key in params ? String(params[key]) : match;
  });
}

export { en, es };
