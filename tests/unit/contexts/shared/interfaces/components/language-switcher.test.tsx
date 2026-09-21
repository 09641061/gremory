/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LanguageSwitcher } from "@/contexts/shared/interfaces/components/header/language-switcher";
import { I18nProvider } from "@/contexts/shared/interfaces/i18n";
import { LOCALE_COOKIE_NAME } from "@/contexts/shared/infrastructure/i18n/i18n-cookie";

const mockReplace = vi.fn();
const mockRefresh = vi.fn();
let mockPathname = "/chat";
let mockSearchParams = new URLSearchParams("foo=bar&tab=settings");

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = `${LOCALE_COOKIE_NAME}=; max-age=0; path=/`;
    mockPathname = "/chat";
    mockSearchParams = new URLSearchParams("foo=bar&tab=settings");
  });

  it("should render the active locale button with accessible aria-label", () => {
    render(
      <I18nProvider initialLocale="en">
        <LanguageSwitcher />
      </I18nProvider>
    );

    const button = screen.getByRole("button", { name: /change language/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/en/i);
  });

  it("should open menu and switch language preserving searchParams and path", async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider initialLocale="en">
        <LanguageSwitcher />
      </I18nProvider>
    );

    const trigger = screen.getByRole("button", { name: /change language/i });
    await user.click(trigger);

    const spanishOption = await screen.findByRole("menuitem", { name: /español/i });
    expect(spanishOption).toBeInTheDocument();

    await user.click(spanishOption);

    expect(mockReplace).toHaveBeenCalledWith("/chat?foo=bar&tab=settings");
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("should not trigger navigation if the same locale is selected", async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider initialLocale="en">
        <LanguageSwitcher />
      </I18nProvider>
    );

    const trigger = screen.getByRole("button", { name: /change language/i });
    await user.click(trigger);

    const englishOption = await screen.findByRole("menuitem", { name: /english/i });
    await user.click(englishOption);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
