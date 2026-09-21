export type BillingAccountType = "OWNER" | "MEMBER" | "PENDING_INVITATION";

/**
 * Trusted workspace facts projected at the Billing boundary.
 *
 * Business owns workspace resolution. Billing only consumes this small ACL
 * projection to decide whether an account-level subscription operation or a
 * tenant-bound billing operation is allowed.
 */
export type BillingAuthorizationSubject = Readonly<{
  accountType: BillingAccountType;
  organizationId: string | null;
  ownedOrganizationId: string | null;
  canManageBilling: boolean;
}>;
