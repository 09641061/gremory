import type { ReactNode } from "react";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { headers } from "next/headers";

import { ListConversationsQueryService } from "@/contexts/assistant/application/internal/queryservices/list-conversations-query.service";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { getMyProfileServerQuery } from "@/contexts/profiles/interfaces/queries/get-my-profile.query-handler";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";
import { AppSidebar } from "@/contexts/shared/interfaces/components/app-sidebar";
import { AppSidebarFallback } from "@/contexts/shared/interfaces/components/app-sidebar-fallback";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/contexts/shared/interfaces/components/ui/sidebar";
import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import type { WorkspaceHeaderOrganization } from "@/contexts/business/application/model/business-workspace.view-models";

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
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;
  const requestHeaders = await headers();
  const establishmentId = requestHeaders.get("x-takodu-establishment-id") ?? undefined;
  const activeOrganizationId = cookieStore.get(workspaceSelectionCookies.organizationId)?.value ?? null;
  const shell = accessToken
    ? await createAppShellQueryService()
        .resolve({ workspace: { establishmentId } })
        .catch(() => null)
    : null;

  if (!shell || shell.workspace.accountType === "PENDING_INVITATION") {
    return null;
  }

  const workspace = await resolveSidebarWorkspace(shell.workspace, activeOrganizationId);
  const [currentProfile, assistantConversations] = await Promise.all([
    getMyProfileServerQuery(),
    shell.hasAssistantAccess
      ? new ListConversationsQueryService()
          .handle({ page: 0, size: 20 })
          .catch(() => ({ content: [] as AssistantConversationSummaryReadModel[] }))
      : Promise.resolve({ content: [] as AssistantConversationSummaryReadModel[] }),
  ]);

  return (
    <AppSidebar
      initialAssistantConversations={assistantConversations.content}
      currentProfile={currentProfile}
      workspace={workspace}
      visibleRoutes={shell.visibleSidebarRoutes}
      showAssistantSection={shell.hasAssistantAccess}
      showAssistantNavigation={shell.hasAssistantAccess}
    />
  );
}

async function resolveSidebarWorkspace(
  workspace: WorkspaceHeaderViewModel,
  activeOrganizationId: string | null,
): Promise<WorkspaceHeaderViewModel> {
  if (!activeOrganizationId || !workspace.organization || workspace.organization.id === activeOrganizationId) {
    return workspace;
  }

  const activeOrganization = await createOrganizationQueryService().getById({ id: activeOrganizationId }).catch(() => null);
  if (!activeOrganization) {
    return workspace;
  }

  const isOwnedOrganization = workspace.ownedOrganizationId === activeOrganizationId;
  const selectedOrganization: WorkspaceHeaderOrganization = {
    id: activeOrganization.id,
    name: activeOrganization.name,
    imageUrl: activeOrganization.imageUrl,
    canRead: isOwnedOrganization || workspace.organization.canRead === true,
    canUpdate: isOwnedOrganization || workspace.organization.canUpdate === true,
    canReadEstablishments: isOwnedOrganization ? true : workspace.organization.canReadEstablishments === true,
    canCreateEstablishment: isOwnedOrganization ? true : workspace.organization.canCreateEstablishment === true,
  };

  return {
    ...workspace,
    organization: selectedOrganization,
    establishments: workspace.establishments.filter(
      (establishment) => !establishment.organizationId || establishment.organizationId === activeOrganizationId,
    ),
    activeEstablishmentId: workspace.establishments.some(
      (establishment) =>
        establishment.id === workspace.activeEstablishmentId &&
        (!establishment.organizationId || establishment.organizationId === activeOrganizationId),
    )
      ? workspace.activeEstablishmentId
      : undefined,
  };
}
