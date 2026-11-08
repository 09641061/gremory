import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
  type ContextLocales,
  type StringLeaf,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

/**
 * The landing dictionary is the `landing` branch of the shared locale
 * dictionaries. Pages resolve it on the server (`getServerLocale`) and pass it
 * to the presentational components as serializable data.
 */
export type LandingDictionary = StringLeaf<typeof es.landing>;

export type LandingNav = LandingDictionary["nav"];
export type LandingHero = LandingDictionary["hero"];
export type LandingHowItWorks = LandingDictionary["howItWorks"];
export type LandingOwner = LandingDictionary["owner"];
export type LandingPricing = LandingDictionary["pricing"];
export type LandingFaq = LandingDictionary["faq"];
export type LandingFinalCta = LandingDictionary["finalCta"];

export const landingLocales: ContextLocales<LandingDictionary> = {
  en: en.landing as unknown as LandingDictionary,
  es: es.landing as unknown as LandingDictionary,
};

export const useLandingI18n = createLocalTranslationHook<LandingDictionary>(landingLocales);
export const useLandingTranslations = useLandingI18n;
export const getLandingDictionary = createLocalDictionaryGetter<LandingDictionary>(landingLocales);

export { en, es };
