"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, User } from "lucide-react";
import type {
  WhatsappConversationDetail,
  WhatsappConversationSummary,
} from "@/contexts/chat/application/models/whatsapp-chat";
import { useChatTranslations } from "@/contexts/chat/interfaces/i18n";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/contexts/shared/interfaces/components/ui/card";

export interface ChatCustomerQuickProfileProps {
  customer?: WhatsappConversationDetail["customer"];
  selectedConv?: WhatsappConversationSummary;
  onOpenCustomerDetail?: (customerId: string) => void;
}

export function ChatCustomerQuickProfile({
  customer,
  selectedConv,
  onOpenCustomerDetail,
}: ChatCustomerQuickProfileProps) {
  const t = useChatTranslations();

  return (
    <div className="hidden lg:flex col-span-3 flex-col h-full min-h-0 overflow-y-auto bg-card/20 p-4 space-y-4">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          {t.chat.quickCrmTitle}
        </h4>

        {customer ? (
          <Card className="border-border/80 bg-background/50 shadow-none">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-semibold flex items-center justify-between">
                <span>{customer.name}</span>
                {customer.documentType && (
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {customer.documentType}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 text-xs space-y-2">
              {customer.documentNumber && (
                <div className="text-muted-foreground">
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground/70">
                    Documento
                  </span>
                  <span className="font-mono text-foreground">{customer.documentNumber}</span>
                </div>
              )}
              {(customer.phone || customer.phoneNumber) && (
                <div className="text-muted-foreground">
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground/70">
                    Teléfono
                  </span>
                  <span className="font-mono text-foreground">{customer.phone || customer.phoneNumber}</span>
                </div>
              )}
              {customer.email && (
                <div className="text-muted-foreground">
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground/70">
                    Email
                  </span>
                  <span className="text-foreground truncate block">{customer.email}</span>
                </div>
              )}
              {customer.notes && (
                <div className="text-muted-foreground">
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground/70">
                    Notas
                  </span>
                  <p className="text-foreground text-[11px] leading-relaxed italic line-clamp-3">{customer.notes}</p>
                </div>
              )}
              {onOpenCustomerDetail && (
                <Button
                  variant="outline"
                  size="xs"
                  className="w-full mt-2 text-xs"
                  onClick={() => onOpenCustomerDetail(customer.id)}
                >
                  Ver Ficha Completa
                </Button>
              )}
            </CardContent>
          </Card>
        ) : selectedConv ? (
          <Card className="border-border/80 bg-background/50 shadow-none p-3 space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground" />
                {t.chat.prospectTitle}
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t.chat.prospectDescription}
              </p>
            </div>

            <div className="p-2.5 rounded-md bg-muted/40 space-y-1 text-xs">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                Teléfono detectado
              </span>
              <p className="font-mono font-medium text-foreground">{selectedConv.contactPhone}</p>
            </div>

            <Link
              href={`/crm/new?phone=${encodeURIComponent(selectedConv.contactPhone)}&name=${encodeURIComponent(
                selectedConv.contactDisplayName || "",
              )}`}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-3.5" />
              {t.chat.registerCustomer}
            </Link>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
