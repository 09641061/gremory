import { PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { NoAccessCard } from "@/contexts/shared/interfaces/components/no-access-card";

export default function NoAccessPage() {
  return (
    <PageShell className="min-h-svh max-w-none justify-center">
      <main className="mx-auto w-full max-w-lg">
        <NoAccessCard />
      </main>
    </PageShell>
  );
}