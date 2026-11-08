import type { LandingOwner } from "@/contexts/landing/interfaces/i18n";

const PENDING = [
  { client: "Jorge Salas", time: "10:00" },
  { client: "Camila Rojas", time: "11:30" },
  { client: "Luis Ramos", time: "14:00" },
];

/** Illustrative list: product decoration, not translatable content. */
export function PendingRemindersMockup({
  reminders,
}: {
  reminders: LandingOwner["reminders"];
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-bold text-foreground">{reminders.listTitle}</p>
        <p className="text-sm text-muted-foreground">{reminders.pendingCount}</p>
      </div>

      <ul className="mt-4">
        {PENDING.map((entry, index) => (
          <li
            key={entry.client}
            className={`flex items-center justify-between gap-3 py-2.5 ${
              index < PENDING.length - 1 ? "border-b border-border/60" : ""
            }`}
          >
            <span className="text-sm text-foreground">{entry.client}</span>
            <span className="text-sm text-muted-foreground">{entry.time}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
      >
        {reminders.resendAll}
      </button>
    </div>
  );
}
