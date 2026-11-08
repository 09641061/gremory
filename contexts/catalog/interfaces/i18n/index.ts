import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
  type StringLeaf,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

export type CatalogDictionary = StringLeaf<typeof en>;

export const catalogLocales = { en, es };

export const useCatalogI18n = createLocalTranslationHook(catalogLocales);
export const useCatalogTranslations = useCatalogI18n;
export const getCatalogDictionary = createLocalDictionaryGetter(catalogLocales);

export { en, es };
