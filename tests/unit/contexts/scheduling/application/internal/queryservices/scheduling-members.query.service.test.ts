import { describe, expect, it, vi } from "vitest";

const { listMock } = vi.hoisted(() => ({
  listMock: vi.fn(),
}));

vi.mock("@/contexts/workforce/application/internal/queryservices/team-query.service", () => ({
  createTeamQueryService: () => ({
    list: listMock,
  }),
}));

import { loadSchedulingMembers } from "@/contexts/scheduling/application/internal/queryservices/scheduling-members.query.service";

describe("loadSchedulingMembers", () => {
  it("filters out members that are not available for scheduling", async () => {
    listMock.mockResolvedValue({
      content: [
        {
          userId: "11111111-1111-4111-8111-111111111111",
          memberId: "22222222-2222-4222-8222-222222222222",
          name: "Available Person",
          email: "available@example.com",
          roleName: "Owner",
          status: "ACTIVE",
          imageUrl: "https://example.com/a.png",
          availableForScheduling: true,
        },
        {
          userId: "33333333-3333-4333-8333-333333333333",
          memberId: "44444444-4444-4444-8444-444444444444",
          name: "Unavailable Person",
          email: "unavailable@example.com",
          roleName: "Worker",
          status: "ACTIVE",
          imageUrl: null,
          availableForScheduling: false,
        },
      ],
    });

    await expect(loadSchedulingMembers("55555555-5555-4555-8555-555555555555")).resolves.toEqual([
      {
        id: "11111111-1111-4111-8111-111111111111",
        userId: "11111111-1111-4111-8111-111111111111",
        name: "Available Person",
        email: "available@example.com",
        role: "Owner",
        status: "ACTIVE",
        imageUrl: "https://example.com/a.png",
      },
    ]);
  });
});
