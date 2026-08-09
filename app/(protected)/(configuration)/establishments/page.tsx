import { EstablishmentsPage } from "@/contexts/business/interfaces/components/establishment/establishments-page/establishments-page";
import { createBusinessAccessPolicyService } from "@/contexts/business/application/internal/queryservices/business-access-policy.service";
import { redirect } from "next/navigation";

interface EstablishmentsPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function EstablishmentsRoutePage({ searchParams }: EstablishmentsPageProps) {
  const { establishmentId } = await searchParams;
  const policyService = createBusinessAccessPolicyService();
  const { isOwner, canRead, canCreate, canUpdateMap, allowedEstablishments } =
    await policyService.getEstablishmentsPermissions(establishmentId);

  if (!canRead) {
    redirect("/organizations?denied=est");
  }

  return (
    <EstablishmentsPage
      establishments={allowedEstablishments}
      canUpdateMap={canUpdateMap}
      defaultCanUpdate={isOwner}
      canCreate={canCreate}
    />
  );
}
