"use client";

import * as React from "react";
import Link from "next/link";
import { Edit, Mail, MessageSquare, Phone } from "lucide-react";
import type { CustomerResponse, CustomerOverviewViewModel } from "@/contexts/crm/application/models/customer";
import { getCustomerOverviewAction } from "@/contexts/crm/interfaces/actions/get-customer-overview.action";
import { useCrmTranslations } from "@/contexts/crm/interfaces/i18n";
import { Avatar, AvatarFallback } from "@/contexts/shared/interfaces/components/ui/avatar";
import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { ScrollArea } from "@/contexts/shared/interfaces/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CrmCustomerKpis } from "./crm-customer-kpis";
import { CrmCustomerNotesCard } from "./crm-customer-notes-card";
import { CrmCustomerHistoryCard } from "./crm-customer-history-card";

export interface CrmCustomerDetailViewProps {
  customer: CustomerResponse;
  establishmentId: string;
  onOpenWhatsapp: (customerId: string) => void;
  canUpdateCustomer: boolean;
}

export function CrmCustomerDetailView({
  customer,
  establishmentId,
  onOpenWhatsapp,
  canUpdateCustomer,
}: CrmCustomerDetailViewProps) {
  const t = useCrmTranslations();
  const [overview, setOverview] = React.useState<CustomerOverviewViewModel | null>(null);
  const [loadingOverview, setLoadingOverview] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    getCustomerOverviewAction(customer.id, establishmentId).then((res) => {
      if (active) {
        setLoadingOverview(false);
        if (res.status === "success" && res.data) {
          setOverview(res.data);
        }
      }
    }).catch(() => {
      if (active) setLoadingOverview(false);
    });

    return () => {
      active = false;
    };
  }, [customer.id, establishmentId]);

  const initials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Encabezado del Cliente */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-3.5">
            <Avatar className="size-12 border text-sm">
              <AvatarFallback>{initials(customer.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{customer.name}</h2>
              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 font-mono">
                <span>
                  {customer.documentType && customer.documentNumber
                    ? `${customer.documentType}: ${customer.documentNumber}`
                    : "Sin documento"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenWhatsapp(customer.id)}
            >
              <MessageSquare className="size-4 mr-1.5" />
              {t.masterDetail.openWhatsapp}
            </Button>
            {canUpdateCustomer && (
              <Link
                href={`/crm/${customer.id}/edit`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "aspect-square px-0 text-muted-foreground hover:text-foreground",
                )}
                title={t.masterDetail.edit}
                aria-label={t.masterDetail.edit}
              >
                <Edit className="size-4" />
              </Link>
            )}
          </div>
        </div>

        {/* 3 Tarjetas de KPIs reales de citas */}
        <CrmCustomerKpis overview={overview} loadingOverview={loadingOverview} />

        {/* Bloque: Datos de Contacto */}
        <Card className="border">
          <CardHeader className="py-3 px-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-medium">{t.masterDetail.contactDetails}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {t.directory.columns.phone}
              </div>
              <div className="font-mono">{customer.phone || "-"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="size-3.5" />
                {t.directory.columns.email}
              </div>
              <div className="truncate">{customer.email || "-"}</div>
            </div>
          </CardContent>
        </Card>

        {/* Bloque: Notas y Preferencias */}
        <CrmCustomerNotesCard
          customerId={customer.id}
          establishmentId={establishmentId}
          initialNotes={overview?.customer.notes ?? customer.notes}
        />

        {/* Bloque: Historial de Citas del Cliente */}
        <CrmCustomerHistoryCard overview={overview} />
      </div>
    </ScrollArea>
  );
}
