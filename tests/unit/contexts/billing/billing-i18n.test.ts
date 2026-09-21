import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getBillingDictionary,
  useBillingI18n,
  useBillingTranslations,
} from "@/contexts/billing/interfaces/i18n";

describe("Billing i18n translations", () => {
  it("should have matching keys between en and es dictionaries", () => {
    function collectKeys(obj: Record<string, unknown>, prefix = ""): string[] {
      const keys: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === "object" && !Array.isArray(value)) {
          keys.push(...collectKeys(value as Record<string, unknown>, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys.sort();
    }

    expect(collectKeys(es)).toEqual(collectKeys(en));
  });

  it("should provide non-empty strings in both locales for all domains", () => {
    // Subscribe
    expect(en.subscribe.heroTitle).toBe("Choose the plan that fits you");
    expect(es.subscribe.heroTitle).toBe("Elige el plan que se adapte a ti");
    expect(en.subscribe.retryPayment).toBe("Retry payment");
    expect(es.subscribe.retryPayment).toBe("Reintentar pago");
    expect(en.subscribe.metadata.standardDescription).toBeTruthy();
    expect(es.subscribe.metadata.standardDescription).toBeTruthy();
    expect(en.subscribe.metadata.premiumDescription).toBeTruthy();
    expect(es.subscribe.metadata.premiumDescription).toBeTruthy();

    // Invoices and receipts
    expect(en.invoices.title).toBe("Invoices");
    expect(es.invoices.title).toBe("Facturas");
    expect(en.invoices.downloadPdf).toBe("Download PDF Invoice");
    expect(es.invoices.downloadPdf).toBe("Descargar factura en PDF");
    expect(en.invoices.downloadReceipt).toBe("Download Receipt");
    expect(es.invoices.downloadReceipt).toBe("Descargar recibo");
    expect(en.invoices.modalDefaultTitle).toBe("Invoice Details");
    expect(es.invoices.modalDefaultTitle).toBe("Detalles de la factura");
    expect(en.invoices.tableHeaders.date).toBe("Date");
    expect(es.invoices.tableHeaders.date).toBe("Fecha");

    // Checkout
    expect(en.checkout.title).toBe("Complete Subscription");
    expect(es.checkout.title).toBe("Completar suscripción");
    expect(en.checkout.cardDetails).toBe("Card Details");
    expect(es.checkout.cardDetails).toBe("Datos de la tarjeta");
    expect(en.checkout.paymentReceived).toBe("Payment received");
    expect(es.checkout.paymentReceived).toBe("Pago recibido");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getBillingDictionary("es")).toBe(es);
    expect(getBillingDictionary("en")).toBe(en);
    expect(getBillingDictionary(null)).toBe(en);
  });

  it("should export useBillingI18n equal to useBillingTranslations", () => {
    expect(useBillingI18n).toBe(useBillingTranslations);
    expect(typeof useBillingI18n).toBe("function");
  });
});
