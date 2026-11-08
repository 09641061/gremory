import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

import type { StringLeaf } from "@/contexts/shared/interfaces/i18n/federated";

export type BillingDictionary = StringLeaf<typeof en>;

export const billingLocales = {
  en,
  es,
};

export const useBillingTranslations = createLocalTranslationHook(billingLocales);
export const useBillingI18n = useBillingTranslations;
export const getBillingDictionary = createLocalDictionaryGetter(billingLocales);

export { en, es };
