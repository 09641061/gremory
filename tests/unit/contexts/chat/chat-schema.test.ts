import { describe, expect, it } from "vitest";
import {
  whatsappConversationDetailSchema,
  whatsappConversationPageResponseSchema,
  whatsappConversationSummarySchema,
  chatCustomerSummarySchema,
  whatsappMessageItemSchema,
} from "@/contexts/chat/infrastructure/contracts/chat.schemas";

describe("Chat Schemas Validation", () => {
  describe("chatCustomerSummarySchema", () => {
    it("parses customer summary with phone, notes and standard fields", () => {
      const raw = {
        id: "cust-101",
        name: "Carlos Sanchez",
        phone: "+51999111222",
        phoneNumber: "999111222",
        email: "carlos@example.com",
        documentType: "DNI",
        documentNumber: "70123456",
        notes: "Cliente VIP recurrente",
      };

      const parsed = chatCustomerSummarySchema.parse(raw);
      expect(parsed.id).toBe("cust-101");
      expect(parsed.name).toBe("Carlos Sanchez");
      expect(parsed.phone).toBe("+51999111222");
      expect(parsed.phoneNumber).toBe("999111222");
      expect(parsed.notes).toBe("Cliente VIP recurrente");
    });

    it("resiliently parses customer summary with null document fields", () => {
      const raw = {
        id: "cust-102",
        name: "Prospecto Sin DNI",
        phone: "+51988777666",
        documentType: null,
        documentNumber: null,
      };

      const parsed = chatCustomerSummarySchema.parse(raw);
      expect(parsed.documentType).toBeNull();
      expect(parsed.documentNumber).toBeNull();
      expect(parsed.name).toBe("Prospecto Sin DNI");
    });
  });

  describe("whatsappConversationSummarySchema", () => {
    it("parses conversation summary with all fields", () => {
      const raw = {
        id: "conv-1",
        customerId: "cust-1",
        customerName: "Maria Garcia",
        contactPhone: "+51987654321",
        contactDisplayName: "Maria",
        status: "BOT_ACTIVE",
        summaryTag: "IA Activa",
        unreadCount: 0,
        lastMessagePreview: "¿Cuáles son sus horarios?",
        lastMessageAt: "2026-10-27T10:00:00Z",
        customerServiceWindowOpen: true,
      };

      const parsed = whatsappConversationSummarySchema.parse(raw);
      expect(parsed.id).toBe("conv-1");
      expect(parsed.status).toBe("BOT_ACTIVE");
      expect(parsed.contactPhone).toBe("+51987654321");
      expect(parsed.customerServiceWindowOpen).toBe(true);
    });

    it("handles null lastMessageAt and missing defaults gracefully", () => {
      const raw = {
        id: "conv-empty",
        status: "BOT_ACTIVE",
        contactPhone: null,
        lastMessageAt: null,
      };

      const parsed = whatsappConversationSummarySchema.parse(raw);
      expect(parsed.id).toBe("conv-empty");
      expect(parsed.contactPhone).toBe("");
      expect(parsed.unreadCount).toBe(0);
      expect(parsed.customerServiceWindowOpen).toBe(false);
      expect(parsed.lastMessageAt).toBeNull();
    });
  });

  describe("whatsappMessageItemSchema", () => {
    it("parses message with mediaId and mimeType", () => {
      const raw = {
        id: "msg-10",
        conversationId: "conv-1",
        whatsappMessageId: "wamid-12345",
        direction: "INBOUND",
        messageType: "audio",
        content: "[Audio transcrito]: Hola buenas tardes",
        deliveryStatus: "DELIVERED",
        sentByUserId: null,
        createdAt: "2026-10-27T10:05:00Z",
        mediaId: "media-uuid-99",
        mimeType: "audio/ogg",
      };

      const parsed = whatsappMessageItemSchema.parse(raw);
      expect(parsed.messageType).toBe("audio");
      expect(parsed.mediaId).toBe("media-uuid-99");
      expect(parsed.mimeType).toBe("audio/ogg");
      expect(parsed.content).toContain("[Audio transcrito]");
    });
  });

  describe("whatsappConversationDetailSchema", () => {
    it("parses full backend response matching Spring Controller DTO", () => {
      const backendDto = {
        conversation: {
          id: "conv-1",
          customerId: "cust-1",
          customerName: "Maria Garcia",
          contactPhone: "+51987654321",
          contactDisplayName: "Maria G.",
          status: "BOT_ACTIVE",
          summaryTag: "IA Activa",
          unreadCount: 0,
          lastMessagePreview: "Respuesta del bot",
          lastMessageAt: "2026-10-27T12:00:00Z",
          customerServiceWindowOpen: true,
        },
        messages: [
          {
            id: "msg-1",
            conversationId: "conv-1",
            direction: "INBOUND",
            messageType: "text",
            content: "Hola, quiero información de precios",
            deliveryStatus: "READ",
            createdAt: "2026-10-27T11:59:00Z",
          },
          {
            id: "msg-2",
            conversationId: "conv-1",
            direction: "OUTBOUND_BOT",
            messageType: "text",
            content: "¡Hola! Con gusto te paso nuestra lista de servicios...",
            deliveryStatus: "DELIVERED",
            createdAt: "2026-10-27T12:00:00Z",
          },
        ],
        customer: {
          id: "cust-1",
          name: "Maria Garcia",
          phone: "+51987654321",
          documentType: "DNI",
          documentNumber: "45871234",
          notes: "Interesada en corte y peinado",
        },
      };

      const parsed = whatsappConversationDetailSchema.parse(backendDto);
      expect(parsed.conversation.id).toBe("conv-1");
      expect(parsed.messages.length).toBe(2);
      expect(parsed.customer?.phone).toBe("+51987654321");
      expect(parsed.customer?.notes).toBe("Interesada en corte y peinado");
    });

    it("parses message with OUTBOUND_BUSINESS_APP direction and PENDING delivery status", () => {
      const msg = {
        id: "msg-echo-1",
        conversationId: "conv-1",
        direction: "OUTBOUND_BUSINESS_APP",
        messageType: "text",
        content: "Echo desde WhatsApp Business móvil",
        deliveryStatus: "PENDING",
        createdAt: "2026-10-27T12:00:00Z",
      };

      const parsed = whatsappMessageItemSchema.parse(msg);
      expect(parsed.direction).toBe("OUTBOUND_BUSINESS_APP");
      expect(parsed.deliveryStatus).toBe("PENDING");
      expect(parsed.content).toBe("Echo desde WhatsApp Business móvil");
    });
  });

  describe("whatsappConversationPageResponseSchema", () => {
    it("parses Spring PageResponse format cleanly", () => {
      const pageResponse = {
        content: [
          {
            id: "conv-1",
            contactPhone: "+51987654321",
            status: "BOT_ACTIVE",
            unreadCount: 0,
            lastMessageAt: "2026-10-27T12:00:00Z",
            customerServiceWindowOpen: true,
          },
          {
            id: "conv-2",
            contactPhone: "+51911222333",
            status: "NEEDS_HUMAN",
            unreadCount: 3,
            lastMessageAt: "2026-10-27T12:15:00Z",
            customerServiceWindowOpen: true,
          },
        ],
        page: 0,
        size: 20,
        totalElements: 2,
        totalPages: 1,
      };

      const parsed = whatsappConversationPageResponseSchema.parse(pageResponse);
      expect(parsed.content.length).toBe(2);
      expect(parsed.page).toBe(0);
      expect(parsed.totalPages).toBe(1);
      expect(parsed.content[0]?.status).toBe("BOT_ACTIVE");
      expect(parsed.content[1]?.status).toBe("NEEDS_HUMAN");
    });
  });
});
