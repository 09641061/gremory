import { describe, expect, it } from "vitest";

import type { BillingAuthorizationSubject } from "@/contexts/billing/application/model/billing-authorization-subject";
import { resolveBillingAccess } from "@/contexts/billing/application/services/billing-access.policy";

function subject(overrides: Partial<BillingAuthorizationSubject> = {}): BillingAuthorizationSubject {
  return {
    accountType: "OWNER",
    organizationId: null,
    ownedOrganizationId: null,
    canManageBilling: false,
    ...overrides,
  };
}

describe("resolveBillingAccess", () => {
  it("should allow an initial owner to start account-level checkout without an organization", () => {
    // Arrange
    const initialOwner = subject();

    // Act
    const decision = resolveBillingAccess(initialOwner, "SUBSCRIPTION_OWNER");

    // Assert
    expect(decision).toEqual({ allowed: true, scope: "ACCOUNT", tenantId: null });
  });

  it("should resolve an owner's organization as the tenant for subscription operations", () => {
    // Arrange
    const owner = subject({
      organizationId: "org-1",
      ownedOrganizationId: "org-1",
      canManageBilling: true,
    });

    // Act
    const decision = resolveBillingAccess(owner, "SUBSCRIPTION_OWNER");

    // Assert
    expect(decision).toEqual({ allowed: true, scope: "ORGANIZATION", tenantId: "org-1" });
  });

  it("should deny subscription operations to a member even when a tenant is selected", () => {
    // Arrange
    const member = subject({
      accountType: "MEMBER",
      organizationId: "foreign-org",
      canManageBilling: false,
    });

    // Act
    const decision = resolveBillingAccess(member, "SUBSCRIPTION_OWNER");

    // Assert
    expect(decision).toEqual({ allowed: false, reason: "OWNER_REQUIRED" });
  });

  it("should require an organization for tenant-manager operations", () => {
    // Arrange
    const initialOwner = subject();

    // Act
    const decision = resolveBillingAccess(initialOwner, "TENANT_MANAGER");

    // Assert
    expect(decision).toEqual({ allowed: false, reason: "ORGANIZATION_REQUIRED" });
  });

  it("should deny an owner while viewing a foreign organization context", () => {
    // Arrange
    const foreignContext = subject({
      organizationId: "foreign-org",
      ownedOrganizationId: "owned-org",
      canManageBilling: true,
    });

    // Act
    const decision = resolveBillingAccess(foreignContext, "SUBSCRIPTION_OWNER");

    // Assert
    expect(decision).toEqual({ allowed: false, reason: "OWNED_ORGANIZATION_REQUIRED" });
  });

  it("should deny an owner without an owned organization in a foreign context", () => {
    // Arrange
    const foreignContext = subject({
      organizationId: "foreign-org",
      ownedOrganizationId: null,
    });

    // Act
    const decision = resolveBillingAccess(foreignContext, "SUBSCRIPTION_OWNER");

    // Assert
    expect(decision).toEqual({ allowed: false, reason: "OWNED_ORGANIZATION_REQUIRED" });
  });

  it("should require the billing capability for tenant-manager operations", () => {
    // Arrange
    const ownerWithoutBillingPermission = subject({
      organizationId: "org-1",
      ownedOrganizationId: "org-1",
      canManageBilling: false,
    });

    // Act
    const decision = resolveBillingAccess(ownerWithoutBillingPermission, "TENANT_MANAGER");

    // Assert
    expect(decision).toEqual({ allowed: false, reason: "BILLING_PERMISSION_REQUIRED" });
  });
});
