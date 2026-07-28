import type { ReactNode } from "react";

import { ListConversationsQueryService } from "@/contexts/assistant/application/internal/queryservices/list-conversations-query.service";
import { Sidebar } from "@/contexts/shared/interfaces/components/sidebar";

/**
 * Main app layout wrapper rendering the responsive Sidebar and main content canvas.
 */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const assistantConversations = await new ListConversationsQueryService().handle({ page: 0, size: 20 });

  return (
    <>
      <Sidebar initialAssistantConversations={assistantConversations.content} />
      <main className="flex-1 p-6 pt-16 lg:ml-60">{children}</main>
    </>
  );
}
