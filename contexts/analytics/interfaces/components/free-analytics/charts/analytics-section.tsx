import type { ReactNode } from "react";

import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/contexts/shared/interfaces/components/ui/empty";

export function AnalyticsSection({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="space-y-4 scroll-mt-8">
      {children}
    </section>
  );
}

export function FreeAnalyticsErrorState({ message }: { message: string }) {
  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-8 md:px-8">
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
        <CardContent className="space-y-4 p-6">
          <Empty className="border-border/70 bg-background/70">
            <EmptyHeader>
              <EmptyMedia variant="icon" />
              <EmptyContent>
                <EmptyTitle>Analytics unavailable</EmptyTitle>
                <EmptyDescription>{message}</EmptyDescription>
              </EmptyContent>
            </EmptyHeader>
          </Empty>
          <p className="text-sm text-muted-foreground">
            The dashboard contract is wired, but the backend response is still needed for a live snapshot.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
