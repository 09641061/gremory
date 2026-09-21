import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
  type StringLeaf,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

export type SchedulingDictionary = StringLeaf<typeof en>;

export const schedulingLocales = { en, es };

export const useSchedulingI18n = createLocalTranslationHook(schedulingLocales);
export const useSchedulingTranslations = useSchedulingI18n;
export const getSchedulingDictionary = createLocalDictionaryGetter(schedulingLocales);

export { en, es };
