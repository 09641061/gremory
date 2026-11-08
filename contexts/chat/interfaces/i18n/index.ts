import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
  type ContextLocales,
  type StringLeaf,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

export type ChatDictionary = StringLeaf<typeof en>;

export const chatLocales: ContextLocales<ChatDictionary> = { en, es };

export const useChatI18n = createLocalTranslationHook(chatLocales);
export const useChatTranslations = useChatI18n;
export const getChatDictionary = createLocalDictionaryGetter(chatLocales);

export { en, es };
