import "server-only";

const baseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

export const apiConfig = Object.freeze({
  baseUrl: baseUrl.replace(/\/+$/, ""),
  routes: Object.freeze({
    authentication: Object.freeze({
      root: "/api/v1/auth",
      signIn: "/api/v1/auth/sign-in",
      confirm: "/api/v1/auth/confirm",
      refresh: "/api/v1/auth/refresh",
      verify: "/api/v1/auth/verify",
      signOut: "/api/v1/auth/sign-out",
      magicLink: "/api/v1/auth/magic-link",
      googleAuthorize: "/api/v1/auth/google/authorize",
    }),
    profiles: Object.freeze({
      root: "/api/v1/profiles",
      preferences: "/api/v1/profiles/preferences",
    }),
    organizations: "/api/business/organizations",
    workspace: "/api/business/workspace",
    organizationImages: "/api/business/organizations/images",
    establishments: "/api/business/establishments",
    establishmentImages: "/api/business/establishments/images",
    plans: "/api/billing/plans",
    subscriptions: "/api/billing/subscriptions",
    invoices: "/api/billing/invoices",
    assistantConversations: "/api/assistant/chats",
    catalogCategories: "/api/catalog/categories",
    catalogServices: "/api/catalog/services",
    workforce: Object.freeze({
      invitations: "/api/workforce/invitations",
      members: "/api/workforce/members",
      access: "/api/workforce/access",
      roles: "/api/workforce/roles",
      rolePermissions: "/api/workforce/roles/permissions",
    }),
    scheduling: Object.freeze({
      appointments: "/api/scheduling/appointments",
    }),
    devices: "/api/devices",
    notifications: "/api/notifications",
  }),
});
