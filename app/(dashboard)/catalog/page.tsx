import { CatalogLayout } from "@/contexts/catalog/interfaces/components/catalog-layout";
import type { DetailedServiceDTO } from "@/contexts/catalog/interfaces/components/service-detail-view";
import type { CategoryDTO } from "@/contexts/catalog/interfaces/components/category-sidebar";

export const revalidate = 0;

export default async function CatalogPage() {
  // Demo mock data fallback when backend is offline
  const mockCategories: CategoryDTO[] = [
    { id: "c9d8e7f6-5a4b-3c2d-1e0f-9a8b7c6d5e4f", name: "Barbería & Capilar" },
    { id: "c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f", name: "Tratamientos Faciales" },
  ];

  const mockServices: DetailedServiceDTO[] = [
    {
      id: "a1b2c3d4-e5f6-7890-abcd-123456789012",
      name: "Corte de Cabello Ejecutivo",
      description: "Incluye lavado, asesoría de imagen y peinado con cera mate. Un servicio integral diseñado para el profesional moderno.",
      price: 45.0,
      durationMinutes: 30,
      preparationMinutes: 5,
      cleanupMinutes: 5,
      preServiceInstructions: "Llegar 5 minutos antes con el cabello seco.",
      postServiceRecommendations: "Usar champú libre de sulfatos.",
      status: "ACTIVE",
    },
    {
      id: "b2c3d4e5-f6a7-8901-bcde-234567890123",
      name: "Corte Premium & Barba Express",
      description: "Servicio completo de corte premium con ritual de toalla caliente y perfilado de barba.",
      price: 65.0,
      durationMinutes: 45,
      preparationMinutes: 10,
      cleanupMinutes: 5,
      preServiceInstructions: "Avisar sobre alergias a productos cosmeticos.",
      postServiceRecommendations: "Hidratar piel diariamente.",
      status: "ACTIVE",
    },
  ];

  return <CatalogLayout categories={mockCategories} services={mockServices} />;
}
