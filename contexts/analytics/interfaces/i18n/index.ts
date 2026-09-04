import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

export type AnalyticsDictionary = typeof en;

export const analyticsLocales = {
  en,
  es,
};

export const useAnalyticsTranslations = createLocalTranslationHook(analyticsLocales);
export const getAnalyticsDictionary = createLocalDictionaryGetter(analyticsLocales);

export { en, es };
