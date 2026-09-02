import { type Language, createLanguage } from "./language";
import { type Theme, createTheme } from "./theme";

export type ProfilePreferences = Readonly<{
  language: Language;
  theme: Theme;
}>;

export function createProfilePreferences(
  language: Language,
  theme: Theme
): ProfilePreferences {
  return Object.freeze({
    language,
    theme,
  });
}

export function defaultProfilePreferences(): ProfilePreferences {
  return createProfilePreferences(createLanguage("ES"), createTheme("LIGHT"));
}
