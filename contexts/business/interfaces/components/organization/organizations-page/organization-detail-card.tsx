"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

import { canManageOrganization } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { updateOrganizationAction } from "@/contexts/business/interfaces/actions/organization.actions";
import { EntityProfileCard } from "@/contexts/business/interfaces/components/entity-profile-card/entity-profile-card";
import { Card } from "@/contexts/shared/interfaces/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/contexts/shared/interfaces/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useBusinessTranslations } from "@/contexts/business/interfaces/i18n";

import { OrganizationRolesPanel } from "./organization-roles-panel";
import type { OrganizationListItem } from "./organizations-page";

interface OrganizationDetailCardProps {
  organization: OrganizationListItem | null;
  ownedOrganizationId: string | null;
  className?: string;
}

type OrganizationTab = "general" | "members" | "roles" | "establishments";

const tabs: ReadonlyArray<{ value: OrganizationTab; label: string }> = [
  { value: "general", label: "General" },
  { value: "members", label: "Members" },
  { value: "roles", label: "Roles" },
  { value: "establishments", label: "Establishments" },
];

const tabTriggerClassName =
  "flex-none rounded-none border-b-2 border-transparent px-0 pt-2 pb-3 text-sm font-medium text-muted-foreground transition-colors after:hidden hover:text-foreground data-active:border-b-foreground data-active:text-foreground";

/**
 * Multi-tab right panel: identity (General) plus the team and access surfaces
 * (Members, Custom Roles, Establishments). The tab bar lives in the white card
 * header so the settings read as belonging to the selected organization. The
 * inner forms are placeholders for now; only layout, navigation and local state
 * are wired here.
 */
export function OrganizationDetailCard({
  organization,
  ownedOrganizationId,
  className,
}: OrganizationDetailCardProps) {
  const { t } = useBusinessTranslations();
  const [activeTab, setActiveTab] = useState<OrganizationTab>("general");

  if (!organization) {
    return (
      <div className={cn("flex-1", className)}>
        <div className="flex min-h-(--app-page-viewport-height) items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm lg:ml-3">
          <div className="max-w-xs">
            <Building2 className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium text-foreground">{t.organizations.selectPromptTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.organizations.selectPromptDescription}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1", className)}>
      <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-xl border-border bg-card py-0 shadow-sm lg:ml-3 lg:h-(--app-page-viewport-height)">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as OrganizationTab)}
          className="flex h-full min-h-0 flex-col gap-0"
        >
          <div className="shrink-0 border-b border-border px-6">
            <TabsList variant="line" className="w-full justify-start gap-6">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={tabTriggerClassName}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="general" className="flex min-h-0 flex-1 flex-col">
            <EntityProfileCard
              key={organization.organizationId}
              entityLabel="Organization"
              photoNoun="logo"
              icon={Building2}
              entityId={organization.organizationId}
              entityName={organization.organizationName}
              photoUrl={organization.organizationImageUrl}
              updateAction={updateOrganizationAction}
              canUpdate={canManageOrganization(organization, ownedOrganizationId)}
              className="min-h-0 flex-1 rounded-none border-0 shadow-none"
            />
          </TabsContent>

          <TabsContent value="members" className="flex min-h-0 flex-1 flex-col">
            <PlaceholderPanel
              title="Unified Staff Management"
              description="Invite people, filter by establishment and manage every member from one place."
              blocks={["Establishment filter", "Invite member", "Staff grid"]}
            />
          </TabsContent>

          <TabsContent value="roles" className="flex min-h-0 flex-1 flex-col">
            <OrganizationRolesPanel organizationId={organization.organizationId} />
          </TabsContent>

          <TabsContent value="establishments" className="flex min-h-0 flex-1 flex-col">
            <PlaceholderPanel
              title="Sedes / Establishments Management"
              description="Create and organize the establishments that belong to this organization."
              blocks={["Establishments list"]}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function PlaceholderPanel({
  title,
  description,
  blocks,
}: {
  title: string;
  description: string;
  blocks: string[];
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-3">
        {blocks.map((block) => (
          <div
            key={block}
            className="flex min-h-20 items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground"
          >
            {block}
          </div>
        ))}
      </div>
    </div>
  );
}
