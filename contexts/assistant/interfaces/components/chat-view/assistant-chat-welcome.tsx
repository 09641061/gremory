"use client";

import type { RefObject } from "react";
import Image from "next/image";

interface AssistantChatWelcomeProps {
  bottomRef: RefObject<HTMLDivElement | null>;
}

export function AssistantChatWelcome({ bottomRef }: AssistantChatWelcomeProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div className="flex items-end justify-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background">
          <Image
            src="/kodu_assistant_icon.svg"
            alt=""
            width={20}
            height={20}
            className="size-5 object-contain"
          />
        </div>
        <div className="max-w-[min(44rem,calc(100vw-7rem))] rounded-3xl rounded-bl-md border border-border/70 bg-card px-4 py-3 text-sm leading-6 text-card-foreground shadow-sm sm:max-w-[36rem]">
          Hola, soy tu asistente. Escribime lo que necesitas y empezamos.
        </div>
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
