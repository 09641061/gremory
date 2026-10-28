/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { ChatWhatsappInboxView } from "@/contexts/chat/interfaces/components/whatsapp-inbox/chat-whatsapp-inbox-view";
import type {
  WhatsappConversationSummary,
  WhatsappConversationDetail,
  WhatsappWsEvent,
} from "@/contexts/chat/application/models/whatsapp-chat";

const { mockConversations, mockDetail } = vi.hoisted(() => {
  const conversations: WhatsappConversationSummary[] = [
    {
      id: "conv-1",
      contactPhone: "+51987654321",
      contactDisplayName: "Maria",
      status: "NEEDS_HUMAN",
      summaryTag: "Te necesita",
      unreadCount: 1,
      lastMessagePreview: "Necesito ayuda urgente",
      lastMessageAt: new Date().toISOString(),
      customerServiceWindowOpen: true,
    },
    {
      id: "conv-2",
      contactPhone: "+51999888777",
      contactDisplayName: "Pedro",
      status: "BOT_ACTIVE",
      summaryTag: "IA Activa",
      unreadCount: 0,
      lastMessagePreview: "¿A qué hora abren?",
      lastMessageAt: new Date().toISOString(),
      customerServiceWindowOpen: true,
    },
  ];

  const detail: WhatsappConversationDetail = {
    conversation: conversations[0]!,
    messages: [
      {
        id: "msg-1",
        conversationId: "conv-1",
        direction: "INBOUND",
        messageType: "text",
        content: "Necesito ayuda urgente",
        deliveryStatus: "READ",
        createdAt: new Date().toISOString(),
      },
    ],
    customer: {
      id: "cust-1",
      documentType: "DNI",
      documentNumber: "46027897",
      name: "Maria Perez",
      phoneNumber: "987654321",
      email: "maria@example.com",
    },
  };

  return { mockConversations: conversations, mockDetail: detail };
});

let simulatedWsCallback: ((event: WhatsappWsEvent) => void) | null = null;

vi.mock("@/contexts/chat/interfaces/components/whatsapp-inbox/hooks/use-chat-whatsapp-socket", () => ({
  useChatWhatsappSocket: ({ onEvent }: { onEvent?: (event: WhatsappWsEvent) => void }) => {
    simulatedWsCallback = onEvent ?? null;
    return { isConnected: true };
  },
}));

vi.mock("@/contexts/chat/interfaces/actions/whatsapp-conversations.action", () => ({
  getWhatsappConversationsAction: vi.fn().mockImplementation((estId, filter) => {
    const list =
      filter === "NEEDS_ATTENTION"
        ? mockConversations.filter((c) => c.status === "NEEDS_HUMAN" || c.status === "HUMAN_TAKEN")
        : mockConversations;
    return Promise.resolve({
      status: "success",
      data: {
        content: list,
        page: 0,
        size: 20,
        totalElements: list.length,
        totalPages: 1,
      },
    });
  }),
  getWhatsappConversationDetailAction: vi.fn().mockImplementation((convId) => {
    const conv = mockConversations.find((c) => c.id === convId) || mockConversations[0]!;
    return Promise.resolve({
      status: "success",
      data: {
        ...mockDetail,
        conversation: conv,
        customer: conv.id === "conv-1" ? mockDetail.customer : null,
      },
    });
  }),
  takeoverWhatsappConversationAction: vi.fn().mockResolvedValue({
    status: "success",
    data: {
      ...mockConversations[0],
      status: "HUMAN_TAKEN",
    },
  }),
  releaseWhatsappConversationAction: vi.fn().mockResolvedValue({
    status: "success",
    data: {
      ...mockConversations[0],
      status: "BOT_ACTIVE",
    },
  }),
  sendWhatsappMessageAction: vi.fn().mockImplementation((convId, estId, text) => {
    return Promise.resolve({
      status: "success",
      data: {
        id: "msg-new-1",
        conversationId: convId,
        direction: "OUTBOUND_HUMAN",
        messageType: "text",
        content: text,
        deliveryStatus: "SENT",
        createdAt: new Date().toISOString(),
      },
    });
  }),
}));

