import { notFound } from "next/navigation";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { EditEstablishmentForm } from "@/contexts/business/interfaces/components/bussines/edit-establishment-form";

export default async function EditEstablishmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const establishment = await getEstablishment(id);

  return (
    <EditEstablishmentForm
      establishment={{
        id: establishment.props.id.value,
        name: establishment.props.name.value,
        photoUrl: establishment.props.photoUrl.value,
      }}
    />
  );
}

async function getEstablishment(id: string) {
  try {
    return await createEstablishmentQueryService().getById({ id });
  } catch {
    notFound();
  }
}
