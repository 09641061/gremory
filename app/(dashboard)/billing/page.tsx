import React from "react";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing Management</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tu plan de suscripción, método de pago e historial de facturación.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-lg font-semibold mb-2">Página de Facturación (Billing)</h2>
        <p className="text-muted-foreground text-sm">
          La barra lateral (Sidebar) ya está conectada y activa.
        </p>
      </div>
    </div>
  );
}
