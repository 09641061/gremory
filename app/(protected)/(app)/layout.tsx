import type { ReactNode } from "react";

import { ListConversationsQueryService } from "@/contexts/assistant/application/internal/queryservices/list-conversations-query.service";
import { Sidebar } from "@/contexts/shared/interfaces/components/sidebar";
import { createCatalogAccessPolicyService } from "@/contexts/catalog/application/internal/queryservices/catalog-access-policy.service";
import { createCrmAccessPolicyService } from "@/contexts/crm/application/internal/queryservices/crm-access-policy.service";
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

  const catalogPolicyService = createCatalogAccessPolicyService();
  const crmPolicyService = createCrmAccessPolicyService();
  let canReadCatalog = false;
  let canReadCrm = false;
  try {
    await createOrganizationQueryService().getMyOrganization();
    canReadCatalog = true;
    canReadCrm = true;
  } catch {
    const defaultCatalogEstId = await catalogPolicyService.getDefaultEstablishmentId();
    if (defaultCatalogEstId) {
      canReadCatalog = true;
    }
    const defaultCrmEstId = await crmPolicyService.getDefaultEstablishmentId();
    if (defaultCrmEstId) {
      canReadCrm = true;
    }
  }

  return (
    <>
      <Sidebar
        initialAssistantConversations={assistantConversations.content}
        canReadCatalog={canReadCatalog}
        canReadCrm={canReadCrm}
      />
      <main className="flex-1 p-6 pt-16 lg:ml-60">{children}</main>
    </>
  );
}
