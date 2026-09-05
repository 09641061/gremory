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

export type SchedulingDictionary = StringLeaf<typeof en>;

export const schedulingLocales = { en, es };

export const useSchedulingTranslations = createLocalTranslationHook(schedulingLocales);
export const getSchedulingDictionary = createLocalDictionaryGetter(schedulingLocales);

export { en, es };
