"use client";

import { useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useAssistantConversationSidebarUI() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sectionRef = useRef<HTMLElement | null>(null);
  const activeConversationId = pathname.startsWith("/chat")
    ? searchParams.get("conversationId")
    : null;
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const isOpen = manualOpen ?? pathname.startsWith("/chat");

  function toggleOpen() {
    setManualOpen((current) => {
      const nextValue = current ?? pathname.startsWith("/chat");
      return !nextValue;
    });
  }

  return {
    activeConversationId,
    isOpen,
    manualOpen,
    sectionRef,
    toggleOpen,
  };
}
