import { OrganizationsPageView } from "@/contexts/business/interfaces/components/organization/organizations-page/organizations-page-view";
import { CreateOrganizationForm } from "@/contexts/business/interfaces/components/organization/create-organization/create-organization-form";
import { createBusinessAccessPolicyService } from "@/contexts/business/application/internal/queryservices/business-access-policy.service";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

interface OrganizationsPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function OrganizationsRoutePage({ searchParams }: OrganizationsPageProps) {
  const { establishmentId } = await searchParams;
  const policyService = createBusinessAccessPolicyService();
  const { canRead, canUpdate, organization } = await policyService.getOrganizationPermissions(establishmentId);

  if (!organization) {
    return <CreateOrganizationForm />;
  }

  if (!canRead) {
    const headersList = await headers();
    const referer = headersList.get("referer");
    let redirectUrl = "/chat";
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        redirectUrl = refererUrl.pathname;
      } catch {}
    }
    redirect(`${redirectUrl}?denied=org`);
  }

  return <OrganizationsPageView organization={organization} canUpdate={canUpdate} />;
}
