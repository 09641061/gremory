import type { ReactNode } from "react";

import { ListConversationsQueryService } from "@/contexts/assistant/application/internal/queryservices/list-conversations-query.service";
import { Sidebar } from "@/contexts/shared/interfaces/components/sidebar";
import { createCatalogAccessPolicyService } from "@/contexts/catalog/application/internal/queryservices/catalog-access-policy.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";

/**
 * Main app layout wrapper rendering the responsive Sidebar and main content canvas.
 */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const assistantConversations = await new ListConversationsQueryService().handle({ page: 0, size: 20 });

  const policyService = createCatalogAccessPolicyService();
  let canReadCatalog = false;
  try {
    await createOrganizationQueryService().getMyOrganization();
    canReadCatalog = true;
  } catch {
    const defaultEstId = await policyService.getDefaultEstablishmentId();
    if (defaultEstId) {
      canReadCatalog = true;
    }
  }

  return (
    <>
      <Sidebar
        initialAssistantConversations={assistantConversations.content}
        canReadCatalog={canReadCatalog}
      />
      <main className="flex-1 p-6 pt-16 lg:ml-60">{children}</main>
    </>
  );
}
