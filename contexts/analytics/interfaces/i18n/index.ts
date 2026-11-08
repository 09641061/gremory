import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
  type StringLeaf,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

export type AnalyticsDictionary = StringLeaf<typeof en>;

export const analyticsLocales = { en, es };

export const useAnalyticsTranslations = createLocalTranslationHook(analyticsLocales);
export const useAnalyticsI18n = useAnalyticsTranslations;
export const getAnalyticsDictionary = createLocalDictionaryGetter(analyticsLocales);

export { en, es };
