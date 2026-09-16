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

export type AnalyticsDictionary = StringLeaf<typeof en>;

export const analyticsLocales = { en, es };

export const useAnalyticsTranslations = createLocalTranslationHook(analyticsLocales);
export const getAnalyticsDictionary = createLocalDictionaryGetter(analyticsLocales);

export { en, es };
