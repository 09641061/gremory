export type EntryRoutePath =
  | "/chat"
  | "/schedule"
  | "/catalog"
  | "/crm"
  | "/team"
  | "/organization"
  | "/welcome"
  | "/access-denied";

// `setupHref` is where an unfinished workspace is sent. `allowedPaths` are the
// routes that setup flow may legitimately reach on its own, so the proxy does
// not bounce a user back while they are completing it.
export type EntryRouteResolution =
  | { status: "ready"; homeHref: EntryRoutePath }
  | {
      status: "invitation-pending";
      setupHref: "/invitations/pending";
      allowedPaths: ReadonlyArray<string>;
    }
  | {
      status: "organization-required";
      setupHref: "/organizations/new";
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
  /**
   * The account's persisted workspace selection (URL or cookie fallback).
   * Without it, landing resolution falls back to the account's default
   * identity, which can silently override the active organization.
   */
  organizationId?: string;
  establishmentId?: string;
};

// The organization is fixed for the account, so entry decisions only depend on
// the establishment and the permissions held inside it.
export type EntryRouteEstablishment = Readonly<{
  establishmentId: string;
  establishmentName: string;
  roles?: ReadonlyArray<{ name: string }>;
  effectivePermissions: ReadonlyArray<string>;
}>;
