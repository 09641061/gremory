import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
  cookies: vi.fn(),
  subscription: {
    getCurrentSubscriptionSnapshot: vi.fn(),
  },
  workspace: {
    getHeaderViewModel: vi.fn(),
  },
  conversation: {
    handle: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));

vi.mock("@/contexts/billing/application/internal/queryservices/current-subscription-query.service", () => ({
  createCurrentSubscriptionQueryService: () => mocks.subscription,
}));

vi.mock("@/contexts/billing/application/internal/queryservices/subscription-access-query.service", () => ({
  createSubscriptionAccessQueryService: () => ({
    resolve: () => ({ hasAssistantAccess: true }),
  }),
}));

vi.mock("@/contexts/business/application/internal/queryservices/business-workspace-query.service", () => ({
  createBusinessWorkspaceQueryService: () => mocks.workspace,
}));

vi.mock("@/contexts/assistant/application/internal/queryservices/get-conversation-query.service", () => ({
  GetConversationQueryService: class {
    handle = mocks.conversation.handle;
  },
}));

vi.mock("@/contexts/assistant/interfaces/components/chat-view/assistant-chat-view", () => ({
  AssistantChatView: () => null,
}));

vi.mock("@/contexts/shared/interfaces/components/ui/alert", () => ({
  Alert: () => null,
  AlertTitle: () => null,
  AlertDescription: () => null,
}));

vi.mock("@/contexts/assistant/interfaces/components/chat-view/assistant-chat-loading-state", () => ({
  AssistantChatLoadingState: () => null,
}));

import { renderToStaticMarkup } from "react-dom/server";
import ChatPage from "@/app/(protected)/(app)/chat/page";

describe("ChatPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mocks.cookies.mockResolvedValue({
      get: () => ({ value: "access-token" }),
    });
    mocks.subscription.getCurrentSubscriptionSnapshot.mockResolvedValue({
      active: true,
      planName: "Free",
      status: "ACTIVE",
      canManageBilling: false,
    });
    mocks.workspace.getHeaderViewModel.mockResolvedValue({
      accessPolicy: {
        canUseAssistant: false,
      },
      establishments: [],
      activeEstablishmentId: null,
    });
  });

  it("touches no dynamic API before entering its own Suspense boundary", () => {
    // The outer component must stay synchronous: awaiting searchParams (or
    // anything else) before the Suspense boundary would make the whole
    // route dynamic and block prerendering (blocking-prerender-dynamic).
    expect(ChatPage({})).toBeDefined();
    expect(mocks.workspace.getHeaderViewModel).not.toHaveBeenCalled();
  });

  it("renders the shell fallback when the workspace assistant policy is false", async () => {
    renderToStaticMarkup(ChatPage({}));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.conversation.handle).not.toHaveBeenCalled();
  });
});
