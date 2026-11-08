import {
  createLocalDictionaryGetter,
  createLocalTranslationHook,
} from "@/contexts/shared/interfaces/i18n/federated";
import { en } from "./locales/en";
import { es } from "./locales/es";

import type { StringLeaf } from "@/contexts/shared/interfaces/i18n/federated";

export type NotificationsDictionary = StringLeaf<typeof en>;
export type NotificationDictionary = NotificationsDictionary;

export const notificationLocales = { en, es };
export const locales = notificationLocales;

export const useNotificationsI18n = createLocalTranslationHook(notificationLocales);
export const useNotificationsTranslations = useNotificationsI18n;
export const useNotificationTranslations = useNotificationsI18n;

export const getNotificationsDictionary = createLocalDictionaryGetter(notificationLocales);
export const getNotificationDictionary = getNotificationsDictionary;

export { en, es };
