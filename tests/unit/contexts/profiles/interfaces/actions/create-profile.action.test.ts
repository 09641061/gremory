const mocks = vi.hoisted(() => ({
  cookies: { get: vi.fn() },
  updateTag: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
  commandService: {
    createProfile: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({ cookies: vi.fn(() => mocks.cookies) }));
vi.mock("next/cache", () => ({
  updateTag: mocks.updateTag,
  revalidatePath: mocks.revalidatePath,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/contexts/profiles/interfaces/server/profile-composition", () => ({
  composeProfileAdapters: () => ({ commandService: mocks.commandService }),
}));

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createProfileAction } from "@/contexts/profiles/interfaces/actions/create-profile.action";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";

function form(username: string) {
  const data = new FormData();
  data.set("username", username);
  return data;
}

describe("createProfileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.get.mockReturnValue(undefined);
  });

  it("should reject profile creation without an authenticated session", async () => {
    const result = await createProfileAction({ status: "idle", error: null }, form("Gabriela"));

    expect(result).toEqual({ status: "error", error: "Authentication required" });
    expect(mocks.commandService.createProfile).not.toHaveBeenCalled();
  });

  it("should expose a clean validation message", async () => {
    mocks.cookies.get.mockReturnValue({ value: "access-token" });

    const result = await createProfileAction({ status: "idle", error: null }, form("Ga_1"));

    expect(result).toEqual({
      status: "error",
      error: "Username must contain only letters (A-Z, a-z)",
    });
  });

  it("should create, invalidate and continue onboarding", async () => {
    mocks.cookies.get.mockReturnValue({ value: "access-token" });

    await expect(
      createProfileAction({ status: "idle", error: null }, form("Gabriela")),
    ).rejects.toThrow("REDIRECT:/");

    expect(mocks.commandService.createProfile).toHaveBeenCalledWith(
      {
        username: { value: "Gabriela" },
        imageUrl: { value: null },
      },
      "access-token",
    );
    expect(mocks.updateTag).toHaveBeenCalledWith("profile");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("should map forbidden creation to a safe public error", async () => {
    mocks.cookies.get.mockReturnValue({ value: "access-token" });
    const error = new ApiError("internal details", 403);
    error.name = "ProfileApiError";
    mocks.commandService.createProfile.mockRejectedValue(error);

    const result = await createProfileAction({ status: "idle", error: null }, form("Gabriela"));

    expect(result).toEqual({ status: "error", error: "Operation not permitted" });
  });
});
