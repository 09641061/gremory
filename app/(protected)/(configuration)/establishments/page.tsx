import { EstablishmentsPage } from "@/contexts/business/interfaces/components/establishment/establishments-page/establishments-page";
import { createBusinessAccessPolicyService } from "@/contexts/business/application/internal/queryservices/business-access-policy.service";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

interface EstablishmentsPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function EstablishmentsRoutePage({ searchParams }: EstablishmentsPageProps) {
  const { establishmentId } = await searchParams;
  const policyService = createBusinessAccessPolicyService();
  const { isOwner, canRead, canUpdateMap, allowedEstablishments } =
    await policyService.getEstablishmentsPermissions(establishmentId);

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
    redirect(`${redirectUrl}?denied=est`);
  }

  return (
    <EstablishmentsPage
      establishments={allowedEstablishments}
      canUpdateMap={canUpdateMap}
      defaultCanUpdate={isOwner}
    />
  );
}
