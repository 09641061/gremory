import "server-only";

import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { createCorrelationId } from "@/contexts/shared/infrastructure/http/api-client";
import type { BillingRequestContext } from "../../application/ports/billing-readers-writers";
import type { BillingAuthorizationSubject } from "../../application/model/billing-authorization-subject";
import {
  resolveBillingAccess,
  type BillingAccessDenialReason,
  type BillingAccessIntent,
} from "../../application/services/billing-access.policy";

export class BillingAuthorizationError extends Error {
  readonly status = 403;
  readonly reason: BillingAccessDenialReason;

  constructor(reason: BillingAccessDenialReason = "BILLING_PERMISSION_REQUIRED") {
    super("You are not allowed to manage billing.");
    this.name = "BillingAuthorizationError";
    this.reason = reason;
  }
}

/**
 * Authorizes subscription-owner operations such as checkout, subscription
 * reads, renewal, cancellation, and account-scoped invoice history.
 *
 * A newly registered OWNER has no organization yet, so this operation may
 * intentionally return a request context without a tenant header.
 */
export async function requireSubscriptionOwnerAccess(
  correlationId = createCorrelationId(),
): Promise<BillingRequestContext> {
  return requireBillingAccess("SUBSCRIPTION_OWNER", correlationId);
}

/**
 * Authorizes operations that truly act on an existing organization tenant.
 * Keep this stricter boundary separate from account-level checkout.
 */
export async function requireTenantBillingManager(
  correlationId = createCorrelationId(),
): Promise<BillingRequestContext> {
  return requireBillingAccess("TENANT_MANAGER", correlationId);
}

async function requireBillingAccess(
  intent: BillingAccessIntent,
  correlationId: string,
): Promise<BillingRequestContext> {
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel();
  const decision = resolveBillingAccess(toBillingAuthorizationSubject(workspace), intent);

  if (!decision.allowed) {
    throw new BillingAuthorizationError(decision.reason);
  }

  return {
    correlationId,
    ...(decision.tenantId ? { tenantId: decision.tenantId } : {}),
  };
}

function toBillingAuthorizationSubject(workspace: {
  accountType: BillingAuthorizationSubject["accountType"];
  organization?: { id: string };
  ownedOrganizationId: string | null;
  accessPolicy?: { canManageBilling: boolean };
  authorization?: { capabilities: { canManageBilling: boolean } };
  subscription?: { canManageBilling: boolean };
}): BillingAuthorizationSubject {
  return {
    accountType: workspace.accountType,
    organizationId: workspace.organization?.id ?? null,
    ownedOrganizationId: workspace.ownedOrganizationId,
    canManageBilling:
      workspace.accessPolicy?.canManageBilling === true ||
      workspace.authorization?.capabilities.canManageBilling === true ||
      workspace.subscription?.canManageBilling === true,
  };
}
