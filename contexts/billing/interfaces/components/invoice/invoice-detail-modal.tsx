"use client";

import React, { useEffect, useState } from "react";
import { Loader2, FileDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/contexts/shared/interfaces/components/ui/dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import type { InvoiceResponse } from "../../../infrastructure/gateways/billing-api.gateway";
import { useBillingI18n } from "@/contexts/billing/interfaces/i18n";

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string | null;
}

export function InvoiceDetailModal({ isOpen, onClose, invoiceId }: InvoiceDetailModalProps) {
  const { t, locale } = useBillingI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);

  useEffect(() => {
    if (!isOpen || !invoiceId) {
      return;
    }

    let active = true;

    async function fetchInvoiceDetails() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/billing/invoices/${invoiceId}`);
        if (!response.ok) {
          throw new Error(t.invoices.loadError);
        }
        const data = (await response.json()) as InvoiceResponse;
        if (active) {
          setInvoice(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : t.invoices.genericError);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchInvoiceDetails();

    return () => {
      active = false;
      setInvoice(null);
      setError(null);
    };
  }, [isOpen, invoiceId, t.invoices.loadError, t.invoices.genericError]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {invoice
              ? t.invoices.modalTitle.replace("{number}", invoice.invoiceNumber)
              : t.invoices.modalDefaultTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            {t.invoices.modalDescription}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="py-6 text-center text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        {!loading && !error && invoice && (
          <div className="space-y-4 my-4">
            <div className="grid grid-cols-2 gap-y-3 text-sm py-2">
              <span className="text-muted-foreground font-medium">{t.invoices.invoiceNumber}</span>
              <span className="text-foreground text-right font-semibold">{invoice.invoiceNumber}</span>

              <span className="text-muted-foreground font-medium">{t.invoices.issueDate}</span>
              <span className="text-foreground text-right">
                {new Date(invoice.issueDate).toLocaleDateString(locale === "es" ? "es-ES" : "en-US")}
              </span>

              {invoice.paidDate && (
                <>
                  <span className="text-muted-foreground font-medium">{t.invoices.paymentDate}</span>
                  <span className="text-foreground text-right">
                    {new Date(invoice.paidDate).toLocaleDateString(locale === "es" ? "es-ES" : "en-US")}
                  </span>
                </>
              )}

              <span className="text-muted-foreground font-medium">{t.invoices.status}</span>
              <span className="text-right">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    invoice.status === "PAID"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  }`}
                >
                  {invoice.status === "PAID" ? t.invoices.statusPaid : t.invoices.statusPending}
                </span>
              </span>

              <span className="text-muted-foreground font-medium">{t.invoices.totalAmount}</span>
              <span className="text-foreground text-right font-bold text-base">
                {invoice.amount.toLocaleString(locale === "es" ? "es-PE" : "en-US", {
                  style: "currency",
                  currency: invoice.currency || "USD",
                })}
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-border/60">
              {invoice.pdfUrl && (
                <Button
                  render={<a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" />}
                  nativeButton={false}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 text-xs"
                >
                  <FileDown className="size-4" />
                  {t.invoices.downloadPdf}
                </Button>
              )}
              {invoice.receiptUrl && (
                <Button
                  render={<a href={invoice.receiptUrl} target="_blank" rel="noopener noreferrer" />}
                  nativeButton={false}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 text-xs"
                >
                  <FileDown className="size-4" />
                  {t.invoices.downloadReceipt}
                </Button>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="min-w-24">
            {t.invoices.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
