import "server-only";

import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { createCorrelationId } from "@/contexts/shared/infrastructure/http/api-client";
import type { BillingRequestContext } from "../../application/ports/billing-readers-writers";

export class BillingAuthorizationError extends Error {
  readonly status = 403;
  constructor(message = "You are not allowed to manage billing.") {
    super(message);
    this.name = "BillingAuthorizationError";
  }
}

/** Resolve authorization and tenant from the trusted workspace resource. */
export async function requireBillingManager(
  correlationId = createCorrelationId(),
): Promise<BillingRequestContext> {
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel();
  const canManageBilling =
    workspace.accessPolicy?.canManageBilling === true ||
    workspace.authorization?.capabilities.canManageBilling === true ||
    workspace.subscription?.canManageBilling === true;
  const tenantId = workspace.organization?.id ?? workspace.ownedOrganizationId ?? null;
  if (!canManageBilling || !tenantId) throw new BillingAuthorizationError();
  return { tenantId, correlationId };
}
