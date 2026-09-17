import { z } from "zod";

import { pageResponseSchema } from "@/contexts/shared/interfaces/rest/schemas/page-response.schema";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

/** Core injects a semantic Owner role whose id is UUID.nameUUIDFromBytes("semantic-role:owner"). */
export const SEMANTIC_OWNER_ROLE_ID = "270363ca-3cdb-31fa-9707-8b71b52c1d4b";

const SEMANTIC_ROLE_IDS: Record<string, string> = {
  "semantic-role:owner": SEMANTIC_OWNER_ROLE_ID,
};

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/** Guards scope ids that may start empty/invalid before the session is hydrated. */
export function normalizeUuidOrNull(value: unknown): string | null {
  return isUuid(value) ? value : null;
}

/** Accepts a canonical UUID or a semantic id and returns a valid 36-char UUID. */
export function normalizeRoleId(value: string): string {
  if (isUuid(value)) return value;
  return SEMANTIC_ROLE_IDS[value] ?? ZERO_UUID;
}

export const workforceRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: z.number().int(),
  systemRole: z.boolean(),
  permissions: z.array(z.string()),
});

export const workforceMemberEstablishmentSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
});

export const workforceMemberSchema = z.object({
  invitationId: z.string().uuid(),
  memberId: z.string().uuid().nullable(),
  userId: z.string().uuid().nullable(),
  email: z.string().email(),
  username: z.string().nullable(),
  imageUrl: z.string().nullable(),
  organizationId: z.string(),
  organizationName: z.string().nullable(),
  establishmentId: z.string(),
  establishmentName: z.string().nullable(),
  establishments: z.array(workforceMemberEstablishmentSchema).optional().default([]),
  status: z.enum(["PENDING", "ACTIVE", "REMOVED", "EXPIRED"]),
  roles: z.array(workforceRoleSchema),
  invitedAt: z.string(),
  invitationExpiresAt: z.string(),
  acceptedAt: z.string().nullable(),
  joinedAt: z.string().nullable(),
  removedAt: z.string().nullable(),
  isOwner: z.boolean(),
});

export const workforceMemberPageSchema = pageResponseSchema(workforceMemberSchema);
export const workforceRolePageSchema = pageResponseSchema(workforceRoleSchema);

export const createWorkforceInvitationSchema = z
  .object({
    establishmentIds: z
      .array(z.string().uuid("A valid establishment is required"))
      .min(1, "Select at least one establishment"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    roleIds: z.array(z.string().uuid()).max(50).optional().default([]),
  })
  .strict();

export const updateMemberScopeSchema = z
  .object({
    establishmentIds: z
      .array(z.string().uuid("A valid establishment is required"))
      .min(1, "Select at least one establishment"),
  })
  .strict();

export const workforceInvitationSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  establishmentId: z.string().uuid(),
  establishmentName: z.string().nullable(),
  invitedEmail: z.string(),
  invitedByUserId: z.string().uuid(),
  status: z.enum(["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"]),
  expiresAt: z.string(),
  acceptedByUserId: z.string().uuid().nullable(),
  acceptedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const workforceMembershipSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  email: z.string().nullable(),
  organizationId: z.string().uuid(),
  establishmentId: z.string().uuid(),
  establishmentName: z.string().nullable(),
  invitationId: z.string().uuid(),
  status: z.enum(["ACTIVE", "REMOVED"]),
  joinedAt: z.string(),
  removedAt: z.string().nullable(),
});

export const workforceInvitationAcceptanceSchema = z.object({
  invitation: workforceInvitationSchema,
  membership: workforceMembershipSchema,
  alreadyMember: z.boolean(),
});

export const workforceInvitationPreviewSchema = z.object({
  organizationId: z.string().uuid(),
  organizationName: z.string(),
  establishmentId: z.string().uuid(),
  establishmentName: z.string(),
  invitedEmail: z.string(),
  maskedEmail: z.string(),
  status: z.enum(["PENDING", "ACCEPTED", "REMOVED"]),
  expiresAt: z.string(),
});

export const workforceRolePermissionCatalog = [
  "organization:read",
  "organization:update",
  "establishment:read",
  "establishment:create",
  "establishment:update",
  "establishment:delete",
  "workforce:member:read",
  "workforce:member:invite",
  "workforce:member:manage",
  "governance:role:read",
  "governance:role:manage",
  "catalog:manage",
  "catalog:delete",
  "crm:customer:manage",
  "crm:customer:delete",
  "crm:customer:resolve-document",
  "scheduling:appointment:manage",
  "scheduling:appointment:cancel",
  "scheduling:appointment:delete",
  "assistant:use",
  "assistant:delete",
] as const;

export type WorkforceRolePermission = (typeof workforceRolePermissionCatalog)[number];

/** Grouped, human-friendly matrix rendered by the role editor. */
export type WorkforceRolePermissionEntry = {
  code: WorkforceRolePermission;
  label: string;
  description?: string;
};

export type WorkforceRolePermissionSection = {
  title: string;
  permissions: ReadonlyArray<WorkforceRolePermissionEntry>;
};

