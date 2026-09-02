import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
  getMyProfileServerQuery: vi.fn(),
  profileCard: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/contexts/profiles/interfaces/queries/get-my-profile.query-handler", () => ({
  getMyProfileServerQuery: mocks.getMyProfileServerQuery,
}));

vi.mock("@/contexts/profiles/interfaces/components/profile/profile-card", () => ({
  ProfileCard: (props: unknown) => {
    mocks.profileCard(props);
    return null;
  },
}));

import ProfilePage, {
  ProfilePageContent,
} from "@/app/(protected)/(configuration)/profile/page";

describe("Profile Route Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should wrap content in Suspense with fallback", () => {
    const element = ProfilePage();
    expect(element).toBeTruthy();
  });

  it("should redirect to /login when user has no active profile", async () => {
    mocks.getMyProfileServerQuery.mockResolvedValue(null);

    await expect(ProfilePageContent()).rejects.toThrow("REDIRECT:/login");
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });

  it("should render ProfileCard with fetched profile data when profile exists", async () => {
    const dummyProfile = {
      username: "mateo",
      imageUrl: "https://picsum.photos/seed/replik-test/800/600",
      language: "ES" as const,
      theme: "SYSTEM" as const,
    };
    mocks.getMyProfileServerQuery.mockResolvedValue(dummyProfile);

    const element = await ProfilePageContent();

    expect(element).toMatchObject({
      props: expect.objectContaining({
        children: expect.arrayContaining([
          expect.objectContaining({
            props: expect.objectContaining({
              profile: dummyProfile,
            }),
          }),
        ]),
      }),
    });
  });
});
