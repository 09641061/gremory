import { EditServiceForm } from "@/contexts/catalog/interfaces/components/edit-service-form";

export const revalidate = 0;

interface EditCatalogServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCatalogServicePage({ params }: EditCatalogServicePageProps) {
  const { id } = await params;

  const mockCategories = [
    { id: "c9d8e7f6-5a4b-3c2d-1e0f-9a8b7c6d5e4f", name: "Barbería & Capilar" },
    { id: "c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f", name: "Tratamientos Faciales" },
  ];

  const mockService = {
    id,
    name: "Corte de Cabello Ejecutivo",
    description: "Incluye lavado, asesoría de imagen y peinado con cera mate.",
    price: 45.0,
    durationMinutes: 30,
    preparationMinutes: 5,
    cleanupMinutes: 5,
    preServiceInstructions: "Llegar 5 minutos antes.",
    postServiceRecommendations: "Usar champú libre de sulfatos.",
    status: "ACTIVE" as const,
  };

  return <EditServiceForm service={mockService} categories={mockCategories} />;
}
