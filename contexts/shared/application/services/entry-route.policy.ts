import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import type {
  EntryRouteResolution,
  EntryRouteSubscriptionState,
} from "../model/entry-route.view-models";

/**
 * The ordering here is the application's bootstrap contract. Keeping it pure
 * makes the same decision reusable from the request proxy, the root page, and
 * the server-side layout backstops without making any of them know transport
 * details.
 */
export function resolveEntryRoutePolicy(
  workspace: WorkspaceHeaderViewModel,
  subscription: EntryRouteSubscriptionState,
): EntryRouteResolution {
  // Invitations are owned by the invited account, not by Billing. They must
  // always be actionable even when the host organization has no subscription.
  if (workspace.accountType === "PENDING_INVITATION") {
    return {
      status: "invitation-pending",
      setupHref: "/invitations/pending",
      allowedPaths: ["/invitations/pending"],
    };
  }

  // A subscription is an entry prerequisite for an owner. Members use the
  // subscription of the organization owner and must not be blocked by a
  // billing lookup made in the member's account.
  if (workspace.accountType === "OWNER") {
    if (subscription === "unavailable") {
      return { status: "unavailable" };
    }

    if (subscription !== "active") {
      return {
        status: "subscription-required",
        setupHref: "/welcome",
        allowedPaths: ["/welcome"],
      };
    }
  }

  if (
    workspace.onboardingStatus === "ORGANIZATION_PENDING" ||
    (!workspace.organization &&
      (workspace.accountType === "OWNER" || workspace.canCreateOrganization))
  ) {
    return {
      status: "organization-required",
      setupHref: "/organizations/new",
      allowedPaths: ["/organizations/new"],
    };
  }

  if (workspace.onboardingStatus === "ESTABLISHMENT_PENDING") {
    return {
      status: "establishment-required",
      setupHref: "/establishments/new",
      allowedPaths: ["/establishments/new"],
    };
  }

  const ownEstablishments = workspace.organization
    ? workspace.establishments.filter(
        (establishment) =>
          !establishment.organizationId ||
          establishment.organizationId === workspace.organization!.id,
      )
    : workspace.establishments;

  if (ownEstablishments.length === 0) {
    return workspace.canCreateEstablishment
      ? {
          status: "establishment-required",
          setupHref: "/establishments/new",
          allowedPaths: ["/establishments/new"],
        }
      : { status: "ready", homeHref: "/access-denied" };
  }

  return {
    status: "ready",
    homeHref: resolveAccessPolicyEntryPath(workspace),
  };
}

function resolveAccessPolicyEntryPath(
  workspace: WorkspaceHeaderViewModel,
): Extract<EntryRouteResolution, { status: "ready" }>["homeHref"] {
  const accessPolicy = workspace.accessPolicy;
  if (accessPolicy?.canUseAssistant) return "/chat";
  if (accessPolicy?.canOpenScheduling) return "/schedule";
  if (accessPolicy?.canOpenCatalog) return "/catalog";
  if (accessPolicy?.canOpenCrm) return "/crm";
  if (accessPolicy?.canOpenTeam) return "/team";
  if (accessPolicy?.canOpenAnalytics) return "/analytics";

  // No module is openable, but the account may still manage the establishment
  // profile (`establishment:update`), which lives on the establishments page.
  if (
    workspace.canReadEstablishments &&
    workspace.establishments.some((establishment) => establishment.canUpdate === true)
  ) {
    return "/establishments";
  }

  // A member with no roles or only roles without permissions is in the
  // restricted state; the backend flags it with `canOpenModules: false`.
  if (workspace.authorization?.capabilities?.canOpenModules === false) {
    return "/no-access";
  }

  return "/access-denied";
}
