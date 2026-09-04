import { UsersRound } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/contexts/shared/interfaces/components/ui/empty";

import { useSchedulingTranslations } from "../../i18n";

export function NoEmployeesEmptyState() {
  const { t } = useSchedulingTranslations();

  return (
    <Empty className="min-h-[400px] rounded-xl border-border/70 bg-muted/10 p-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UsersRound aria-hidden="true" />
        </EmptyMedia>
        <EmptyContent>
          <EmptyTitle>{t.calendar.noEmployeesTitle}</EmptyTitle>
          <EmptyDescription>
            {t.calendar.noEmployeesDescription}
          </EmptyDescription>
        </EmptyContent>
      </EmptyHeader>
    </Empty>
  );
}
