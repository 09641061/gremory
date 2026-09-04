/** @vitest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  I18nProvider,
  useI18n,
  LocaleSync,
} from "@/contexts/shared/interfaces/i18n";
import { LOCALE_COOKIE_NAME } from "@/contexts/shared/infrastructure/i18n/i18n-cookie";

function TestConsumer() {
  const { locale, setLocale, t, translate } = useI18n();
  return (
    <div>
      <span data-testid="current-locale">{locale}</span>
      <span data-testid="save-text">{t.common.save}</span>
      <span data-testid="interpolated">
        {translate("profile.usernameHint", { min: 3, max: 20 })}
      </span>
      <button onClick={() => setLocale("en")}>Set English</button>
      <button onClick={() => setLocale("es")}>Set Spanish</button>
    </div>
  );
}

describe("I18nProvider and useI18n", () => {
  it("should provide Spanish texts by default when initialLocale is es", () => {
    render(
      <I18nProvider initialLocale="es">
        <TestConsumer />
      </I18nProvider>
    );

    expect(screen.getByTestId("current-locale")).toHaveTextContent("es");
    expect(screen.getByTestId("save-text")).toHaveTextContent("Guardar");
    expect(screen.getByTestId("interpolated")).toHaveTextContent(
      "Solo letras (A-Z, a-z), 3 a 20 caracteres."
    );
  });

  it("should switch language dynamically when setLocale is called", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="es">
        <TestConsumer />
      </I18nProvider>
    );

    expect(screen.getByTestId("save-text")).toHaveTextContent("Guardar");

    await user.click(screen.getByRole("button", { name: "Set English" }));

    expect(screen.getByTestId("current-locale")).toHaveTextContent("en");
    expect(screen.getByTestId("save-text")).toHaveTextContent("Save");
    expect(screen.getByTestId("interpolated")).toHaveTextContent(
      "Only letters (A-Z, a-z), 3 to 20 characters."
    );
    expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=en`);
    expect(document.documentElement.lang).toBe("en");
  });

  it("should provide English fallback when used outside of I18nProvider", () => {
    render(<TestConsumer />);

    expect(screen.getByTestId("current-locale")).toHaveTextContent("en");
    expect(screen.getByTestId("save-text")).toHaveTextContent("Save");
  });

  it("should sync locale when LocaleSync receives a different profile language", async () => {
    const { rerender } = render(
      <I18nProvider initialLocale="es">
        <LocaleSync profileLanguage="EN" />
        <TestConsumer />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-locale")).toHaveTextContent("en");
      expect(screen.getByTestId("save-text")).toHaveTextContent("Save");
    });

    rerender(
      <I18nProvider initialLocale="es">
        <LocaleSync profileLanguage="ES" />
        <TestConsumer />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-locale")).toHaveTextContent("es");
      expect(screen.getByTestId("save-text")).toHaveTextContent("Guardar");
    });
  });

  it("should detect language from cookie when present", async () => {
    document.cookie = `${LOCALE_COOKIE_NAME}=es; path=/`;

    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-locale")).toHaveTextContent("es");
      expect(screen.getByTestId("save-text")).toHaveTextContent("Guardar");
    });

    // Cleanup cookie
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;
  });

  it("should detect language from navigator when no cookie is set", async () => {
    // Clear cookies
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;

    const originalNavigator = window.navigator;
    Object.defineProperty(window, "navigator", {
      value: { ...originalNavigator, languages: ["es-ES", "es"], language: "es-ES" },
      configurable: true,
    });

    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-locale")).toHaveTextContent("es");
      expect(screen.getByTestId("save-text")).toHaveTextContent("Guardar");
    });

    // Restore original navigator
    Object.defineProperty(window, "navigator", {
      value: originalNavigator,
      configurable: true,
    });
  });
});
