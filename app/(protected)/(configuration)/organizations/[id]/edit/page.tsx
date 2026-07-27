import { notFound } from "next/navigation";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { EditOrganizationForm } from "@/contexts/business/interfaces/components/organization/edit-organization/edit-organization-form";

export default async function EditOrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await createOrganizationQueryService().getById({ id });

  if (!organization) notFound();

  return (
    <EditOrganizationForm
      organization={{
        id: organization.id,
        name: organization.name,
      }}
    />
  );
}
