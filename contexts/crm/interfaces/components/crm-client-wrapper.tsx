"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { CustomerResponse } from "../../domain/model/entities/customer";
import { PageResponse } from "../../application/services/crm-query.service";
import { deleteCustomerAction } from "../actions/delete-customer.action";
import { EditCustomerModal } from "./edit-customer-modal";

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
  const [editingCustomer, setEditingCustomer] = React.useState<CustomerResponse | null>(null);
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
      <ErrorAlert title="Error" message={errorMsg ?? undefined} />
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-foreground uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-4 font-semibold text-foreground uppercase tracking-wider">Document ID</th>
                  <th className="px-6 py-4 font-semibold text-foreground uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 font-semibold text-foreground uppercase tracking-wider">Phone</th>
                  {(canUpdateCustomer || canDeleteCustomer) && (
                    <th className="px-6 py-4 font-semibold text-foreground uppercase tracking-wider text-right"></th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={canUpdateCustomer || canDeleteCustomer ? 5 : 4} className="px-6 py-12 text-center text-muted-foreground">
                      No customers found in this establishment.
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">{cust.name}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {cust.documentNumber} ({cust.documentType})
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{cust.email}</td>
                      <td className="px-6 py-4 text-muted-foreground">{cust.phone}</td>
                      {(canUpdateCustomer || canDeleteCustomer) && (
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent>
                              {canUpdateCustomer && (
                                <DropdownMenuItem onClick={() => setEditingCustomer(cust)} className="gap-2 cursor-pointer">
                                  <Edit className="h-3 w-3" />
                                  Edit Profile
                                </DropdownMenuItem>
                              )}
                              {canDeleteCustomer && (
                                <DropdownMenuItem
                                  onClick={() => setCustomerToDelete(cust)}
                                  className="text-destructive gap-2 cursor-pointer hover:bg-destructive/10"
                                  disabled={isDeleting === cust.id}
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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

      {/* Editing Modal */}
      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          open={editingCustomer !== null}
          onOpenChange={(open) => {
            if (!open) setEditingCustomer(null);
          }}
          onSuccess={() => {
            setEditingCustomer(null);
            handleRefresh(() => {
              router.refresh();
            });
          }}
        />
      )}

      {/* Deletion Confirmation */}
      <AlertDialog
        open={customerToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setCustomerToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer{" "}
              <span className="font-semibold text-foreground">{customerToDelete?.name}</span> and remove their data from
              our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting !== null}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Customer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
