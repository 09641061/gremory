"use client";

import * as React from "react";
import type { CustomerResponse } from "@/contexts/crm/application/models/customer";
import { useCrmTranslations } from "@/contexts/crm/interfaces/i18n";
import { Card } from "@/contexts/shared/interfaces/components/ui/card";
import { CrmCustomerList } from "./crm-customer-list";
import { CrmCustomerDetailView } from "./crm-customer-detail-view";

export interface CrmMasterDetailViewProps {
  customers: CustomerResponse[];
  establishmentId: string;
  selectedCustomerId?: string | null;
  onSelectCustomer: (customer: CustomerResponse) => void;
  onOpenWhatsapp: (customerId: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  canCreateCustomer?: boolean;
  canUpdateCustomer?: boolean;
}

export function CrmMasterDetailView({
  customers,
  establishmentId,
  selectedCustomerId,
  onSelectCustomer,
  onOpenWhatsapp,
  searchTerm,
  onSearchChange,
  canCreateCustomer = true,
  canUpdateCustomer = true,
}: CrmMasterDetailViewProps) {
  const t = useCrmTranslations();

  const selectedCustomer = React.useMemo(() => {
    if (!selectedCustomerId) return customers[0] ?? null;
    return customers.find((c) => c.id === selectedCustomerId) ?? customers[0] ?? null;
  }, [customers, selectedCustomerId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)] min-h-[600px]">
      {/* Columna Izquierda: Lista de Clientes (4 cols) */}
      <CrmCustomerList
        customers={customers}
        selectedCustomerId={selectedCustomer?.id}
        onSelectCustomer={onSelectCustomer}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        canCreateCustomer={canCreateCustomer}
      />

      {/* Columna Derecha: Detalle Completo Maestro-Detalle (8 cols) */}
      <Card className="lg:col-span-8 flex flex-col h-full overflow-hidden border">
        {selectedCustomer ? (
          <CrmCustomerDetailView
            key={selectedCustomer.id}
            customer={selectedCustomer}
            establishmentId={establishmentId}
            onOpenWhatsapp={onOpenWhatsapp}
            canUpdateCustomer={canUpdateCustomer}
          />
        ) : (
          <div className="h-full flex items-center justify-center p-8 text-muted-foreground text-sm">
            {t.masterDetail.selectCustomerPrompt}
          </div>
        )}
      </Card>
    </div>
  );
}
