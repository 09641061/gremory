import { redirect } from "next/navigation";

interface OrganizationsRoutePageProps {
  searchParams: Promise<{ establishmentId?: string; organizationId?: string }>;
}

/**
 * Keep the old plural URL as a compatibility alias. There is only one
 * organization per account, so organization settings live at `/organization`.
 */
export default async function OrganizationsRoutePage({ searchParams }: OrganizationsRoutePageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();
  if (query.establishmentId) params.set("establishmentId", query.establishmentId);
  if (query.organizationId) params.set("organizationId", query.organizationId);
  const queryString = params.toString();

  redirect(queryString ? `/organization?${queryString}` : "/organization");
}
