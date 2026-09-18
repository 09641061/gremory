import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

export const locales = { en, es };

export const useBusinessTranslations = createLocalTranslationHook(locales);
export const getBusinessDictionary = createLocalDictionaryGetter(locales);

export { en, es };
