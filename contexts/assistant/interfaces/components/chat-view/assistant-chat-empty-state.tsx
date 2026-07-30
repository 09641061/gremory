"use client";

interface AssistantChatEmptyStateProps {
  title?: string;
  subtitle?: string;
}

export function AssistantChatEmptyState({
  title = "What do you want to manage today?",
  subtitle,
}: AssistantChatEmptyStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 text-center sm:gap-6 sm:py-8">
      <h1 className="text-balance text-[1.85rem] font-medium tracking-tight text-foreground sm:text-[2.8rem]">
        {title}
      </h1>
      {subtitle ? <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p> : null}
    </div>
  );
}
