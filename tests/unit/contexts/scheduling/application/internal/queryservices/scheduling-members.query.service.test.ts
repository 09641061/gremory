import { describe, expect, it, vi } from "vitest";

const { employeesMock } = vi.hoisted(() => ({
  employeesMock: vi.fn(),
}));

vi.mock("@/contexts/scheduling/infrastructure/gateways/scheduling-api.gateway", () => ({
  SchedulingApiGateway: class {
    getSchedulingEmployees = employeesMock;
  },
}));

vi.mock("@/contexts/workforce/application/internal/queryservices/team-query.service", () => ({
  createTeamQueryService: () => ({
    list: vi.fn().mockRejectedValue(new Error("roster unavailable")),
  }),
}));

import { loadSchedulingMembers } from "@/contexts/scheduling/application/internal/queryservices/scheduling-members.query.service";

describe("loadSchedulingMembers", () => {
  it("uses the scheduling employees endpoint as the employee source", async () => {
    employeesMock.mockResolvedValue([
        {
          userId: "11111111-1111-4111-8111-111111111111",
          memberId: "22222222-2222-4222-8222-222222222222",
          name: "Available Person",
          imageUrl: "https://picsum.photos/seed/replik-test/800/600",
          isOwner: false,
          availableForScheduling: true,
        },
      ]);

    await expect(
      loadSchedulingMembers(
        "55555555-5555-4555-8555-555555555555",
        "66666666-6666-4666-8666-666666666666",
      ),
    ).resolves.toEqual([
      {
        id: "11111111-1111-4111-8111-111111111111",
        userId: "11111111-1111-4111-8111-111111111111",
        name: "Available Person",
        email: "",
        role: "",
        status: "AVAILABLE",
        isOwner: false,
        availableForScheduling: true,
        imageUrl: "https://picsum.photos/seed/replik-test/800/600",
      },
    ]);
  });

  it("propagates the gateway error instead of swallowing it", async () => {
    employeesMock.mockRejectedValue(new Error("Failed to fetch scheduling employees"));

    await expect(
      loadSchedulingMembers(
        "55555555-5555-4555-8555-555555555555",
        "66666666-6666-4666-8666-666666666666",
      ),
    ).rejects.toThrow("Failed to fetch scheduling employees");
  });
});
