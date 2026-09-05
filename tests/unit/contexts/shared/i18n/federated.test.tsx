/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  I18nProvider,
  useI18n,
  createLocalTranslationHook,
  createLocalDictionaryGetter,
} from "@/contexts/shared/interfaces/i18n";

const mockLocales = {
  en: { greeting: "Hello", farewell: "Goodbye" },
  es: { greeting: "Hola", farewell: "Adiós" },
};

const useMockTranslations = createLocalTranslationHook(mockLocales);
const getMockDictionary = createLocalDictionaryGetter(mockLocales);

function MockComponent() {
  const t = useMockTranslations();
  const { setLocale } = useI18n();

  return (
    <div>
      <span data-testid="greeting">{t.greeting}</span>
      <span data-testid="farewell">{t.farewell}</span>
      <button onClick={() => setLocale("es")}>Switch to ES</button>
      <button onClick={() => setLocale("en")}>Switch to EN</button>
    </div>
  );
}

describe("Federated i18n helpers", () => {
  it("should provide default translations and react to language switches", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <MockComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId("greeting")).toHaveTextContent("Hello");
    expect(screen.getByTestId("farewell")).toHaveTextContent("Goodbye");

    await user.click(screen.getByRole("button", { name: "Switch to ES" }));

    expect(screen.getByTestId("greeting")).toHaveTextContent("Hola");
    expect(screen.getByTestId("farewell")).toHaveTextContent("Adiós");
  });

  it("should support getDictionary for server components with locale param", () => {
    expect(getMockDictionary("en")).toEqual(mockLocales.en);
    expect(getMockDictionary("es")).toEqual(mockLocales.es);
    expect(getMockDictionary(null)).toEqual(mockLocales.en);
  });
});
