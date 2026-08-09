import type { SubscriptionAccessSnapshot } from "@/contexts/billing/domain/services/subscription-access.policy";

export type EntryRoutePath =
  | "/chat"
  | "/schedule"
  | "/catalog"
  | "/crm"
  | "/team"
  | "/organizations";

export type EntryRouteResolution =
  | { status: "ready"; homeHref: EntryRoutePath }
  | { status: "organization-required"; setupHref: "/organizations" }
  | { status: "establishment-required"; setupHref: "/establishments/new" }
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

