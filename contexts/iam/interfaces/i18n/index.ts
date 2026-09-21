import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
  type StringLeaf,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

export type IamDictionary = StringLeaf<typeof en>;

export const iamLocales = {
  en,
  es,
};

export const useIamI18n = createLocalTranslationHook(iamLocales);
export const useIamTranslations = useIamI18n;
export const getIamDictionary = createLocalDictionaryGetter(iamLocales);

export { en, es };
