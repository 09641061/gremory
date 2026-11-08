import type { LandingOwner } from "@/contexts/landing/interfaces/i18n";
import { AgendaBoardMockup } from "./agenda-board-mockup";
import { PendingRemindersMockup } from "./pending-reminders-mockup";
import { WeeklySummaryCard } from "./weekly-summary-card";

export function OwnerSection({ owner }: { owner: LandingOwner }) {
  return (
    <section id="funciones" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="max-w-md space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
              {owner.agenda.eyebrow}
            </p>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
              {owner.agenda.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {owner.agenda.description}
            </p>
          </div>
          <AgendaBoardMockup />
        </div>

        <div className="grid items-center gap-10 border-t border-border/40 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <PendingRemindersMockup reminders={owner.reminders} />
          <div className="max-w-md space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
              {owner.reminders.eyebrow}
            </p>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
              {owner.reminders.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {owner.reminders.description}
            </p>
          </div>
        </div>

        <div className="grid items-center gap-10 border-t border-border/40 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="max-w-md space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
              {owner.reports.eyebrow}
            </p>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
              {owner.reports.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {owner.reports.description}
            </p>
          </div>
          <WeeklySummaryCard reports={owner.reports} />
        </div>
      </div>
    </section>
  );
}
