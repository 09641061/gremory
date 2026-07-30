"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Pencil, Search, Store } from "lucide-react";
import type { OrganizationSummary } from "@/contexts/business/application/model/business.read-models";
import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { OrganizationCardMenu } from "../organization-card-menu/organization-card-menu";

export function OrganizationsPageView({
  organization,
}: {
  organization: OrganizationSummary;
}) {
  const [filter, setFilter] = useState("");

  const normalizedFilter = filter.trim().toLowerCase();

  const organizationMatches = useMemo(() => {
    if (!normalizedFilter) return true;
    return (
      organization.name.toLowerCase().includes(normalizedFilter) ||
      "current organization".includes(normalizedFilter) ||
      "organization settings".includes(normalizedFilter)
    );
  }, [normalizedFilter, organization.name]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Organizations</h1>
          <p className="page-description mt-2">
            Review your organization and jump into the main configuration areas.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <label className="relative block w-full flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search organization"
            aria-label="Search organization"
            className="pl-9"
          />
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {organizationMatches ? (
          <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm transition-colors hover:ring-foreground/20">
            <div className="flex h-44 items-center justify-center overflow-hidden rounded-t-xl bg-muted/50">
              {organization.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={organization.imageUrl}
                  alt={organization.name}
                  className="size-full object-cover"
                />
              ) : (
                <Building2 className="size-14 text-muted-foreground/50" />
              )}
            </div>

            <CardHeader>
              <CardTitle>{organization.name}</CardTitle>
              <CardDescription>
                Current organization connected to your account
              </CardDescription>
              <CardAction>
                <OrganizationCardMenu
                  organizationId={organization.id}
                  organizationName={organization.name}
                />
              </CardAction>
            </CardHeader>

            <CardContent className="pb-5">
              <p className="text-sm text-muted-foreground">
                Use this organization as the base for billing, access control,
                and operational settings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>No organization found</CardTitle>
              <CardDescription>
                Try a different search term to find your organization.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Organization settings</CardTitle>
            <CardDescription>
              Quick access to the most common organization actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href={`/organizations/${organization.id}/edit`}
              className={buttonVariants({
                variant: "outline",
                className: "w-full justify-start gap-2",
              })}
            >
              <Pencil className="size-4" />
              Edit organization
            </Link>

            <Link
              href="/establishments"
              className={buttonVariants({
                variant: "outline",
                className: "w-full justify-start gap-2",
              })}
            >
              <Store className="size-4" />
              Manage establishments
            </Link>

            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Keep the organization profile updated before changing team or
              establishment settings.
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
