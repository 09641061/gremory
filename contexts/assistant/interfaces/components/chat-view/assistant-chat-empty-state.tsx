"use client";

interface AssistantChatEmptyStateProps {
  title?: string;
  subtitle?: string;
}

export function AssistantChatEmptyState({
  title = "¿Cuál es el programa de hoy?",
  subtitle,
}: AssistantChatEmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-3xl flex-col items-center gap-3 text-center">
        <h1 className="text-balance text-[1.6rem] font-medium tracking-tight text-foreground sm:text-[2.1rem]">
          {title}
        </h1>
        {subtitle ? <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p> : null}
      </div>
    </div>
  );
}
