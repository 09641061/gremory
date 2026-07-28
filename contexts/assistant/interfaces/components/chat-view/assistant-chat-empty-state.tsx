"use client";

interface AssistantChatEmptyStateProps {
  title?: string;
  subtitle?: string;
}

export function AssistantChatEmptyState({
  title = "What would you like to handle today?",
  subtitle = "Ask me about your business, customers, catalog, or schedule.",
}: AssistantChatEmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-3xl flex-col items-center gap-4 text-center">
        <h1 className="text-balance text-xl font-medium tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </div>
    </div>
  );
}
