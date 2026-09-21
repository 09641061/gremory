import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/layout/page-shell";
import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";

export default async function PermissionsPage() {
  const dictionary = await getServerDictionary();

  return (
    <PageShell>
      <PageHeader title={dictionary.navigation.permissions} />
    </PageShell>
  );
}
