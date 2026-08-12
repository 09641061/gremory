import type { SubscriptionAccessSnapshot } from "@/contexts/billing/domain/services/subscription-access.policy";

export type EntryRoutePath =
  | "/chat"
  | "/schedule"
  | "/catalog"
  | "/crm"
  | "/team"
  | "/organizations"
  | "/access-denied";

// `setupHref` is where an unfinished workspace is sent. `allowedPaths` are the
// routes that setup flow may legitimately reach on its own, so the proxy does
// not bounce a user back while they are completing it.
export type EntryRouteResolution =
  | { status: "ready"; homeHref: EntryRoutePath }
  | {
      status: "organization-required";
      setupHref: "/organizations";
      allowedPaths: ReadonlyArray<string>;
    }
  | {
      status: "establishment-required";
      setupHref: "/establishments/new";
      allowedPaths: ReadonlyArray<string>;
    }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export type EntryRouteInput = {
  accessToken: string;
  subscription: SubscriptionAccessSnapshot | null | undefined;
};

export type EntryRouteEstablishment = Readonly<{
  organizationId: string;
  organizationName: string;
  establishmentId: string;
  establishmentName: string;
  roles?: ReadonlyArray<{ name: string }>;
  effectivePermissions: ReadonlyArray<string>;
}>;
