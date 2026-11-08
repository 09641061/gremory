import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
  type StringLeaf,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

export type CrmDictionary = StringLeaf<typeof en>;

export const crmLocales = { en, es };

export const useCrmI18n = createLocalTranslationHook(crmLocales);
export const useCrmTranslations = useCrmI18n;
export const getCrmDictionary = createLocalDictionaryGetter(crmLocales);

export { en, es };
