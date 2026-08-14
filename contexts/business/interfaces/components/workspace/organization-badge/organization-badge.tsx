import Link from "next/link";
import { Building2, Settings } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import type { WorkspaceHeaderOrganization } from "@/contexts/business/application/model/business-workspace.view-models";

/**
 * The organization, as the heading of the establishment menu.
 *
 * It sits above the search field because it scopes the list underneath it: the
 * establishments the menu offers are the ones inside this organization. It is
 * never a selector — the organization is fixed for the account, so there is
 * nothing to switch to — it only opens the settings where its name and logo
 * are edited.
 */
export function OrganizationBadge({
  organization,
  href,
}: {
  organization: WorkspaceHeaderOrganization;
  href?: string;
}) {
  const content = (
    <>
      <Avatar className="size-6 shrink-0 border border-border/60 bg-muted">
        <AvatarImage src={organization.imageUrl ?? undefined} alt="" />
        <AvatarFallback className="bg-muted">
          <Building2 className="size-3 text-muted-foreground" aria-hidden="true" />
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1 truncate">{organization.name}</span>
    </>
  );

  const className = "flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm font-medium";

  if (!href) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Link
      href={href}
      className={`${className} transition-colors hover:bg-muted hover:text-foreground`}
    >
      {content}
      <Settings className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}
