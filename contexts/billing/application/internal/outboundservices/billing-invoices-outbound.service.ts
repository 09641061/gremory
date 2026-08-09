import "server-only";

import {
  BillingApiGateway,
  type InvoiceResponse,
  type PageResponse,
} from "../../../infrastructure/gateways/billing-api.gateway";

export class BillingInvoicesOutboundService {
  async getInvoices(
    accessToken: string,
    page = 0,
    size = 20,
  ): Promise<PageResponse<InvoiceResponse>> {
    return new BillingApiGateway().getInvoices(accessToken, page, size);
  }

  async getInvoiceById(accessToken: string, invoiceId: string): Promise<InvoiceResponse> {
    return new BillingApiGateway().getInvoiceById(accessToken, invoiceId);
  }
}

export function createBillingInvoicesOutboundService() {
  return new BillingInvoicesOutboundService();
}
