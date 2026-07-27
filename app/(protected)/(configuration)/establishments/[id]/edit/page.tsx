import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { EditEstablishmentForm } from "@/contexts/business/interfaces/components/business/edit-establishment-form";

export default async function EditEstablishmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const establishment = await createEstablishmentQueryService().getById({ id });
  if (!establishment) notFound();

  return (
    <EditEstablishmentForm
      key={`${establishment.id}:${establishment.name}:${establishment.photoUrl ?? ""}`}
      establishment={{
        id: establishment.id,
        name: establishment.name,
        photoUrl: establishment.photoUrl,
      }}
    />
  );
}
