import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
  type StringLeaf,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

export type ProfilesDictionary = StringLeaf<typeof en>;

export const profilesLocales = {
  en,
  es,
};

export const useProfilesI18n = createLocalTranslationHook(profilesLocales);
export const useProfilesTranslations = useProfilesI18n;
export const getProfilesDictionary = createLocalDictionaryGetter(profilesLocales);

export { en, es };
