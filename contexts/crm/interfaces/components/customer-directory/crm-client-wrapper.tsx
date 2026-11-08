"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Plus, Users } from "lucide-react";
import { CustomerResponse } from "@/contexts/crm/application/models/customer";
import { PageResponse } from "@/contexts/crm/application/services/crm-query.service";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/layout/page-shell";
import { useCrmTranslations } from "@/contexts/crm/interfaces/i18n";
import { CrmMasterDetailView } from "./crm-master-detail-view";
import { ChatWhatsappInboxView } from "@/contexts/chat/interfaces/components/whatsapp-inbox/chat-whatsapp-inbox-view";
import { openWhatsappForCustomerAction } from "@/contexts/chat/interfaces/actions/whatsapp-conversations.action";

interface CrmClientWrapperProps {
  initialCustomers: PageResponse<CustomerResponse>;
  establishmentId?: string;
  canCreateCustomer?: boolean;
  canUpdateCustomer?: boolean;
  canDeleteCustomer?: boolean;
  loadError?: boolean;
}

export function CrmClientWrapper({
  initialCustomers,
  establishmentId,
  canCreateCustomer = true,
  canUpdateCustomer = true,
  loadError = false,
}: CrmClientWrapperProps) {
  const t = useCrmTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = React.useState<"customers" | "whatsapp">(
    (searchParams.get("tab") as "customers" | "whatsapp") || "customers",
  );

  const [searchTerm, setSearchTerm] = React.useState(searchParams.get("search") || "");
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(
    initialCustomers.content[0]?.id ?? null,
  );
  const [activeWhatsappConversationId, setActiveWhatsappConversationId] = React.useState<string | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "0");
    router.push(`/crm?${params.toString()}`);
  };

  const handleOpenWhatsapp = async (customerId: string) => {
    if (!establishmentId) return;
    try {
      const res = await openWhatsappForCustomerAction(customerId, establishmentId);
      if (res.status === "success" && res.data) {
        setActiveWhatsappConversationId(res.data.id);
      }
    } catch {
      // Fallback
    }
    setActiveTab("whatsapp");
  };

  const handleOpenCustomerDetail = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setActiveTab("customers");
  };

  return (
    <>
      <ErrorAlert
        title={t.directory.errors.loadTitle}
        message={loadError ? t.directory.errors.loadMessage : undefined}
      />

      <PageShell>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <PageHeader
            title={activeTab === "customers" ? t.directory.title : t.tabs.whatsapp}
            description={activeTab === "customers" ? t.directory.description : "Supervisión del Asistente IA y atención humana por excepción"}
          />

          {/* Acciones y selector de vista superior */}
          <div className="flex items-center gap-2.5 shrink-0">
            {activeTab === "customers" && canCreateCustomer && (
              <Link
                href="/crm/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>{t.directory.addCustomer}</span>
              </Link>
            )}

            {/* Selector minimalista de vista superior (Sin emojis) */}
            <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("customers")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "customers"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="size-3.5" />
                <span>{t.tabs.customers}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("whatsapp")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "whatsapp"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="size-3.5" />
                <span>{t.tabs.whatsapp}</span>
              </button>
            </div>
          </div>
        </div>

        {activeTab === "customers" ? (
          <CrmMasterDetailView
            customers={initialCustomers.content}
            establishmentId={establishmentId || ""}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={(c) => setSelectedCustomerId(c.id)}
            onOpenWhatsapp={handleOpenWhatsapp}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            canCreateCustomer={canCreateCustomer}
            canUpdateCustomer={canUpdateCustomer}
          />
        ) : (
          <ChatWhatsappInboxView
            establishmentId={establishmentId || ""}
            initialConversationId={activeWhatsappConversationId}
            onOpenCustomerDetail={handleOpenCustomerDetail}
          />
        )}
      </PageShell>
    </>
  );
}