describe("ChatWhatsappInboxView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults to 'ALL' filter and renders all conversations including AI bot", async () => {
    render(<ChatWhatsappInboxView establishmentId="est-1" />);

    // Both Maria (NEEDS_HUMAN) and Pedro (BOT_ACTIVE) are rendered immediately
    const mariaElements = await screen.findAllByText("Maria");
    expect(mariaElements.length).toBeGreaterThanOrEqual(1);

    const pedroElements = await screen.findAllByText("Pedro");
    expect(pedroElements.length).toBeGreaterThanOrEqual(1);
    const previews = await screen.findAllByText("Necesito ayuda urgente");
    expect(previews.length).toBeGreaterThanOrEqual(1);
  });

  it("filters conversations by 'Requieren Atención' tab and back to 'Todos / IA'", async () => {
    render(<ChatWhatsappInboxView establishmentId="est-1" />);

    await screen.findAllByText("Maria");
    await screen.findAllByText("Pedro");

    const needsAttentionButton = screen.getByRole("button", { name: /requieren atención|needs attention/i });
    fireEvent.click(needsAttentionButton);

    await waitFor(() => {
      expect(screen.queryByText("Pedro")).not.toBeInTheDocument();
      expect(screen.getAllByText("Maria").length).toBeGreaterThanOrEqual(1);
    });

    const allFilterButton = screen.getByRole("button", { name: /all \/ ai|todos \/ ia/i });
    fireEvent.click(allFilterButton);

    await waitFor(() => {
      expect(screen.getAllByText("Pedro").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("filters conversations client-side with search input", async () => {
    render(<ChatWhatsappInboxView establishmentId="est-1" />);

    await screen.findAllByText("Maria");
    await screen.findAllByText("Pedro");

    const searchInput = screen.getByPlaceholderText(/buscar teléfono o nombre/i);
    fireEvent.change(searchInput, { target: { value: "Pedro" } });

    await waitFor(() => {
      expect(screen.queryByText("Necesito ayuda urgente")).not.toBeInTheDocument();
      expect(screen.getAllByText("Pedro").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("handles taking over a conversation manually (Staff intervenes)", async () => {
    render(<ChatWhatsappInboxView establishmentId="est-1" initialConversationId="conv-1" />);

    await screen.findAllByText("Maria");

    const takeoverBtn = await screen.findByRole("button", { name: /take over|tomar control/i });
    fireEvent.click(takeoverBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /release to ai|liberar a la asistente/i })).toBeInTheDocument();
    });
  });

  it("sends manual staff message and adds it to the thread", async () => {
    render(<ChatWhatsappInboxView establishmentId="est-1" initialConversationId="conv-1" />);

    await screen.findAllByText("Maria");

    const input = screen.getByPlaceholderText(/type a reply|escribe una respuesta/i);
    fireEvent.change(input, { target: { value: "Hola, te ayudo con gusto." } });

    const sendBtn = screen.getByRole("button", { name: /send|enviar/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText("Hola, te ayudo con gusto.")).toBeInTheDocument();
    });
  });

  it("receives real-time incoming message via WebSocket and updates thread", async () => {
    render(<ChatWhatsappInboxView establishmentId="est-1" initialConversationId="conv-1" />);

    await screen.findAllByText("Maria");

    expect(simulatedWsCallback).not.toBeNull();

    // Trigger simulated inbound websocket event
    simulatedWsCallback!({
      type: "MESSAGE_RECEIVED",
      payload: {
        conversationId: "conv-1",
        conversationStatus: "NEEDS_HUMAN",
        unreadCount: 2,
        summaryTag: "Mensaje WS",
        message: {
          id: "msg-ws-99",
          conversationId: "conv-1",
          direction: "INBOUND",
          messageType: "text",
          content: "Nuevo mensaje entrante por WebSocket",
          deliveryStatus: "DELIVERED",
          createdAt: new Date().toISOString(),
        },
      },
      timestamp: new Date().toISOString(),
    });

    await waitFor(() => {
      const elements = screen.getAllByText("Nuevo mensaje entrante por WebSocket");
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("disables message input when bot is active until staff takes over", async () => {
    const botDetail: WhatsappConversationDetail = {
      conversation: mockConversations[1]!,
      messages: [
        {
          id: "msg-bot-1",
          conversationId: "conv-2",
          direction: "INBOUND",
          messageType: "text",
          content: "¿A qué hora abren?",
          deliveryStatus: "DELIVERED",
          createdAt: new Date().toISOString(),
        },
      ],
      customer: null,
    };

    const { getWhatsappConversationDetailAction } = await import(
      "@/contexts/chat/interfaces/actions/whatsapp-conversations.action"
    );
    vi.mocked(getWhatsappConversationDetailAction).mockResolvedValueOnce({
      status: "success",
      data: botDetail,
    });

    render(<ChatWhatsappInboxView establishmentId="est-1" initialConversationId="conv-2" />);

    await screen.findAllByText("Pedro");

    const input = await screen.findByPlaceholderText(/toma el control para responder manualmente|take over conversation/i);
    expect(input).toBeDisabled();
  });
});
