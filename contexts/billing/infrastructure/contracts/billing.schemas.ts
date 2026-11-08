import { z } from "zod";

import type { PageResponse } from "@/contexts/shared/application/model/page-response";

/** Provider response contracts owned by Infrastructure. */
export const subscriptionResponseSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  planId: z.number().int(),
  billingCycle: z.string().min(1),
  status: z.string().min(1),
  currentPeriodStart: z.string().optional(),
  currentPeriodEnd: z.string().optional(),
  failedAttemptsCount: z.number().int().optional(),
  active: z.boolean().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  clientSecret: z.string().nullable().optional(),
  stripePublicKey: z.string().nullable().optional(),
  pendingPlanId: z.number().int().nullable().optional(),
  pendingBillingCycle: z.string().nullable().optional(),
});

export const billingPlanResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  maxEstablishments: z.number().int(),
  monthlyPriceAmount: z.number(),
  annualPriceAmount: z.number(),
  currency: z.string(),
  active: z.boolean(),
});

export const invoiceResponseSchema = z.object({
  id: z.string().min(1),
  subscriptionId: z.string().min(1),
  ownerId: z.string().min(1),
  invoiceNumber: z.string().min(1),
  amount: z.number(),
  currency: z.string().min(1),
  status: z.string().min(1),
  pdfUrl: z.string().url().nullable().optional(),
  receiptUrl: z.string().url().nullable().optional(),
  issueDate: z.string().min(1),
  paidDate: z.string().nullable().optional(),
});

export const invoicePageResponseSchema = z.object({
  content: z.array(invoiceResponseSchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type SubscriptionResponse = z.infer<typeof subscriptionResponseSchema>;
export type BillingPlanResponse = z.infer<typeof billingPlanResponseSchema>;
export type InvoiceResponse = z.infer<typeof invoiceResponseSchema>;
export type InvoicePageResponse = z.infer<typeof invoicePageResponseSchema>;

// Keep the application-facing shape explicit without allowing the transport
// schema to leak through Application imports.
export type BillingInvoicePage = PageResponse<InvoiceResponse>;
