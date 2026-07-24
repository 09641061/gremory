import { CreateServiceForm } from "@/contexts/catalog/interfaces/components/create-service-form";

export const revalidate = 0;

export default async function NewCatalogServicePage() {
  const mockCategories = [
    { id: "c9d8e7f6-5a4b-3c2d-1e0f-9a8b7c6d5e4f", name: "Barbería & Capilar" },
    { id: "c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f", name: "Tratamientos Faciales" },
  ];

  return <CreateServiceForm categories={mockCategories} />;
}
