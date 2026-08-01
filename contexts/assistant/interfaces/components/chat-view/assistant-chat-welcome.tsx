"use client";

import { AssistantAvatar } from "@/contexts/shared/interfaces/components/kodu/kodu-avatar";

export function AssistantChatWelcome() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div className="flex items-end justify-start gap-3">
        <AssistantAvatar className="size-12" iconSize={28} iconClassName="size-7" variant="flat" />
        <div className="max-w-[min(44rem,calc(100vw-7rem))] rounded-3xl rounded-bl-md border border-border/70 bg-card px-4 py-3 text-sm leading-6 text-card-foreground shadow-sm sm:max-w-[36rem]">
          Hola, soy tu asistente. Escribime lo que necesitas y empezamos.
        </div>
      </div>
    </div>
  );
}
