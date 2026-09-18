const mocks = vi.hoisted(() => ({
  cookies: { get: vi.fn() },
  updateTag: vi.fn(),
  commandService: {
    updatePreferences: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({ cookies: vi.fn(() => mocks.cookies) }));
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag }));
vi.mock("@/contexts/profiles/application/factory", () => ({
  createProfileCommandService: () => mocks.commandService,
}));

import { describe, it, expect, beforeEach, vi } from "vitest";
import { updatePreferencesAction } from "@/contexts/profiles/interfaces/actions/update-preferences.action";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.append(key, value);
  }
  return data;
}

describe("updatePreferencesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.get.mockReturnValue(undefined);
  });

  it("should return authentication error when token is missing", async () => {
    const formData = form({ language: "ES", theme: "DARK" });

    const result = await updatePreferencesAction(
      { status: "idle", data: null, error: null },
      formData
    );

    expect(result).toEqual({
      status: "error",
      data: null,
      error: "Authentication required",
    });
    expect(mocks.commandService.updatePreferences).not.toHaveBeenCalled();
  });

  it("should return clean validation error when language or theme is invalid", async () => {
    mocks.cookies.get.mockReturnValue({ value: "test-token" });
    const formData = form({ language: "FR", theme: "DARK" });

    const result = await updatePreferencesAction(
      { status: "idle", data: null, error: null },
      formData
    );

    expect(result.status).toBe("error");
    expect(result.error).toBe("Language must be ES or EN");
    expect(mocks.commandService.updatePreferences).not.toHaveBeenCalled();
  });

  it("should update preferences and invalidate cache tag on valid submission", async () => {
    mocks.cookies.get.mockReturnValue({ value: "test-token" });
    const updatedProfile = {
      username: "user",
      imageUrl: null,
      language: "EN" as const,
      theme: "DARK" as const,
    };
    mocks.commandService.updatePreferences.mockResolvedValue(updatedProfile);

    const formData = form({ language: "EN", theme: "DARK" });

    const result = await updatePreferencesAction(
      { status: "idle", data: null, error: null },
      formData
    );

    expect(result).toEqual({
      status: "success",
      data: updatedProfile,
      error: null,
    });
    expect(mocks.updateTag).toHaveBeenCalledWith("profile");
    expect(mocks.commandService.updatePreferences).toHaveBeenCalledWith(
      expect.objectContaining({
        preferences: { language: "EN", theme: "DARK" },
      }),
      "test-token"
    );
  });
});
