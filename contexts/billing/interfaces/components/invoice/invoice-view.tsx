"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { SubscriptionAccessSnapshot } from "../../../domain/services/subscription-access.policy";
import type { InvoiceResponse, PageResponse } from "../../../infrastructure/gateways/billing-api.gateway";
import { CancelSubscriptionModal } from "../cancel/cancel-subscription-modal";
import { InvoiceDetailModal } from "./invoice-detail-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/contexts/shared/interfaces/components/ui/table";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

interface InvoiceViewProps {
  currentSubscription: SubscriptionAccessSnapshot | null;
  initialInvoices: PageResponse<InvoiceResponse>;
}

export function InvoiceView({ currentSubscription, initialInvoices }: InvoiceViewProps) {
  const router = useRouter();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Pagination state
  const [invoicesData, setInvoicesData] = useState<PageResponse<InvoiceResponse>>(initialInvoices);
  const [currentPage, setCurrentPage] = useState(initialInvoices.pageable.pageNumber);
  const [loading, setLoading] = useState(false);

  const fetchPage = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/billing/invoices?page=${page}&size=20`);
      if (response.ok) {
        const data = await response.json();
        setInvoicesData(data);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching page:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentPlanName = currentSubscription?.planId === 2 ? "Premium" : currentSubscription?.planId === 1 ? "Standard" : "Free";

  const handleOpenDetail = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsDetailOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground">Manage your invoices and subscription status.</p>
      </header>

      {/* Seccón de Suscripción Actual movida desde Upgrade */}
      {currentSubscription && (currentSubscription.planId ?? 0) > 0 && (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Current Subscription</span>
              <h2 className="text-xl font-bold text-foreground mt-1 flex items-center gap-2">
                Takodu {currentPlanName} Plan
                {currentSubscription.cancelAtPeriodEnd && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Scheduled for Cancellation
                  </span>
                )}
              </h2>
              {currentSubscription.cancelAtPeriodEnd ? (
                currentSubscription.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Your subscription will end and downgrade to the Free plan on <span className="font-semibold text-foreground">{new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}</span>. You still have access to all premium features until then.
                  </p>
                )
              ) : (
                currentSubscription.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Your subscription will automatically renew on <span className="font-semibold text-foreground">{new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}</span>.
                  </p>
                )
              )}
            </div>

            {!currentSubscription.cancelAtPeriodEnd && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setCancelModalOpen(true)}
                className="sm:self-center px-4 py-2 text-sm font-semibold w-full sm:w-auto min-w-36 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Cancel subscription
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Historial de Facturas */}
      <section className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border/60">
          <h2 className="text-lg font-bold text-foreground">Billing History</h2>
          <p className="text-xs text-muted-foreground">View and download your past invoices.</p>
        </div>

        {invoicesData.content.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No invoices found.
          </div>
        ) : (
          <div>
            <div className="max-h-[320px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold py-3 px-5 text-xs text-muted-foreground uppercase tracking-wider">Date</TableHead>
                  <TableHead className="font-semibold py-3 px-5 text-xs text-muted-foreground uppercase tracking-wider">Total</TableHead>
                  <TableHead className="font-semibold py-3 px-5 text-xs text-muted-foreground uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-semibold py-3 px-5 text-xs text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {invoicesData.content.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-4 px-5 text-sm text-foreground">
                      {new Date(invoice.issueDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="py-4 px-5 text-sm text-foreground">
                      <div className="flex items-center gap-1.5 font-medium">
                        {invoice.amount.toLocaleString(undefined, {
                          style: "currency",
                          currency: invoice.currency || "USD",
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-5 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          invoice.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-5 text-sm text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetail(invoice.id)}
                        className="text-primary hover:text-primary-container font-semibold transition-colors"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {invoicesData.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-border/60 bg-muted/10">
              <span className="text-xs text-muted-foreground">
                Page {currentPage + 1} of {invoicesData.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={currentPage === 0 || loading}
                  onClick={() => fetchPage(currentPage - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={currentPage >= invoicesData.totalPages - 1 || loading}
                  onClick={() => fetchPage(currentPage + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
          </div>
        )}
      </section>

      {/* Modals */}
      {currentSubscription && (
        <CancelSubscriptionModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          planName={currentPlanName}
          onCancelled={() => {
            router.refresh();
          }}
        />
      )}

      <InvoiceDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        invoiceId={selectedInvoiceId}
      />
    </div>
  );
}
