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

export type WorkforceDictionary = StringLeaf<typeof en>;

export const workforceLocales = { en, es };

export const useWorkforceTranslations = createLocalTranslationHook(workforceLocales);
export const getWorkforceDictionary = createLocalDictionaryGetter(workforceLocales);

export { en, es };
