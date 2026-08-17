# Permissions, Roles, and Workspace Contract

This document is the shared contract between the frontend and backend. It records
the decisions made for v1 and should be consulted before changing authorization,
workspace selection, onboarding, or Workforce roles.

## Core Rules

- `GET /api/business/organizations/accessible` is the organization catalog.
- `GET /api/business/workspace` is the selected organization context.
- `GET /api/workforce/members` is the Workforce roster.
- `GET /api/workforce/access` contains membership-derived access, not owner identity.
- `GET /api/scheduling/appointments/employees` is the source of selectable appointment employees.
- `organization.permissions` controls organization-level actions.
- `establishment.permissions` controls direct establishment actions.
- `establishment.effectivePermissions` controls detailed module and action permissions.
- `workspace.accessPolicy` controls entry to primary application modules.
- `workspace.authorization.role` is display/context information, not authorization by itself.
- `accountType === "OWNER"` must never mean "grant every permission" in the frontend.

## Bootstrap and Workspace Selection

After authentication, load the organization catalog without an organization filter:

```http
GET /api/business/organizations/accessible
Authorization: Bearer <accessToken>
```

Example:

```json
[
  {
    "id": "org-owner",
    "name": "My organization",
    "imageUrl": null,
    "isOwned": true,
    "permissions": {
      "canRead": true,
      "canUpdate": true,
      "canCreateEstablishment": true
    },
    "establishments": []
  },
  {
    "id": "org-host",
    "name": "Invited organization",
    "imageUrl": null,
    "isOwned": false,
    "permissions": {
      "canRead": true,
      "canUpdate": false,
      "canCreateEstablishment": false
    },
    "establishments": []
  }
]
```

The frontend must not reconstruct organizations by grouping
`workspace.establishments`. An organization must remain visible even when it has
no establishments visible to the user.

After selecting an organization, load its context:

```http
GET /api/business/workspace?organizationId=<organizationId>
Authorization: Bearer <accessToken>
```

Add `establishmentId` only when the user explicitly selects an establishment.
The organization index itself should remain `/organizations`, without a stale
`organizationId` query parameter.

## Workspace Response

The workspace response contains the active context and its permissions:

```json
{
  "accountType": "OWNER | MEMBER | PENDING_INVITATION",
  "onboardingStatus": "ORGANIZATION_PENDING | ESTABLISHMENT_PENDING | COMPLETED",
  "onboardingCompleted": true,
  "organization": {
    "id": "org-id",
    "name": "Organization",
    "permissions": {
      "canRead": true,
      "canUpdate": true,
      "canCreateEstablishment": true
    }
  },
  "establishments": [
    {
      "id": "est-id",
      "name": "Main branch",
      "organizationId": "org-id",
      "permissions": {
        "canRead": true,
        "canUpdate": true,
        "canDelete": true
      },
      "effectivePermissions": [
        "establishment:read",
        "establishment:update",
        "establishment:delete",
        "scheduling:read",
        "scheduling:manage",
        "catalog:read",
        "catalog:manage",
        "crm:read",
        "crm:manage",
        "analytics:read",
        "workforce:read",
        "workforce:invite",
        "workforce:manage_members",
        "workforce:manage_roles"
      ]
    }
  ],
  "activeEstablishmentId": "est-id",
  "subscription": {
    "active": true,
    "planName": "Free",
    "status": "ACTIVE",
    "canManageBilling": true
  },
  "authorization": {
    "role": "OWNER",
    "scope": {
      "type": "ORGANIZATION",
      "id": "org-id",
      "name": "Organization"
    },
    "capabilities": {
      "canEditOrganizationProfile": true,
      "canEditEstablishmentProfile": true,
      "canManageMembers": true,
      "canManageBilling": true,
      "canOpenModules": true,
      "canInviteUsers": true
    }
  },
  "accessPolicy": {
    "canOpenAnalytics": true,
    "canOpenScheduling": true,
    "canOpenCrm": true,
    "canOpenCatalog": true,
    "canOpenTeam": true,
    "canUseAssistant": false,
    "canCreateEstablishment": true,
    "canManageBilling": true
  },
  "ownedOrganizationId": "org-id"
}
```

## Onboarding

- `accountType === "PENDING_INVITATION"`: show the invitation acceptance flow.
- `organization === null` and `onboardingStatus === "ORGANIZATION_PENDING"`: show `/organizations/new`.
- `organization !== null` and `onboardingStatus === "ESTABLISHMENT_PENDING"`: send the regular flow to `/establishments/new`.
- `/establishments/setup` is only an informational fallback reached from the organization selector. It is not the creation form.
- `onboardingStatus === "COMPLETED"`: show the normal application shell.

## Organization Permissions

Organization profile and organization-level actions use only:

```ts
const canEditOrganization =
  workspace.organization?.permissions.canUpdate === true;

const canCreateEstablishment =
  workspace.organization?.permissions.canCreateEstablishment === true;
```

Relevant operations:

```http
PUT /api/business/organizations/{organizationId}
POST /api/business/establishments
```

Workforce role permissions must not grant a member the ability to edit the
global organization profile. A Manager can operate an assigned establishment
without being able to rename the organization or change its logo.

## Establishment Permissions

Direct establishment actions use:

