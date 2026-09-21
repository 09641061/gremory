import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
  type ContextLocales,
  type StringLeaf,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

export type LandingDictionary = StringLeaf<typeof en>;

export const landingLocales: ContextLocales<LandingDictionary> = {
  en: en as unknown as LandingDictionary,
  es: es as unknown as LandingDictionary,
};

export const useLandingI18n = createLocalTranslationHook<LandingDictionary>(landingLocales);
export const useLandingTranslations = useLandingI18n;
export const getLandingDictionary = createLocalDictionaryGetter<LandingDictionary>(landingLocales);

export { en, es };
