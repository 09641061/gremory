import { describe, expect, it, vi } from "vitest";

const { employeesMock } = vi.hoisted(() => ({
  employeesMock: vi.fn(),
}));

vi.mock("@/contexts/scheduling/infrastructure/gateways/scheduling-api.gateway", () => ({
  SchedulingApiGateway: class {
    getSchedulingEmployees = employeesMock;
  },
}));

import { loadSchedulingMembers } from "@/contexts/scheduling/application/internal/queryservices/scheduling-members.query.service";

describe("loadSchedulingMembers", () => {
  it("uses the scheduling employees endpoint as the employee source", async () => {
    employeesMock.mockResolvedValue([
        {
          userId: "11111111-1111-4111-8111-111111111111",
          memberId: "22222222-2222-4222-8222-222222222222",
          name: "Available Person",
          imageUrl: "https://example.com/a.png",
        },
      ]);

    await expect(loadSchedulingMembers("55555555-5555-4555-8555-555555555555")).resolves.toEqual([
      {
        id: "11111111-1111-4111-8111-111111111111",
        userId: "11111111-1111-4111-8111-111111111111",
        name: "Available Person",
        email: "",
        role: "",
        status: "ACTIVE",
        imageUrl: "https://example.com/a.png",
      },
    ]);
  });
});
