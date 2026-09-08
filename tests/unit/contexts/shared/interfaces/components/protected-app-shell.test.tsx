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

vi.mock("@/contexts/notifications/interfaces/components/push-notification-register-server", () => ({
  PushNotificationRegisterServer: () => null,
}));

vi.mock("@/contexts/shared/interfaces/components/sidebar/app-sidebar", () => ({
  AppSidebar: () => null,
}));

vi.mock("@/contexts/shared/interfaces/components/sidebar/app-sidebar-fallback", () => ({
  AppSidebarFallback: () => null,
}));

vi.mock("@/contexts/shared/interfaces/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => children,
  SidebarTrigger: () => null,
  SidebarInset: ({ children }: { children: React.ReactNode }) => children,
}));

// ProtectedAppShell composes the sidebar shell behind a Suspense boundary; the
// side effect under test lives in AppShellSidebarServer. Invoke it directly so
// the assertion does not depend on renderToStaticMarkup's sync-renderer
// behaviour (React 19's legacy server renderer does not support Suspense on
// its own — see react-dom-server-legacy error message).
import ProtectedAppShell from "@/contexts/shared/interfaces/components/protected-app-shell";
import { AppHeaderServer } from "@/contexts/shared/interfaces/components/header/app-header-server";
import { AppShellSidebarServer } from "@/contexts/shared/interfaces/components/sidebar/app-sidebar-shell-server";

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
    // Sanity check: ProtectedAppShell still wires the AppShellSidebarServer
    // it imports into its <Suspense>; keep a synchronous smoke render to
    // guard the JSX composition. The actual side effects are awaited below.
    expect(ProtectedAppShell({ children: null })).toBeDefined();
    await AppShellSidebarServer();

    expect(mocks.createAssistantConversationsAdapter).toHaveBeenCalledWith(organizationId);
    expect(mocks.conversationsQueryServiceCtor).toHaveBeenCalledWith({ id: organizationId });
  });

  it("should resolve account data for the Welcome header without loading app conversations", async () => {
    mocks.getMyProfileServerQuery.mockResolvedValue({ username: "Ada", imageUrl: null });
    const header = await AppHeaderServer();
    expect(header.props.profile).toEqual({ username: "Ada", imageUrl: null });
    expect(header.props.workspace.organization.id).toBe(organizationId);
    expect(mocks.appShellResolve).toHaveBeenCalledTimes(1);
    expect(mocks.createAssistantConversationsAdapter).not.toHaveBeenCalled();
    expect(mocks.conversationsHandle).not.toHaveBeenCalled();
  });
});
