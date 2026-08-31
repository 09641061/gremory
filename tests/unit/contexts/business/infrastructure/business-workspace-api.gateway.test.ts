import { describe, expect, it, vi } from "vitest";
import { BusinessWorkspaceApiGateway } from "@/contexts/business/infrastructure/gateways/business-workspace-api.gateway";

const tokenMock = vi.hoisted(() => vi.fn());
vi.mock("@/contexts/business/infrastructure/session/business-session", () => ({ requireBusinessAccessToken: tokenMock }));
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

const workspace = {
  accountType: "OWNER",
  onboardingStatus: "COMPLETED",
  onboardingCompleted: true,
  organization: {
    id: "11111111-1111-4111-8111-111111111111", name: "Org", imageUrl: null,
    permissions: { canRead: true, canUpdate: true, canCreateEstablishment: true },
  },
  establishments: [],
  activeEstablishmentId: null,
  capabilities: { canReadAppointments: true },
  authorization: null,
  subscription: null,
  ownedOrganizationId: "11111111-1111-4111-8111-111111111111",
};

describe("Business workspace gateway contract", () => {
  it("parses the workspace response with a nullable establishment", async () => {
    tokenMock.mockResolvedValue("token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(workspace)));
    const result = await new BusinessWorkspaceApiGateway().getWorkspace();
    expect(result.establishments).toHaveLength(0);
    expect(result.organization?.imageUrl).toBeNull();
  });
});
