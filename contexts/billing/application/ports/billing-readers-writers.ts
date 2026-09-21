import type { CreateSubscriptionCommand } from "../../domain/model/commands/create-subscription.command";
import type { CurrencyCode } from "../../domain/model/value-objects/currency";

export type BillingRequestContext = Readonly<{
  tenantId: string;
  correlationId: string;
}>;

export type BillingSubscriptionReadModel = Readonly<{
  id: string;
  ownerId: string;
  planId: number;
  billingCycle: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  failedAttemptsCount?: number;
  active?: boolean;
  cancelAtPeriodEnd?: boolean;
  clientSecret?: string | null;
  stripePublicKey?: string | null;
  pendingPlanId?: number | null;
  pendingBillingCycle?: string | null;
}>;

export type BillingPlanReadModel = Readonly<{
  id: number;
  name: string;
  maxEstablishments: number;
  monthlyPriceAmount: number;
  annualPriceAmount: number;
  currency: string;
  active: boolean;
}>;

export type BillingInvoiceReadModel = Readonly<{
  id: string;
  subscriptionId: string;
  ownerId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl?: string | null;
  receiptUrl?: string | null;
  issueDate: string;
  paidDate?: string | null;
}>;

export type BillingInvoicePage = Readonly<{
  content: BillingInvoiceReadModel[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}>;

export type BillingRenewSubscriptionRequest = Readonly<{
  newPlanId?: number;
  newBillingCycle?: string;
}>;

export interface BillingSubscriptionReader {
  getCurrentSubscription(accessToken: string, context?: BillingRequestContext): Promise<BillingSubscriptionReadModel>;
}

export interface BillingSubscriptionWriter {
  createSubscription(accessToken: string, command: CreateSubscriptionCommand, context?: BillingRequestContext): Promise<BillingSubscriptionReadModel>;
  renewSubscription(accessToken: string, request: BillingRenewSubscriptionRequest, context?: BillingRequestContext): Promise<BillingSubscriptionReadModel>;
  cancelSubscription(accessToken: string, context?: BillingRequestContext): Promise<BillingSubscriptionReadModel>;
}

export interface BillingPlanReader {
  getPlans(currency?: CurrencyCode): Promise<BillingPlanReadModel[]>;
}

export interface BillingInvoiceReader {
  getInvoices(accessToken: string, page?: number, size?: number, context?: BillingRequestContext): Promise<BillingInvoicePage>;
  getInvoiceById(accessToken: string, invoiceId: string, context?: BillingRequestContext): Promise<BillingInvoiceReadModel>;
}
