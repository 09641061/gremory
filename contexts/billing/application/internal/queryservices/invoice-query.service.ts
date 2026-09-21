import type {
  BillingInvoicePage,
  BillingInvoiceReader,
  BillingRequestContext,
} from "../../ports/billing-readers-writers";

export class InvoiceQueryService {
  constructor(private readonly reader: BillingInvoiceReader) {}

  getInvoices(accessToken: string, page = 0, size = 20, context?: BillingRequestContext): Promise<BillingInvoicePage> {
    return this.reader.getInvoices(accessToken, page, size, context);
  }

  getInvoiceById(accessToken: string, invoiceId: string, context?: BillingRequestContext) {
    return this.reader.getInvoiceById(accessToken, invoiceId, context);
  }
}
