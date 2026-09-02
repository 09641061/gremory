/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemberRow } from "@/contexts/workforce/interfaces/components/team/member-row";
import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("MemberRow", () => {
  const memberWithImage: TeamUserSummary = {
    invitationId: "11111111-1111-4111-8111-111111111111",
    memberId: "22222222-2222-4222-8222-222222222222",
    userId: "33333333-3333-4333-8333-333333333333",
    name: "Jane Doe",
    imageUrl: "https://picsum.photos/seed/replik-test/800/600",
    email: "jane@example.com",
    roleId: "44444444-4444-4444-8444-444444444444",
    roleName: "Worker",
    roles: [
      {
        id: "44444444-4444-4444-8444-444444444444",
        name: "Worker",
        position: 1,
        systemRole: false,
        permissions: [],
      },
    ],
    isOwner: false,
    organizationId: "55555555-5555-4555-8555-555555555555",
    establishmentId: "66666666-6666-4666-8666-666666666666",
    establishmentName: "Main location",
    status: "ACTIVE",
    hasAcceptedInvitation: true,
    canRevokeInvitation: false,
    canRemoveMembership: true,
    invitedAt: "2026-08-01T10:00:00Z",
    invitationExpiresAt: "2026-08-08T10:00:00Z",
    acceptedAt: "2026-08-02T10:00:00Z",
    joinedAt: "2026-08-02T10:00:00Z",
    removedAt: null,
    availableForScheduling: true,
    canUpdateSchedulingAvailability: true,
  };

  const memberWithoutImage: TeamUserSummary = {
    ...memberWithImage,
    imageUrl: null,
    name: "John Smith",
    email: "john@example.com",
  };

  it("should render avatar with image when imageUrl is present", () => {
    const { container } = render(<MemberRow member={memberWithImage} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "https://picsum.photos/seed/replik-test/800/600");
  });

  it("should render avatar fallback when imageUrl fails", () => {
    const { container } = render(<MemberRow member={memberWithImage} />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg.lucide-user")).toBeInTheDocument();
  });

  it("should render avatar fallback with Lucide User icon when imageUrl is null", () => {
    const { container } = render(<MemberRow member={memberWithoutImage} />);

    expect(screen.getByText("John Smith")).toBeInTheDocument();
    const fallbackSvg = container.querySelector("svg.lucide-user");
    expect(fallbackSvg).toBeInTheDocument();
  });
});
