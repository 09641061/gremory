import { Building2 } from "lucide-react";
import type { OrganizationSummary } from "@/contexts/business/application/model/business.read-models";

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/contexts/shared/interfaces/components/ui/card";
import { OrganizationCardMenu } from "../organization-card-menu/organization-card-menu";

export function OrganizationsPage({
  organization,
}: {
  organization: OrganizationSummary;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-8">
      <div>
        <h1 className="page-title">Organizations</h1>
        <p className="page-description mt-2">
          Manage the organization associated with your account.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-visible transition-colors hover:ring-foreground/20">
          <div className="flex h-36 items-center justify-center overflow-hidden rounded-t-xl bg-muted/50">
            {organization.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={organization.imageUrl}
                alt={organization.name}
                className="size-full object-cover"
              />
            ) : (
              <Building2 className="size-12 text-muted-foreground/50" />
            )}
          </div>
          <CardHeader>
            <CardTitle>{organization.name}</CardTitle>
            <CardDescription>Organization connected to your account</CardDescription>
            <CardAction>
              <OrganizationCardMenu
                organizationId={organization.id}
                organizationName={organization.name}
              />
            </CardAction>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
