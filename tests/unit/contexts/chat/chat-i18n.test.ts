import { describe, expect, it } from "vitest";
import { getChatDictionary, en, es } from "@/contexts/chat/interfaces/i18n";

describe("Chat i18n", () => {
  it("provides dictionary for english and spanish", () => {
    const enDict = getChatDictionary("en");
    const esDict = getChatDictionary("es");

    expect(enDict.chat.inboxTitle).toBe("WhatsApp Conversations");
    expect(esDict.chat.inboxTitle).toBe("Conversaciones de WhatsApp");
    expect(enDict.chat.takeover).toBe("Take Over Conversation");
    expect(esDict.chat.takeover).toBe("Tomar Control de la Conversación");
  });

  it("exports en and es locale objects directly", () => {
    expect(en.chat.statusBotActive).toBe("AI Active");
    expect(es.chat.statusBotActive).toBe("IA Activa");
  });
});
