import { redirect } from "next/navigation";

interface OrganizationsRedirectPageProps {
  searchParams: Promise<{ establishmentId?: string; organizationId?: string }>;
}

/**
 * Legacy plural-route redirect: the product used to expose
 * `/organizations` (one card per organization). The settings hub now lives
 * under the singular `/organization` route, so any deep-link to the
 * plural path is forwarded there, preserving the workspace context.
 */
export default async function OrganizationsRoutePage({
  searchParams,
}: OrganizationsRedirectPageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();
  if (query.establishmentId) params.set("establishmentId", query.establishmentId);
  if (query.organizationId) params.set("organizationId", query.organizationId);
  const suffix = params.toString();
  redirect(suffix ? `/organization?${suffix}` : "/organization");
}
