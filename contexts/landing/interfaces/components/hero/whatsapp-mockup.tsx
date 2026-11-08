import type { LandingHero } from "@/contexts/landing/interfaces/i18n";

const TIME_SLOTS = ["10:00", "15:30", "17:00"] as const;

export function WhatsappMockup({
  chat,
}: {
  chat: LandingHero["chat"];
}) {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:ml-auto">
      <div className="rounded-2xl bg-muted/70 p-4 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            B
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">
              {chat.business}
            </p>
            <p className="text-xs text-muted-foreground">{chat.status}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl bg-primary/12 px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
            {chat.clientMessage}
          </p>

          <p className="w-fit max-w-[92%] rounded-2xl bg-card px-3.5 py-2.5 text-sm leading-relaxed text-foreground shadow-xs ring-1 ring-border/50">
            {chat.assistantMessage}
          </p>

          <div className="flex flex-wrap gap-2 pt-0.5">
            {TIME_SLOTS.map((slot) => (
              <span
                key={slot}
                className={`rounded-full border px-3 py-1 text-sm font-medium ${
                  slot === "15:30"
                    ? "border-primary/40 bg-primary/12 text-primary"
                    : "border-primary/25 text-primary"
                }`}
              >
                {slot}
              </span>
            ))}
          </div>

          <p className="ml-auto w-fit max-w-[60%] rounded-2xl bg-primary/12 px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
            {chat.userSelection}
          </p>

          <p className="w-fit max-w-[92%] rounded-2xl bg-card px-3.5 py-2.5 text-sm leading-relaxed text-foreground shadow-xs ring-1 ring-border/50">
            {chat.assistantConfirmation}
          </p>
        </div>
      </div>

      <div className="absolute -bottom-7 left-0 w-56 rounded-xl border border-border/60 bg-card p-3 shadow-lg sm:-left-6">
        <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          {chat.newBookingLabel}
        </p>
        <p className="mt-1.5 text-sm font-bold text-foreground">
          {chat.newBookingClient}
        </p>
        <p className="text-xs text-muted-foreground">{chat.newBookingDetail}</p>
      </div>
    </div>
  );
}
