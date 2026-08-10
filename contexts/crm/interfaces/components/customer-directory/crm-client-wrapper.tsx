"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { EntityActionsMenu } from "@/contexts/shared/interfaces/components/entity-actions-menu";
import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/delete-confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/contexts/shared/interfaces/components/ui/table";
import { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";
import { PageResponse } from "@/contexts/crm/application/services/crm-query.service";
import { deleteCustomerAction } from "@/contexts/crm/interfaces/actions/delete-customer.action";

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

  // Update search param in URL
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "0"); // Reset page on search
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

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Customers Directory</h1>
            <p className="text-sm text-muted-foreground">Manage and organize your client directory with real-time status tracking.</p>
          </div>
          {canCreateCustomer && (
            <Button onClick={() => router.push("/crm/new")} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Customer
            </Button>
          )}
        </header>

        {/* Filters and Searches */}
        <section className="flex flex-col md:flex-row gap-4 items-center bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, email, or document ID..."
              className="pl-9 w-full"
            />
          </div>
        </section>

        {/* Data Grid Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-6 py-4 font-semibold tracking-wider">Customer name</TableHead>
                  <TableHead className="px-6 py-4 font-semibold tracking-wider">Document id</TableHead>
                  <TableHead className="px-6 py-4 font-semibold tracking-wider">Type</TableHead>
                  <TableHead className="px-6 py-4 font-semibold tracking-wider">Email address</TableHead>
                  <TableHead className="px-6 py-4 font-semibold tracking-wider">Phone</TableHead>
                  {(canUpdateCustomer || canDeleteCustomer) && (
                    <TableHead className="px-6 py-4"></TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canUpdateCustomer || canDeleteCustomer ? 6 : 5} className="px-6 py-12 text-center text-muted-foreground">
                      No customers found in this establishment.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((cust) => (
                    <TableRow key={cust.id} className="group">
                      <TableCell className="px-6 py-4">
                        <span className="font-semibold text-foreground">{cust.name}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground">
                        {cust.documentNumber}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground">
                        {cust.documentType}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground">{cust.email}</TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground">
                        {cust.phoneCountryCode && cust.phoneNumber
                          ? `${cust.phoneCountryCode}${cust.phoneNumber}`
                          : cust.phone ?? "—"}
                      </TableCell>
                      {(canUpdateCustomer || canDeleteCustomer) && (
                        <TableCell className="px-6 py-4 text-right">
                          <EntityActionsMenu
                            label={`More actions for ${cust.name}`}
                            actions={[
                              {
                                label: "Edit Profile",
                                icon: Edit,
                                hidden: !canUpdateCustomer,
                                onSelect: () =>
                                  router.push(`/crm/${cust.id}/edit?establishmentId=${encodeURIComponent(cust.establishmentId)}`),
                              },
                              {
                                label: "Delete",
                                icon: Trash2,
                                variant: "destructive",
                                hidden: !canDeleteCustomer,
                                disabled: isDeleting === cust.id,
                                onSelect: () => setCustomerToDelete(cust),
                              },
                            ]}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
          </Table>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <footer className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Showing page <span className="font-semibold text-foreground">{currentPage + 1}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span> ({totalElements} total customers)
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </footer>
          )}
        </div>
      </main>

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
