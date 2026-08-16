import type { ReactNode } from "react";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { headers } from "next/headers";

import { ListConversationsQueryService } from "@/contexts/assistant/application/internal/queryservices/list-conversations-query.service";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { getMyProfileServerQuery } from "@/contexts/profiles/interfaces/queries/get-my-profile.query-handler";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";
import { AppSidebar } from "@/contexts/shared/interfaces/components/app-sidebar";
import { AppSidebarFallback } from "@/contexts/shared/interfaces/components/app-sidebar-fallback";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/contexts/shared/interfaces/components/ui/sidebar";

export default function ProtectedAppShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider className="bg-background text-foreground">
      <Suspense fallback={<AppSidebarFallback />}>
        <AppShellSidebar />
      </Suspense>

      <main className="flex min-w-0 flex-1 flex-col p-6">
        <SidebarTrigger className="mb-4 md:hidden" />
        {children}
      </main>
    </SidebarProvider>
  );
}

async function AppShellSidebar() {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  const requestHeaders = await headers();
  const establishmentId = requestHeaders.get("x-takodu-establishment-id") ?? undefined;
  const shell = accessToken
    ? await createAppShellQueryService()
        .resolve({ workspace: { establishmentId } })
        .catch(() => null)
    : null;

  if (!shell || shell.workspace.accountType === "PENDING_INVITATION") {
    return null;
  }

  const [currentProfile, assistantConversations] = await Promise.all([
    getMyProfileServerQuery(),
    shell.hasAssistantAccess
      ? new ListConversationsQueryService().handle({ page: 0, size: 20 })
      : Promise.resolve({ content: [] as AssistantConversationSummaryReadModel[] }),
  ]);

  return (
    <AppSidebar
      initialAssistantConversations={assistantConversations.content}
      currentProfile={currentProfile}
      workspace={shell.workspace}
      visibleRoutes={shell.visibleSidebarRoutes}
      showAssistantSection={shell.hasAssistantAccess}
      showAssistantNavigation={shell.hasAssistantAccess}
    />
  );
}
