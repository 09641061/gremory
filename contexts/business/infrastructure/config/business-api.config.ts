import "server-only";

const baseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

export const businessApiConfig = Object.freeze({
  baseUrl: baseUrl.replace(/\/$/, ""),
  routes: Object.freeze({
    organizations: "/api/business/organizations",
    establishments: "/api/business/establishments",
  }),
});
