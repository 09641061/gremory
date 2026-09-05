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

export type CrmDictionary = StringLeaf<typeof en>;

export const crmLocales = { en, es };

export const useCrmTranslations = createLocalTranslationHook(crmLocales);
export const getCrmDictionary = createLocalDictionaryGetter(crmLocales);

export { en, es };
