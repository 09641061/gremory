import type { ReactNode } from "react";

import { cookies } from "next/headers";
import { ListConversationsQueryService } from "@/contexts/assistant/application/internal/queryservices/list-conversations-query.service";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { createCurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { Sidebar } from "@/contexts/shared/interfaces/components/sidebar";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";
import { getMyProfileServerQuery } from "@/contexts/profiles/interfaces/queries/get-my-profile.query-handler";

/**
 * Main app layout wrapper rendering the responsive Sidebar and main content canvas.
 */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const currentProfile = await getMyProfileServerQuery();
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  const subscription = accessToken
    ? await createCurrentSubscriptionQueryService().getCurrentSubscription(accessToken).catch(() => null)
    : null;
  const shell = accessToken
    ? await createAppShellQueryService().resolve({ subscription }).catch(() => null)
    : null;
  const hasAssistantAccess = shell?.hasAssistantAccess ?? false;

  const assistantConversations = hasAssistantAccess
    ? await new ListConversationsQueryService().handle({ page: 0, size: 20 })
    : { content: [] as AssistantConversationSummaryReadModel[] };

  return (
    <>
      <Sidebar
        initialAssistantConversations={assistantConversations.content}
        currentProfile={currentProfile}
        visibleRoutes={shell?.visibleSidebarRoutes ?? ["/analytics"]}
        showAssistantSection={hasAssistantAccess}
        showAssistantNavigation={hasAssistantAccess}
      />
      <main className="flex-1 p-6 pt-16 lg:ml-60">{children}</main>
    </>
  );
}
