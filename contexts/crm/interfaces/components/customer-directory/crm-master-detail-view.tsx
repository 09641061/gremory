"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Edit,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
} from "lucide-react";
import type { CustomerResponse, CustomerOverviewViewModel } from "@/contexts/crm/application/models/customer";
import { getCustomerOverviewAction } from "@/contexts/crm/interfaces/actions/get-customer-overview.action";
import { updateCustomerNotesAction } from "@/contexts/crm/interfaces/actions/update-customer-notes.action";
import { useCrmTranslations } from "@/contexts/crm/interfaces/i18n";
import { Avatar, AvatarFallback } from "@/contexts/shared/interfaces/components/ui/avatar";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { ScrollArea } from "@/contexts/shared/interfaces/components/ui/scroll-area";
import { Textarea } from "@/contexts/shared/interfaces/components/ui/textarea";

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

  const initials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)] min-h-[600px]">
      {/* Columna Izquierda: Lista de Clientes (4 cols) */}
      <Card className="lg:col-span-4 flex flex-col h-full overflow-hidden border">
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder={t.directory.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>
            {canCreateCustomer && (
              <Link
                href="/crm/new"
                className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90 h-8 shrink-0"
              >
                <Plus className="size-3.5 mr-1" />
                {t.directory.addCustomer}
              </Link>
            )}
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {t.directory.customersCount.replace("{count}", String(customers.length))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          {customers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t.directory.noCustomersTitle}
            </div>
          ) : (
            <div className="divide-y">
              {customers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCustomer(c)}
                    className={`w-full text-left p-3.5 transition-colors flex items-center gap-3 hover:bg-muted/50 ${
                      isSelected ? "bg-muted font-medium border-l-2 border-primary" : ""
                    }`}
                  >
                    <Avatar className="size-9 border text-xs">
                      <AvatarFallback>{initials(c.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-sm font-medium">{c.name}</span>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0">
                          {c.documentType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="font-mono">{c.documentNumber}</span>
                        {c.phone && <span>• {c.phone}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Columna Derecha: Detalle Completo Maestro-Detalle (8 cols) */}
      <Card className="lg:col-span-8 flex flex-col h-full overflow-hidden border">
        {selectedCustomer ? (
          <CustomerDetailCard
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

interface CustomerDetailCardProps {
  customer: CustomerResponse;
  establishmentId: string;
  onOpenWhatsapp: (customerId: string) => void;
  canUpdateCustomer: boolean;
}

function CustomerDetailCard({
  customer,
  establishmentId,
  onOpenWhatsapp,
  canUpdateCustomer,
}: CustomerDetailCardProps) {
  const t = useCrmTranslations();
  const [overview, setOverview] = React.useState<CustomerOverviewViewModel | null>(null);
  const [loadingOverview, setLoadingOverview] = React.useState(false);
  const [notes, setNotes] = React.useState(customer.notes ?? "");
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    getCustomerOverviewAction(customer.id, establishmentId).then((res) => {
      if (active) {
        setLoadingOverview(false);
        if (res.status === "success" && res.data) {
          setOverview(res.data);
          if (res.data.customer.notes !== undefined && res.data.customer.notes !== null) {
            setNotes(res.data.customer.notes);
          }
        }
      }
    }).catch(() => {
      if (active) setLoadingOverview(false);
    });

    return () => {
      active = false;
    };
  }, [customer.id, establishmentId]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesSavedSuccess(false);

    try {
      const res = await updateCustomerNotesAction(customer.id, establishmentId, notes);
      if (res.status === "success") {
        setNotesSavedSuccess(true);
        setTimeout(() => setNotesSavedSuccess(false), 3000);
      }
    } finally {
      setSavingNotes(false);
    }
  };

  const initials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return t.masterDetail.noAppointments;
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
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
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight">{customer.name}</h2>
                <Badge variant="secondary" className="text-xs">
                  {t.masterDetail.statusBadge}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 font-mono">
                <span>{customer.documentType}: {customer.documentNumber}</span>
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
                className="inline-flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 py-1.5 text-xs font-medium h-8"
              >
                <Edit className="size-3.5 mr-1.5" />
                {t.masterDetail.edit}
              </Link>
            )}
          </div>
        </div>

        {/* 3 Tarjetas de KPIs reales de citas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border bg-card/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Calendar className="size-4" />
              {t.masterDetail.kpiTotalAppointments}
            </div>
            <div className="text-2xl font-bold mt-2">
              {loadingOverview ? "-" : (overview?.appointments.totalAppointments ?? 0)}
            </div>
          </Card>

          <Card className="p-4 border bg-card/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Clock className="size-4" />
              {t.masterDetail.kpiLastOrNextVisit}
            </div>
            <div className="text-sm font-semibold mt-2 truncate">
              {loadingOverview ? "-" : formatDate(overview?.appointments.lastOrNextVisitAt)}
            </div>
          </Card>

          <Card className="p-4 border bg-card/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <AlertCircle className="size-4 text-amber-500" />
              {t.masterDetail.kpiNoShows}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold">
                {loadingOverview ? "-" : (overview?.appointments.noShowCount ?? 0)}
              </span>
              {(overview?.appointments.noShowCount ?? 0) > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-normal">
                  {t.masterDetail.noShowsAlert}
                </Badge>
              )}
            </div>
          </Card>
        </div>

        {/* Bloque: Datos del Cliente */}
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

        {/* Bloque: Notas y Preferencias (con guardado directo) */}
        <Card className="border">
          <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">{t.masterDetail.notesTitle}</CardTitle>
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="h-8 text-xs"
            >
              {savingNotes ? t.masterDetail.savingNotes : t.masterDetail.saveNotes}
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <Textarea
              placeholder={t.masterDetail.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={1000}
              className="text-sm resize-none"
            />
            {notesSavedSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <Check className="size-3.5" />
                {t.masterDetail.notesSaved}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bloque: Historial de Citas del Cliente */}
        <Card className="border">
          <CardHeader className="py-3 px-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-medium">{t.masterDetail.historyTitle}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(overview?.appointments.recentAppointments?.length ?? 0) === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                {t.masterDetail.noAppointmentsHistory}
              </div>
            ) : (
              <div className="divide-y text-sm">
                {overview?.appointments.recentAppointments.map((app) => (
                  <div key={app.id} className="p-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="font-medium text-sm">{app.serviceName}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(app.startsAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
