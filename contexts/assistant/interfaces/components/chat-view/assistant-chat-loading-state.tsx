"use client";

import { cn } from "@/lib/utils";

const loadingRows = [
  { align: "start", width: "w-[min(24rem,70vw)]", height: "h-5", avatar: true },
  { align: "end", width: "w-[min(7rem,18vw)]", height: "h-9", avatar: false },
  { align: "start", width: "w-[min(18rem,62vw)]", height: "h-5", avatar: true },
] as const;

export function AssistantChatLoadingState() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
      {loadingRows.map((row, index) => {
        return (
          <div
            key={index}
            className={cn("flex w-full items-start", row.align === "start" ? "justify-start" : "justify-end")}
          >
            {row.avatar ? (
              <div className="mr-3 size-10 shrink-0 animate-pulse rounded-full border border-border/30 bg-muted/20" />
            ) : null}

            <div
              className={cn("animate-pulse rounded-2xl bg-muted/20", row.height, row.width)}
            />
          </div>
        );
      })}
    </div>
  );
}
