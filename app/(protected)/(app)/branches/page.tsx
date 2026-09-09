"use client";

import { useI18n } from "@/contexts/shared/interfaces/i18n";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";

export default function BranchesPage() {
  const { t } = useI18n();

  return (
    <PageShell>
      <PageHeader title={t.navigation.branches} />
    </PageShell>
  );
}
