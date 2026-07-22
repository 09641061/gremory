import React from "react";
import { Sidebar } from "@/contexts/shared/interfaces/components/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Componente de Navegación Lateral */}
      <Sidebar />

      {/* Contenido Principal con margen a la izquierda para escritorio */}
      <main className="flex-1 lg:ml-64 p-6 transition-all duration-200">
        {children}
      </main>
    </div>
  );
}
