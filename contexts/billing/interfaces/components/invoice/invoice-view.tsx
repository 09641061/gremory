"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FileDown, FileText } from "lucide-react";

import type { SubscriptionAccessSnapshot } from "../../../domain/services/subscription-access.policy";
import type { InvoiceResponse, PageResponse } from "../../../infrastructure/gateways/billing-api.gateway";
import { CancelSubscriptionModal } from "../cancel/cancel-subscription-modal";
import { InvoiceDetailModal } from "./invoice-detail-modal";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/contexts/shared/interfaces/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/contexts/shared/interfaces/components/ui/table";

interface InvoiceViewProps {
  currentSubscription: SubscriptionAccessSnapshot | null;
  initialInvoices: PageResponse<InvoiceResponse>;
}

export function InvoiceView({ currentSubscription, initialInvoices }: InvoiceViewProps) {
  const router = useRouter();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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

  React.useEffect(() => {
    // Force a dynamic fetch on client-side mount to bypass compilation components cache
    let active = true;
    setTimeout(() => {
      if (active) {
        fetchPage(0);
      }
    }, 0);
    return () => {
      active = false;
    };
  }, []);

  const currentPlanName =
    currentSubscription?.planId === 2 ? "Premium" : currentSubscription?.planId === 1 ? "Standard" : "Free";

  return (
    <PageShell>
      <PageHeader
        title="Invoices"
        description="Review your billing history and subscription status."
      />

      {currentSubscription && (currentSubscription.planId ?? 0) > 0 ? (
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full px-2.5 uppercase tracking-wide">
                    Current subscription
                  </Badge>
                  {currentSubscription.cancelAtPeriodEnd ? (
                    <Badge variant="destructive" className="rounded-full px-2.5 uppercase tracking-wide">
                      Cancellation scheduled
                    </Badge>
                  ) : null}
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Takodu {currentPlanName} Plan
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  {currentSubscription.cancelAtPeriodEnd
                    ? `Your subscription will end on ${
                        currentSubscription.currentPeriodEnd ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString() : "the scheduled date"
                      } and then downgrade to Free.`
                    : currentSubscription.currentPeriodEnd
                      ? `Your subscription renews on ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}.`
                      : "Your subscription is active."}
                </p>
              </div>

              {!currentSubscription.cancelAtPeriodEnd ? (
                <Button type="button" variant="destructive" onClick={() => setCancelModalOpen(true)}>
                  Cancel subscription
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Billing history</span>
            <span>{invoicesData.content.length} invoices</span>
          </div>

          {invoicesData.content.length === 0 ? (
            <Empty className="rounded-none border-0 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyContent>
                  <EmptyTitle>No invoices yet</EmptyTitle>
                  <EmptyDescription>Invoices will appear here once billing starts.</EmptyDescription>
                </EmptyContent>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-[32rem] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</TableHead>
                      <TableHead className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</TableHead>
                      <TableHead className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                      <TableHead className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesData.content.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-muted/20">
                        <TableCell className="px-5 py-4 text-sm text-foreground">
                          {new Date(invoice.issueDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm font-medium text-foreground">
                          {invoice.amount.toLocaleString(undefined, {
                            style: "currency",
                            currency: invoice.currency || "USD",
                          })}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm">
                          <Badge
                            variant={invoice.status === "PAID" ? "default" : "outline"}
                            className="rounded-full px-2.5 uppercase tracking-wide"
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoiceId(invoice.id);
                              setIsDetailOpen(true);
                            }}
                            className="gap-2"
                          >
                            <FileDown className="size-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {invoicesData.totalPages > 1 ? (
                <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-5 py-4">
                  <span className="text-xs text-muted-foreground">
                    Page {currentPage + 1} of {invoicesData.totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={currentPage === 0 || loading}
                      onClick={() => fetchPage(currentPage - 1)}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={currentPage >= invoicesData.totalPages - 1 || loading}
                      onClick={() => fetchPage(currentPage + 1)}
                      aria-label="Next page"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {currentSubscription ? (
        <CancelSubscriptionModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          planName={currentPlanName}
          onCancelled={() => {
            router.refresh();
          }}
        />
      ) : null}

      <InvoiceDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        invoiceId={selectedInvoiceId}
      />
    </PageShell>
  );
}
