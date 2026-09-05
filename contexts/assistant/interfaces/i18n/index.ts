import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

import type { StringLeaf } from "@/contexts/shared/interfaces/i18n/federated";

export type AssistantDictionary = StringLeaf<typeof en>;

export const assistantLocales = {
  en,
  es,
};

export const useAssistantTranslations = createLocalTranslationHook(assistantLocales);
export const getAssistantDictionary = createLocalDictionaryGetter(assistantLocales);

export { en, es };
