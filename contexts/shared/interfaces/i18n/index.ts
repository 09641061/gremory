export { I18nProvider, useI18n, getBrowserLocale, type I18nContextValue } from "./i18n-provider";
export { LocaleSync } from "./locale-sync";
export {
  createLocalTranslationHook,
  createLocalDictionaryGetter,
  interpolate,
  type ContextLocales,
} from "./federated";
export { LanguageSwitcher } from "../components/header/language-switcher";