export const workforceRolePermissionGroups: ReadonlyArray<{
  title: string;
  section: "core" | "governance";
  permissions?: ReadonlyArray<WorkforceRolePermissionEntry>;
  sections?: ReadonlyArray<WorkforceRolePermissionSection>;
}> = [
  {
    title: "Catalog",
    section: "core",
    permissions: [
      {
        code: "catalog:manage",
        label: "Manage catalog",
        description:
          "Full management packet: View catalog, create and edit services, activate/deactivate, move categories, and create/edit categories.",
      },
      {
        code: "catalog:delete",
        label: "Delete catalog entries",
        description:
          "Destructive action: Permanently delete services or categories from the system.",
      },
    ],
  },
  {
    title: "CRM Permissions",
    section: "core",
    permissions: [
      {
        code: "crm:customer:manage",
        label: "Manage customer directory",
        description:
          "Full management packet: Search customers, view history/profile, create new records, and edit contact data.",
      },
      {
        code: "crm:customer:delete",
        label: "Delete customers",
        description:
          "Destructive action: Permanently delete customer profiles from the system database.",
      },
      {
        code: "crm:customer:resolve-document",
        label: "Autofill identity data",
        description:
          "API Consumption: Enable the automatic data backfill button using DNI/RUC queries.",
      },
    ],
  },
  {
    title: "Schedule Permissions",
    section: "core",
    permissions: [
      {
        code: "scheduling:appointment:manage",
        label: "Manage schedule & appointments",
        description:
          "Full operational packet: View calendar grid, book appointments, reschedule/edit fields, and trigger status updates (Start, Complete, No-show).",
      },
      {
        code: "scheduling:appointment:cancel",
        label: "Cancel appointments",
        description:
          "Operational annulment: Cancel appointments while registering a required reason, keeping the data history intact for metrics.",
      },
      {
        code: "scheduling:appointment:delete",
        label: "Delete appointments",
        description:
          "Destructive action: Permanently delete appointment records from the system database.",
      },
    ],
  },
  {
    title: "Assistant Permissions",
    section: "core",
    permissions: [
      {
        code: "assistant:use",
        label: "Use AI assistant",
        description:
          "Full interaction packet: Open AI interface, send prompts, create conversations, view sidebar history, and rename chats.",
      },
      {
        code: "assistant:delete",
        label: "Delete conversations",
        description:
          "Destructive action: Permanently delete chat threads or conversation history from the database.",
      },
    ],
  },
  {
    title: "Organization Settings",
    section: "governance",
    permissions: [
      { code: "organization:read", label: "View organization details", description: "Access and view core corporate metadata." },
      { code: "organization:update", label: "Update organization info", description: "Edit company profile, legal headers, and global logos." },
    ],
  },
  {
    title: "Establishments Management",
    section: "governance",
    permissions: [
      { code: "establishment:read", label: "View establishments", description: "List and browse all physical business locations." },
      { code: "establishment:create", label: "Create new establishments", description: "Provision and open new store profiles under the brand." },
      { code: "establishment:update", label: "Update establishment fields", description: "Edit local time zones, addresses, and individual branch imagery." },
      { code: "establishment:delete", label: "Delete establishments", description: "Destructive action: Permanently delete physical branch profiles from the system." },
    ],
  },
  {
    title: "Team & Workforce",
    section: "governance",
    permissions: [
      { code: "workforce:member:read", label: "View staff directory", description: "Browse the unified team roster and view colleague statuses." },
      { code: "workforce:member:invite", label: "Invite new staff members", description: "Access invitation forms and dispatch new employee clearance setup tokens." },
      { code: "workforce:member:manage", label: "Manage staff status & assignments", description: "In-row fast role assignment, toggle scopes, and revoke active memberships." },
    ],
  },
  {
    title: "Governance & Roles",
    section: "governance",
    permissions: [
      { code: "governance:role:read", label: "View custom roles configuration", description: "Browse organization-specific permission structures and matrices." },
      { code: "governance:role:manage", label: "Manage security matrices & roles", description: "Destructive/Critical action: Create, update checkboxes, and permanently delete system security clearance profiles." },
    ],
  },
];

const rolePermissionSchema = z.enum(workforceRolePermissionCatalog);

export const createWorkforceRoleSchema = z.object({
  name: z.string().trim().min(1, "Role name is required").max(100, "Role name cannot exceed 100 characters"),
  permissions: z.array(rolePermissionSchema).max(workforceRolePermissionCatalog.length).refine(
    (permissions) => new Set(permissions).size === permissions.length,
    "Role permissions cannot contain duplicates",
  ),
}).strict();

export const updateWorkforceRoleSchema = createWorkforceRoleSchema;

export type WorkforceMemberResource = z.infer<typeof workforceMemberSchema>;
export type WorkforceMemberEstablishmentResource = z.infer<typeof workforceMemberEstablishmentSchema>;
export type WorkforceRoleResource = z.infer<typeof workforceRoleSchema>;
export type WorkforceInvitationResource = z.infer<typeof workforceInvitationSchema>;
export type WorkforceMembershipResource = z.infer<typeof workforceMembershipSchema>;
export type WorkforceInvitationAcceptanceResource = z.infer<typeof workforceInvitationAcceptanceSchema>;
export type WorkforceInvitationPreviewResource = z.infer<typeof workforceInvitationPreviewSchema>;
export type CreateWorkforceInvitationInput = z.infer<typeof createWorkforceInvitationSchema>;
