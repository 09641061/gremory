import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  headers: vi.fn(),
  appShellResolve: vi.fn(),
  organizationGetById: vi.fn(),
  conversationsQueryServiceCtor: vi.fn(),
  conversationsHandle: vi.fn(),
  createAssistantConversationsAdapter: vi.fn(),
  getMyProfileServerQuery: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
  headers: mocks.headers,
}));

vi.mock("@/contexts/shared/application/internal/queryservices/app-shell-query.service", () => ({
  createAppShellQueryService: () => ({ resolve: mocks.appShellResolve }),
}));

vi.mock("@/contexts/business/application/internal/queryservices/organization-query.service", () => ({
  createOrganizationQueryService: () => ({ getById: mocks.organizationGetById }),
}));

vi.mock("@/contexts/assistant/infrastructure/adapters/assistant-conversations.adapter", () => ({
  createAssistantConversationsAdapter: mocks.createAssistantConversationsAdapter,
}));

vi.mock("@/contexts/assistant/application/internal/queryservices/list-conversations-query.service", () => ({
  ListConversationsQueryService: class {
    constructor(...args: unknown[]) {
      mocks.conversationsQueryServiceCtor(...args);
    }
    handle = mocks.conversationsHandle;
  },
}));

vi.mock("@/contexts/profiles/interfaces/queries/get-my-profile.query-handler", () => ({
  getMyProfileServerQuery: mocks.getMyProfileServerQuery,
}));

vi.mock("@/contexts/shared/interfaces/components/app-sidebar", () => ({
  AppSidebar: () => null,
}));

vi.mock("@/contexts/shared/interfaces/components/app-sidebar-fallback", () => ({
  AppSidebarFallback: () => null,
}));

vi.mock("@/contexts/shared/interfaces/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => children,
  SidebarTrigger: () => null,
}));

// AppShellSidebar is not exported directly; render the default export and
// let its internal Suspense boundary resolve the async server component.
import ProtectedAppShell from "@/contexts/shared/interfaces/components/protected-app-shell";
import { renderToStaticMarkup } from "react-dom/server";

describe("ProtectedAppShell sidebar conversations", () => {
  const organizationId = "org-15fcdb66-ba48-405a-a21f-247def512bc5";

  beforeEach(() => {
    vi.resetAllMocks();

    mocks.cookies.mockResolvedValue({
      get: (name: string) =>
        name === "takodu.access_token" ? { value: "access-token" } : undefined,
    });
    mocks.headers.mockResolvedValue({
      get: () => null,
    });
    mocks.appShellResolve.mockResolvedValue({
      workspace: {
        accountType: "OWNER",
        organization: { id: organizationId },
        ownedOrganizationId: organizationId,
        establishments: [],
        activeEstablishmentId: undefined,
      },
      hasAssistantAccess: true,
      homeHref: "/chat",
      visibleSidebarRoutes: [],
    });
    mocks.getMyProfileServerQuery.mockResolvedValue(null);
    mocks.conversationsHandle.mockResolvedValue({ content: [] });
    mocks.createAssistantConversationsAdapter.mockImplementation((id?: string) => ({ id }));
  });

  it("passes the resolved workspace organization id to the conversations adapter, so the request carries X-Organization-Id", async () => {
    renderToStaticMarkup(await resolveShellTree());

    expect(mocks.createAssistantConversationsAdapter).toHaveBeenCalledWith(organizationId);
    expect(mocks.conversationsQueryServiceCtor).toHaveBeenCalledWith({ id: organizationId });
  });

  async function resolveShellTree() {
    const element = ProtectedAppShell({ children: null });
    // Render once to flush the async Server Component inside <Suspense>.
    renderToStaticMarkup(element as unknown as React.ReactElement);
    // Give pending microtasks (the async AppShellSidebar body) a chance to run.
    await new Promise((resolve) => setTimeout(resolve, 0));
    return element;
  }
});
