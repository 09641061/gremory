import Link from "next/link";
import { Plus, Store } from "lucide-react";
import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardAction,
  CardHeader,
  CardTitle,
} from "@/contexts/shared/interfaces/components/ui/card";
import { EstablishmentCardMenu } from "./establishment-card-menu";

export type EstablishmentListItem = {
  id: string;
  name: string;
  photoUrl: string | null;
};

export function EstablishmentsPage({
  establishments,
}: {
  establishments: EstablishmentListItem[];
}) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="page-title">Establishments</h1>
          <p className="page-description mt-2">
            Manage the places where your business operates.
          </p>
        </div>
        <Link
          href="/establishments/new"
          className={buttonVariants({ className: "gap-2 self-start sm:self-auto" })}
        >
          <Plus className="size-4" />
          New establishment
        </Link>
      </div>

      {establishments.length === 0 ? (
        <Card className="border-dashed bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Store className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No establishments yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first establishment to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {establishments.map((establishment) => (
            <Card
              key={establishment.id}
              className="overflow-visible transition-colors hover:ring-foreground/20"
            >
              <div className="flex h-36 items-center justify-center overflow-hidden rounded-t-xl bg-muted/50">
                {establishment.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={establishment.photoUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <Store className="size-12 text-muted-foreground/50" />
                )}
              </div>
              <CardHeader>
                <CardTitle>{establishment.name}</CardTitle>
                <CardDescription>Active establishment</CardDescription>
                <CardAction>
                  <EstablishmentCardMenu
                    establishmentId={establishment.id}
                    establishmentName={establishment.name}
                  />
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
