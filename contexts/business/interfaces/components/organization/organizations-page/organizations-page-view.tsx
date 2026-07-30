"use client";

import { useMemo, useState } from "react";
import { Building2, Search } from "lucide-react";
import type { OrganizationSummary } from "@/contexts/business/application/model/business.read-models";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";

export function OrganizationsPageView({
  organization,
}: {
  organization: OrganizationSummary;
}) {
  const [filter, setFilter] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const organizations = useMemo(() => [organization], [organization]);

  const filteredOrganizations = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) return organizations;
    return organizations.filter((org) =>
      org.name.toLowerCase().includes(normalized)
    );
  }, [filter, organizations]);

  const selectedOrg = organizations.find((org) => org.id === selectedOrgId) ?? null;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
      {/* Columna izquierda */}
      <div className="w-full space-y-6 lg:flex-1 lg:flex lg:flex-col lg:h-[calc(100vh-10rem)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between shrink-0">
          <div>
            <h1 className="page-title">Organizations</h1>
            <p className="page-description mt-2">
              Search, create, and manage the organizations available in your account.
            </p>
          </div>
        </div>

        {/* Buscador */}
        <div className="mx-auto flex w-full max-w-4xl flex-col items-stretch gap-3 sm:flex-row sm:items-center shrink-0">
          <label className="relative block w-full flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Search organizations"
              aria-label="Search organizations"
              className="pl-9"
            />
          </label>
        </div>

        {/* Card izquierda — lista seleccionable */}
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <CardContent className="p-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-border px-5 py-4 text-sm font-medium text-muted-foreground shrink-0">
              <span>Organizations — {organizations.length}</span>
            </div>

            <div className="scrollbar-hide lg:flex-1 lg:overflow-y-auto lg:min-h-0">
              {filteredOrganizations.length === 0 ? (
                <div className="px-5 py-10 text-sm text-muted-foreground">
                  No organizations found.
                </div>
              ) : (
                filteredOrganizations.map((org) => {
                  const selected = org.id === selectedOrgId;
                  return (
                    <div
                      key={org.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected}
                      onClick={() => setSelectedOrgId(org.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedOrgId(org.id);
                        }
                      }}
                      className={`flex cursor-pointer items-center gap-3 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40 ${
                        selected ? "bg-accent/60" : ""
                      }`}
                    >
                      <Avatar>
                        {org.imageUrl ? (
                          <AvatarImage src={org.imageUrl} alt={org.name} />
                        ) : (
                          <AvatarFallback>
                            <Building2 className="size-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <p className="truncate text-[15px] font-medium text-foreground">
                        {org.name}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card derecha — detalle o empty state */}
      {selectedOrg ? (
        <div className="hidden flex-1 lg:block">
          <Card className="rounded-xl border-border bg-card shadow-sm lg:ml-3 lg:h-[calc(100vh-10rem)] flex flex-col">
            <CardContent className="p-0 flex flex-col min-h-0 flex-1">
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <Avatar>
                  {selectedOrg.imageUrl ? (
                    <AvatarImage src={selectedOrg.imageUrl} alt={selectedOrg.name} />
                  ) : (
                    <AvatarFallback>
                      <Building2 className="size-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <p className="truncate text-[15px] font-medium text-foreground">
                  {selectedOrg.name}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="hidden flex-1 lg:block">
          <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm lg:ml-3">
            <div className="max-w-xs">
              <Building2 className="mx-auto size-10 text-muted-foreground/50" />
              <p className="mt-4 text-sm font-medium text-foreground">Select an organization</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose an organization to view its details.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
