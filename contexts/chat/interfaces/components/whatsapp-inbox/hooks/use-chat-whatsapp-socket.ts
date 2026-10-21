"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getWsAuthTicketAction } from "@/contexts/chat/interfaces/actions/whatsapp-conversations.action";
import type { WhatsappWsEvent } from "@/contexts/chat/application/models/whatsapp-chat";

export interface UseChatWhatsappSocketOptions {
  establishmentId: string;
  onEvent?: (event: WhatsappWsEvent) => void;
}

export function useChatWhatsappSocket({ establishmentId, onEvent }: UseChatWhatsappSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (!establishmentId) return;

    getWsAuthTicketAction().then(({ token, wsUrl }) => {
      if (!token) return;

      const url = `${wsUrl}/ws/chat/whatsapp?establishmentId=${encodeURIComponent(establishmentId)}&token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (messageEvent) => {
        try {
          const parsed = JSON.parse(messageEvent.data) as WhatsappWsEvent;
          onEventRef.current?.(parsed);
        } catch {
          // Ignore invalid JSON payloads
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Retry connection after delay
        reconnectTimeoutRef.current = setTimeout(() => {
          connectRef.current();
        }, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }).catch(() => {
      // In case server action fails, retry later
      reconnectTimeoutRef.current = setTimeout(() => {
        connectRef.current();
      }, 5000);
    });
  }, [establishmentId]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
  };
}
