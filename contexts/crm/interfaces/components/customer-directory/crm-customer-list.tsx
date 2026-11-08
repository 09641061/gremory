"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
import type { CustomerResponse } from "@/contexts/crm/application/models/customer";
import { useCrmTranslations } from "@/contexts/crm/interfaces/i18n";
import { Avatar, AvatarFallback } from "@/contexts/shared/interfaces/components/ui/avatar";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Card } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { ScrollArea } from "@/contexts/shared/interfaces/components/ui/scroll-area";

export interface CrmCustomerListProps {
  customers: CustomerResponse[];
  selectedCustomerId?: string | null;
  onSelectCustomer: (customer: CustomerResponse) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  canCreateCustomer?: boolean;
}

export function CrmCustomerList({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  searchTerm,
  onSearchChange,
  canCreateCustomer = true,
}: CrmCustomerListProps) {
  const t = useCrmTranslations();

  const initials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  };

  return (
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
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90 h-8 shrink-0 shadow-xs"
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
          <div className="p-8 text-center space-y-3">
            <div className="mx-auto size-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
              <Users className="size-5" />
            </div>
            <p className="text-sm text-muted-foreground">{t.directory.noCustomersTitle}</p>
            {canCreateCustomer && (
              <Link
                href="/crm/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>{t.directory.addCustomer}</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {customers.map((c) => {
              const isSelected = selectedCustomerId === c.id;
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
                      {c.documentType ? (
                        <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0">
                          {c.documentType}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                          Sin doc
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">{c.documentNumber || "Sin documento"}</span>
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
  );
}