```ts
const canReadEstablishment = establishment.permissions.canRead;
const canEditEstablishment = establishment.permissions.canUpdate;
const canDeleteEstablishment = establishment.permissions.canDelete;
```

Detailed establishment permissions are:

```text
establishment:read
establishment:update
establishment:delete
```

The delete permission remains part of the backend contract, but it is not
assignable from the Workforce role editor. The frontend exposes delete only for
an establishment belonging to the owner's organization and only when the
workspace payload says `permissions.canDelete === true`.

## Module Access

Primary module entry is controlled only by `accessPolicy`:

```ts
workspace.accessPolicy?.canOpenScheduling === true;
workspace.accessPolicy?.canOpenCatalog === true;
workspace.accessPolicy?.canOpenCrm === true;
workspace.accessPolicy?.canOpenTeam === true;
workspace.accessPolicy?.canOpenAnalytics === true;
```

Do not use `authorization.capabilities.canOpenScheduling` or
`effectivePermissions` as a replacement for module entry policy.

If an owner has an inactive subscription and billing management is available,
blocked modules should send the owner to `/upgrade`, not directly to
`/access-denied`. Other permission failures use `/access-denied`.

## Detailed Permissions

The following permissions are assigned to Workforce roles at establishment
scope:

```text
establishment:read
establishment:update
establishment:delete
scheduling:read
scheduling:manage
catalog:read
catalog:manage
crm:read
crm:manage
analytics:read
workforce:read
workforce:invite
workforce:manage_members
workforce:manage_roles
workforce:manage
```

Organization permissions are returned by the workspace and are not assignable
through the establishment role editor:

```text
organization:read
organization:update
organization:create_establishment
organization:manage_billing
```

Typical role expectations:

### Worker

```text
establishment:read
scheduling:read
catalog:read
crm:read
analytics:read
workforce:read
```

Worker cannot edit establishments, manage catalog or CRM, create appointments,
invite users, manage members, or modify roles.

### Manager

```text
establishment:read
establishment:update
scheduling:read
scheduling:manage
catalog:read
catalog:manage
crm:read
crm:manage
analytics:read
workforce:read
workforce:invite
workforce:manage_members
workforce:manage_roles
```

### Owner

Owner is not an assignable Workforce role. Ownership is exposed through:

```ts
workspace.authorization?.role === "OWNER"
```

The frontend must still use concrete permissions for every action. Owner status
does not override `permissions`, `effectivePermissions`, `accessPolicy`, or
subscription state.

## Workforce Roster and Everyone

Roster endpoint:

```http
GET /api/workforce/members?establishmentId=<establishmentId>
```

Each member can contain:

```json
{
  "userId": "user-id",
  "memberId": "membership-id",
  "username": "User",
  "isOwner": false,
  "roles": [
    {
      "name": "Everyone",
      "systemRole": true,
      "permissions": []
    },
    {
      "name": "Worker",
      "systemRole": false,
      "permissions": ["establishment:read", "scheduling:read"]
    }
  ],
  "status": "ACTIVE",
  "availableForScheduling": true
}
```

`Everyone` is inherited system context, not a useful assigned role. The Team UI
should hide it when it has no permissions and display `No role assigned` if no
functional role remains. If `isOwner === true`, display `OWNER` and do not show
the role dropdown.

## Appointments

Selectable employees come from Scheduling, not Workforce:

```http
GET /api/scheduling/appointments/employees?establishmentId=<establishmentId>
```

Use `employee.userId` as `employeeId`, never `memberId`.

Create request:

```http
POST /api/scheduling/appointments
```

```json
{
  "title": "Haircut",
  "startsAt": "2026-08-17T10:00:00-05:00",
  "endsAt": "2026-08-17T11:00:00-05:00",
  "serviceId": "service-id",
  "customerId": "customer-id",
  "employeeId": "employee-user-id",
  "establishmentId": "establishment-id"
}
```

The creator needs `scheduling:manage`. The selected employee needs
`scheduling:read`. The backend remains the final authority for employee
eligibility and subscription checks.

## Subscription and Errors

An active Free subscription allows normal owner permissions. Subscription state
can restrict module access and special capabilities, but must not be confused
with role permissions.

- `401`: refresh the access and refresh tokens. If refresh fails, clear session and return to login.
- `403`: inspect subscription, organization context, establishment context, and concrete permissions.
- `404`: inspect organization, establishment, user, and resource IDs.
- `409`: report a conflict such as duplicate membership or scheduling conflict.

Access and refresh tokens are both rotational. A successful refresh must persist
both returned tokens. Permissions are not stored in the JWT; permission changes
do not require token invalidation.

## Merge Checklist

Before merging authorization-related changes into `develop`:

- Do not reintroduce `business:read` or `business:manage`.
- Do not infer permissions from `accountType` or `authorization.role` alone.
- Do not rebuild the organization selector from workspace establishments.
- Do not use `memberId` as appointment `employeeId`.
- Do not use Workforce access as the owner identity source.
- Do not expose `Everyone` as a functional role.
- Do not expose `establishment:delete` in the Workforce role editor.
- Preserve `organizationId` and `establishmentId` when changing context.
- Confirm inactive-owner module redirects go to `/upgrade` when billing is manageable.
- Run `npm test`, `npm run lint`, and `npx tsc --noEmit`.
