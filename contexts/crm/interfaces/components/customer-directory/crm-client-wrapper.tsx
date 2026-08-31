"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Plus,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";

import { deleteCustomerAction } from "@/contexts/crm/interfaces/actions/delete-customer.action";
import { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";
import { PageResponse } from "@/contexts/crm/application/services/crm-query.service";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { EntityActionsMenu } from "@/contexts/shared/interfaces/components/entity-actions-menu";
import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/delete-confirm-dialog";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/contexts/shared/interfaces/components/ui/empty";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/contexts/shared/interfaces/components/ui/table";

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
  canDeleteCustomer = true,
  loadError = false,
}: CrmClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(searchParams.get("search") || "");
  const [customerToDelete, setCustomerToDelete] = React.useState<CustomerResponse | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/crm?${params.toString()}`);
  };

  const handleRefresh = React.useTransition()[1];

  const handleDelete = async () => {
    if (!customerToDelete || !establishmentId) return;
    const id = customerToDelete.id;
    setIsDeleting(id);
    setErrorMsg(null);

    try {
      const res = await deleteCustomerAction(id, establishmentId);
      if (res.status === "success") {
        setCustomerToDelete(null);
        handleRefresh(() => {
          router.refresh();
        });
      } else {
        setErrorMsg(res.error || "Failed to delete customer.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while deleting.");
    } finally {
      setIsDeleting(null);
    }
  };

  const customers = initialCustomers.content;
  const currentPage = initialCustomers.pageable.pageNumber;
  const totalPages = initialCustomers.totalPages;
  const totalElements = initialCustomers.totalElements;

  return (
    <>
      <ErrorAlert
        title="Error loading customers"
        message={loadError ? "Failed to load the customer list. Please try refreshing the page." : undefined}
      />

      <PageShell>
        <PageHeader
          title="Customers"
          description="Manage and organize your client directory."
          actions={
            canCreateCustomer ? (
              <Button onClick={() => router.push(`/crm/new${establishmentId ? `?establishmentId=${encodeURIComponent(establishmentId)}` : ""}`)} className="gap-2">
                <Plus className="size-4" />
                Add customer
              </Button>
            ) : null
          }
        />

        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b border-border/70 bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block w-full max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name, email, or document ID"
                  className="pl-9"
                />
              </label>
              <div className="text-sm text-muted-foreground">
                {totalElements} {totalElements === 1 ? "customer" : "customers"}
              </div>
            </div>

            {customers.length === 0 ? (
              <Empty className="rounded-none border-0 py-16">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <UsersRound />
                  </EmptyMedia>
                  <EmptyContent>
                    <EmptyTitle>No customers found</EmptyTitle>
                    <EmptyDescription>
                      Try a different search or add the first customer to this establishment.
                    </EmptyDescription>
                  </EmptyContent>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer</TableHead>
                      <TableHead className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Document</TableHead>
                      <TableHead className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</TableHead>
                      <TableHead className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</TableHead>
                      <TableHead className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</TableHead>
                      {(canUpdateCustomer || canDeleteCustomer) ? (
                        <TableHead className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                      ) : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((cust) => (
                      <TableRow key={cust.id} className="hover:bg-muted/20">
                        <TableCell className="px-5 py-4">
                          <p className="truncate text-sm font-medium text-foreground">{cust.name}</p>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-muted-foreground">{cust.documentNumber}</TableCell>
                        <TableCell className="px-5 py-4">
                          <Badge variant="outline" className="rounded-full px-2.5 text-[0.7rem] uppercase tracking-wide">
                            {cust.documentType}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-muted-foreground">{cust.email}</TableCell>
                        <TableCell className="px-5 py-4 text-sm text-muted-foreground">
                          {cust.phoneCountryCode && cust.phoneNumber
                            ? `${cust.phoneCountryCode}${cust.phoneNumber}`
                            : cust.phone ?? "—"}
                        </TableCell>
                        {(canUpdateCustomer || canDeleteCustomer) ? (
                          <TableCell className="px-5 py-4 text-right">
                            <EntityActionsMenu
                              label={`More actions for ${cust.name}`}
                              actions={[
                                {
                                  label: "Edit profile",
                                  icon: Edit,
                                  hidden: !canUpdateCustomer,
                                  onSelect: () =>
                                    router.push(`/crm/${cust.id}/edit?establishmentId=${encodeURIComponent(cust.establishmentId)}`),
                                },
                                {
                                  label: isDeleting === cust.id ? "Deleting..." : "Delete",
                                  icon: Trash2,
                                  variant: "destructive",
                                  hidden: !canDeleteCustomer,
                                  disabled: isDeleting === cust.id,
                                  onSelect: () => setCustomerToDelete(cust),
                                },
                              ]}
                            />
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {totalPages > 1 ? (
              <footer className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-5 py-4">
                <div className="text-xs text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{currentPage + 1}</span> of{" "}
                  <span className="font-semibold text-foreground">{totalPages}</span> ({totalElements} total)
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon-sm" onClick={() => handlePageChange(0)} disabled={currentPage === 0} aria-label="First page">
                    <ChevronsLeft className="size-4" />
                  </Button>
                  <Button variant="outline" size="icon-sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} aria-label="Previous page">
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button variant="outline" size="icon-sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} aria-label="Next page">
                    <ChevronRight className="size-4" />
                  </Button>
                  <Button variant="outline" size="icon-sm" onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1} aria-label="Last page">
                    <ChevronsRight className="size-4" />
                  </Button>
                </div>
              </footer>
            ) : null}
          </CardContent>
        </Card>
      </PageShell>

      <DeleteConfirmDialog
        open={customerToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setCustomerToDelete(null);
        }}
        entityLabel="customer"
        entityName={customerToDelete?.name ?? ""}
        pending={isDeleting !== null}
        error={errorMsg}
        onConfirm={handleDelete}
      />
    </>
  );
}
