import type { ReactNode } from "react";

import { cookies } from "next/headers";
import { ListConversationsQueryService } from "@/contexts/assistant/application/internal/queryservices/list-conversations-query.service";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { hasAssistantSubscriptionAccess } from "@/contexts/billing/domain/services/subscription-access.policy";
import { BillingApiGateway } from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { Sidebar } from "@/contexts/shared/interfaces/components/sidebar";
import { createCatalogAccessPolicyService } from "@/contexts/catalog/application/internal/queryservices/catalog-access-policy.service";
import { createCrmAccessPolicyService } from "@/contexts/crm/application/internal/queryservices/crm-access-policy.service";
import { createWorkforceAccessPolicyService } from "@/contexts/workforce/application/internal/queryservices/workforce-access-policy.service";
import { createSchedulingAccessPolicyService } from "@/contexts/scheduling/application/internal/queryservices/scheduling-access-policy.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
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
    ? await new BillingApiGateway().getCurrentSubscription(accessToken).catch(() => null)
    : null;
  const hasAssistantAccess = hasAssistantSubscriptionAccess(subscription);

  const assistantConversations = hasAssistantAccess
    ? await new ListConversationsQueryService().handle({ page: 0, size: 20 })
    : { content: [] as AssistantConversationSummaryReadModel[] };

  const catalogPolicyService = createCatalogAccessPolicyService();
  const crmPolicyService = createCrmAccessPolicyService();
  const workforcePolicyService = createWorkforceAccessPolicyService();
  const schedulingPolicyService = createSchedulingAccessPolicyService();
  let canReadCatalog = false;
  let canReadCrm = false;
  let canReadTeam = false;
  let canReadScheduling = false;
  try {
    await createOrganizationQueryService().getMyOrganization();
    canReadCatalog = true;
    canReadCrm = true;
    canReadTeam = true;
    canReadScheduling = true;
  } catch {
    const defaultCatalogEstId = await catalogPolicyService.getDefaultEstablishmentId();
    if (defaultCatalogEstId) {
      canReadCatalog = true;
    }
    const defaultCrmEstId = await crmPolicyService.getDefaultEstablishmentId();
    if (defaultCrmEstId) {
      canReadCrm = true;
    }
    const defaultTeamEstId = await workforcePolicyService.getDefaultEstablishmentId();
    if (defaultTeamEstId) {
      canReadTeam = true;
    }
    const defaultSchedulingEstId = await schedulingPolicyService.getDefaultEstablishmentId();
    if (defaultSchedulingEstId) {
      canReadScheduling = true;
    }
  }

  return (
    <>
      <Sidebar
        initialAssistantConversations={assistantConversations.content}
        currentProfile={currentProfile}
        canReadCatalog={canReadCatalog}
        canReadCrm={canReadCrm}
        canReadTeam={canReadTeam}
        canReadScheduling={canReadScheduling}
        showAssistantSection={hasAssistantAccess}
        showAssistantNavigation={hasAssistantAccess}
      />
      <main className="flex-1 p-6 pt-16 lg:ml-60">{children}</main>
    </>
  );
}
