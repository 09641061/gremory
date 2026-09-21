import { describe, expect, it, vi } from "vitest";
import { loadSchedulingMembers } from "@/contexts/scheduling/application/internal/queryservices/scheduling-members.query.service";

const employeesMock = vi.fn();
const reader = { getSchedulingEmployees: employeesMock };
const establishmentId = "55555555-5555-4555-8555-555555555555";
const token = "66666666-6666-4666-8666-666666666666";

describe("loadSchedulingMembers", () => {
  it("uses the scheduling employees port as the employee source", async () => {
    employeesMock.mockResolvedValue([
      {
        userId: "11111111-1111-4111-8111-111111111111",
        name: "Available Person",
        imageUrl: "https://picsum.photos/seed/replik-test/800/600",
        isOwner: false,
        availableForScheduling: true,
        visibleForScheduling: true,
      },
    ]);

    await expect(loadSchedulingMembers(reader, establishmentId, token)).resolves.toEqual([
      {
        id: "11111111-1111-4111-8111-111111111111",
        userId: "11111111-1111-4111-8111-111111111111",
        name: "Available Person",
        email: "",
        role: "",
        status: "AVAILABLE",
        isOwner: false,
        availableForScheduling: true,
        visibleForScheduling: true,
        imageUrl: "https://picsum.photos/seed/replik-test/800/600",
      },
    ]);
    expect(employeesMock).toHaveBeenCalledWith(establishmentId, token);
  });

  it("propagates the gateway error instead of swallowing it", async () => {
    employeesMock.mockRejectedValue(new Error("Failed to fetch scheduling employees"));
    await expect(loadSchedulingMembers(reader, establishmentId, token)).rejects.toThrow(
      "Failed to fetch scheduling employees",
    );
  });
});
