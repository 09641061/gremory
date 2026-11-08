"use client";

import Link from "next/link";

import { PencilLine, Trash2 } from "lucide-react";

import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { EntityActionsMenu } from "@/contexts/shared/interfaces/components/actions/entity-actions-menu";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { useAssistantTranslations } from "@/contexts/assistant/interfaces/i18n";
import { cn } from "@/lib/utils";

type AssistantConversationListItemProps = {
  conversation: AssistantConversationSummaryReadModel;
  active: boolean;
  isMutating: boolean;
  establishmentId: string | null;
  onRename: (conversation: AssistantConversationSummaryReadModel) => void;
  onDelete: (conversation: AssistantConversationSummaryReadModel) => void;
};

export function AssistantConversationListItem({
  conversation,
  active,
  isMutating,
  establishmentId,
  onRename,
  onDelete,
}: AssistantConversationListItemProps) {
  const { t } = useAssistantTranslations();
  const conversationTitle = conversation.title ?? t.chat.newConversation;
  const href = establishmentId
    ? `/chat?conversationId=${encodeURIComponent(conversation.id)}&establishmentId=${encodeURIComponent(establishmentId)}`
    : `/chat?conversationId=${encodeURIComponent(conversation.id)}`;

  return (
    <li>
      <div className="relative flex items-center gap-1.5 rounded-2xl">
        <Link href={href} aria-current={active ? "page" : undefined} className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "h-(--app-sidebar-control-height) min-w-0 flex-1 justify-start gap-(--app-sidebar-control-gap) rounded-(--app-sidebar-item-radius) border border-transparent px-(--app-sidebar-control-padding-x) py-0 text-left text-sm font-medium",
            active &&
              "!border-accent/40 !bg-accent !text-accent-foreground hover:!border-accent/40 hover:!bg-accent hover:!text-accent-foreground",
          )}>
          <span className="truncate">{conversationTitle}</span>
        </Link>

        <EntityActionsMenu
          label={t.chat.optionsForConversation.replace("{title}", conversationTitle)}
          size="icon-sm"
          disabled={isMutating}
          triggerClassName="shrink-0 rounded-full text-muted-foreground"
          actions={[
            {
              label: t.chat.editName,
              icon: PencilLine,
              disabled: isMutating,
              onSelect: () => onRename(conversation),
            },
            {
              label: t.chat.delete,
              icon: Trash2,
              variant: "destructive",
              disabled: isMutating,
              onSelect: () => onDelete(conversation),
            },
          ]}
        />
      </div>
    </li>
  );
}
