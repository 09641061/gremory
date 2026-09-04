import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
} from "@/contexts/shared/interfaces/i18n";
import { en } from "./locales/en";
import { es } from "./locales/es";

type StringLeaf<T> = T extends string
  ? string
  : T extends object
    ? { readonly [K in keyof T]: StringLeaf<T[K]> }
    : T;

export type CatalogDictionary = StringLeaf<typeof en>;

export const catalogLocales = { en, es };

export const useCatalogTranslations = createLocalTranslationHook(catalogLocales);
export const getCatalogDictionary = createLocalDictionaryGetter(catalogLocales);

export { en, es };
