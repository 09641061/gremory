import "server-only";

import { ChatApiGateway } from "../../infrastructure/gateways/chat-api.gateway";
import type { ChatWhatsappPort } from "../../application/ports/chat-whatsapp.port";

export function createChatWhatsappService(organizationId?: string): ChatWhatsappPort {
  return new ChatApiGateway(organizationId);
}

export function createChatApiGateway(organizationId?: string): ChatApiGateway {
  return new ChatApiGateway(organizationId);
}
