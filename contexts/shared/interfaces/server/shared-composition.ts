import "server-only";

import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { CurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import { createBusinessWorkspaceOutboundService } from "@/contexts/shared/application/internal/outboundservices/business-workspace.outbound.service";
import { BusinessWorkspaceOutboundService } from "@/contexts/shared/application/internal/outboundservices/business-workspace.outbound.service";
import { EntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";
import { AppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";
import { PlanHomeRouteQueryService } from "@/contexts/shared/application/internal/queryservices/plan-home-route-query.service";
import { BillingApiGateway } from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";

/**
 * Server-only composition for cross-BC entry routes, app-shell and
 * plan-home lookups. Composition hands out the current
 * `EntryRouteQueryService`, `AppShellQueryService`, and
 * `PlanHomeRouteQueryService` with their dependencies wired up.
 */
export type ComposedSharedAdapters = Readonly<{
  entryRouteQueryService: EntryRouteQueryService;
  appShellQueryService: AppShellQueryService;
  planHomeRouteQueryService: PlanHomeRouteQueryService;
  workspaceOutboundService: BusinessWorkspaceOutboundService;
}>;

export function composeSharedAdapters(accessToken?: string): ComposedSharedAdapters {
  const business = composeBusinessAdapters(accessToken);
  const billingGateway = new BillingApiGateway();
  const subscriptionQuery = new CurrentSubscriptionQueryService(billingGateway);
  const workspaceOutboundService = createBusinessWorkspaceOutboundService(business.workspaceReader);
  const entryRouteQueryService = new EntryRouteQueryService(workspaceOutboundService, subscriptionQuery);
  const appShellQueryService = new AppShellQueryService(business.workspaceQueryService, subscriptionQuery);
  const planHomeRouteQueryService = new PlanHomeRouteQueryService(appShellQueryService);
  return {
    entryRouteQueryService,
    appShellQueryService,
    planHomeRouteQueryService,
    workspaceOutboundService,
  };
}
