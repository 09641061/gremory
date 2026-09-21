import type { BillingAuthorizationSubject } from "../model/billing-authorization-subject";

export type BillingAccessIntent = "SUBSCRIPTION_OWNER" | "TENANT_MANAGER";
export type BillingAccessScope = "ACCOUNT" | "ORGANIZATION";

export type BillingAccessDenialReason =
  | "OWNER_REQUIRED"
  | "ORGANIZATION_REQUIRED"
  | "OWNED_ORGANIZATION_REQUIRED"
  | "BILLING_PERMISSION_REQUIRED";

export type BillingAccessDecision =
  | Readonly<{
      allowed: true;
      scope: BillingAccessScope;
      tenantId: string | null;
    }>
  | Readonly<{
      allowed: false;
      reason: BillingAccessDenialReason;
    }>;

/**
 * Resolves the boundary used by a Billing operation without performing IO.
 *
 * A subscription belongs to the authenticated account, so a new OWNER may
 * start checkout before an organization exists. Tenant-manager operations are
 * deliberately stricter and require the account's own organization plus the
 * billing capability returned by Business.
 */
export function resolveBillingAccess(
  subject: BillingAuthorizationSubject,
  intent: BillingAccessIntent,
): BillingAccessDecision {
  if (subject.accountType !== "OWNER") {
    return { allowed: false, reason: "OWNER_REQUIRED" };
  }

  const isForeignOrganizationContext =
    subject.organizationId !== null &&
    subject.organizationId !== subject.ownedOrganizationId;
  const tenantId = subject.ownedOrganizationId;
  const hasOrganization = tenantId !== null;

  if (isForeignOrganizationContext) {
    return { allowed: false, reason: "OWNED_ORGANIZATION_REQUIRED" };
  }

  if (!hasOrganization) {
    return intent === "SUBSCRIPTION_OWNER"
      ? { allowed: true, scope: "ACCOUNT", tenantId: null }
      : { allowed: false, reason: "ORGANIZATION_REQUIRED" };
  }

  if (intent === "TENANT_MANAGER" && !subject.canManageBilling) {
    return { allowed: false, reason: "BILLING_PERMISSION_REQUIRED" };
  }

  return { allowed: true, scope: "ORGANIZATION", tenantId };
}
