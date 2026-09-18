import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

export const locales = { en, es };

export const useNotificationTranslations = createLocalTranslationHook(locales);
export const getNotificationDictionary = createLocalDictionaryGetter(locales);

export { en, es };
