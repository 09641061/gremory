import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

import type { StringLeaf } from "@/contexts/shared/interfaces/i18n/federated";

export type BusinessDictionary = StringLeaf<typeof en>;

export const businessLocales = { en, es };
export const locales = businessLocales;

export const useBusinessI18n = createLocalTranslationHook(businessLocales);
export const useBusinessTranslations = useBusinessI18n;
export const getBusinessDictionary = createLocalDictionaryGetter(businessLocales);

export { en, es };
