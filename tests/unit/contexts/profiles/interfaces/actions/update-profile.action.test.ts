const mocks = vi.hoisted(() => ({
  cookies: { get: vi.fn() },
  updateTag: vi.fn(),
  revalidatePath: vi.fn(),
  commandService: {
    updateProfile: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({ cookies: vi.fn(() => mocks.cookies) }));
vi.mock("next/cache", () => ({
  updateTag: mocks.updateTag,
  revalidatePath: mocks.revalidatePath,
}));
vi.mock("@/contexts/profiles/application/factory", () => ({
  createProfileCommandService: () => mocks.commandService,
}));

import { describe, it, expect, beforeEach, vi } from "vitest";
import { updateProfileAction } from "@/contexts/profiles/interfaces/actions/update-profile.action";

function form(values: Record<string, string | File>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.append(key, value);
  }
  return data;
}

describe("updateProfileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.get.mockReturnValue(undefined);
  });

  it("should return an authentication error when accessToken cookie is missing", async () => {
    // Arrange
    const formData = form({ username: "mateo" });

    // Act
    const result = await updateProfileAction({ status: "idle", data: null, error: null }, formData);

    // Assert
    expect(result).toEqual({
      status: "error",
      data: null,
      error: "Authentication required",
    });
    expect(mocks.commandService.updateProfile).not.toHaveBeenCalled();
  });

  it("should return a clean validation error without raw JSON when username is invalid", async () => {
    // Arrange
    mocks.cookies.get.mockReturnValue({ value: "test-token" });
    const formData = form({ username: "mateo_123" });

    // Act
    const result = await updateProfileAction({ status: "idle", data: null, error: null }, formData);

    // Assert
    expect(result.status).toBe("error");
    expect(result.error).toBe("Username must contain only letters (A-Z, a-z)");
    expect(result.error).not.toContain("[ {");
    expect(mocks.commandService.updateProfile).not.toHaveBeenCalled();
  });

  it("should successfully update profile and invalidate cache tag when valid data is submitted", async () => {
    // Arrange
    mocks.cookies.get.mockReturnValue({ value: "test-token" });
    const updatedProfile = {
      username: "mateo",
      imageUrl: "https://picsum.photos/seed/replik-test/800/600",
      language: "ES" as const,
      theme: "LIGHT" as const,
    };
    mocks.commandService.updateProfile.mockResolvedValue(updatedProfile);

    const formData = form({
      username: "mateo",
      currentImageUrl: "https://picsum.photos/seed/replik-test/800/600",
    });

    // Act
    const result = await updateProfileAction({ status: "idle", data: null, error: null }, formData);

    // Assert
    expect(result).toEqual({
      status: "success",
      data: updatedProfile,
      error: null,
    });
    expect(mocks.updateTag).toHaveBeenCalledWith("profile");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/team");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/profile");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(mocks.commandService.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        username: { value: "mateo" },
        imageUrl: { value: "https://picsum.photos/seed/replik-test/800/600" },
      }),
      "test-token"
    );
  });

  it("should forward uploaded image file to the command service when provided", async () => {
    // Arrange
    mocks.cookies.get.mockReturnValue({ value: "test-token" });
    const dummyFile = new File(["test-content"], "avatar.png", { type: "image/png" });
    const updatedProfile = {
      username: "mateo",
      imageUrl: "https://picsum.photos/seed/replik-test/800/600",
      language: "ES" as const,
      theme: "LIGHT" as const,
    };
    mocks.commandService.updateProfile.mockResolvedValue(updatedProfile);

    const formData = form({
      username: "mateo",
      imageFile: dummyFile,
    });

    // Act
    const result = await updateProfileAction({ status: "idle", data: null, error: null }, formData);

    // Assert
    expect(result.status).toBe("success");
    expect(mocks.commandService.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        imageFile: expect.any(File),
      }),
      "test-token"
    );
  });

  it("should treat empty image file (size 0) as null when calling command service", async () => {
    // Arrange
    mocks.cookies.get.mockReturnValue({ value: "test-token" });
    const emptyFile = new File([], "empty.png", { type: "image/png" });
    const updatedProfile = {
      username: "mateo",
      imageUrl: "https://picsum.photos/seed/replik-test/800/600",
      language: "ES" as const,
      theme: "LIGHT" as const,
    };
    mocks.commandService.updateProfile.mockResolvedValue(updatedProfile);

    const formData = form({
      username: "mateo",
      currentImageUrl: "https://picsum.photos/seed/replik-test/800/600",
      imageFile: emptyFile,
    });

    // Act
    const result = await updateProfileAction({ status: "idle", data: null, error: null }, formData);

    // Assert
    expect(result.status).toBe("success");
    expect(mocks.commandService.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        imageFile: null,
      }),
      "test-token"
    );
  });

  it("should return an error message when command service rejects", async () => {
    // Arrange
    mocks.cookies.get.mockReturnValue({ value: "test-token" });
    mocks.commandService.updateProfile.mockRejectedValue(new Error("Username already taken"));
    const formData = form({ username: "mateo" });

    // Act
    const result = await updateProfileAction({ status: "idle", data: null, error: null }, formData);

    // Assert
    expect(result).toEqual({
      status: "error",
      data: null,
      error: "Username already taken",
    });
  });
});
