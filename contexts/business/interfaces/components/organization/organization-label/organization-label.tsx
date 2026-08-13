import Link from "next/link";
import { Building2 } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";

export type OrganizationLabelOrganization = {
  name: string;
  imageUrl?: string | null;
};

/**
 * The organization is fixed for the account, so it is never a selector: there is
 * nothing to switch to. It links to its own settings, where the name and the
 * logo are edited.
 */
export function OrganizationLabel({
  organization,
  href,
}: {
  organization?: OrganizationLabelOrganization;
  href?: string;
}) {
  const content = (
    <>
      <Avatar className="size-5 border border-border">
        {organization?.imageUrl ? (
          <AvatarImage src={organization.imageUrl} alt={organization.name} />
        ) : (
          <AvatarFallback className="bg-muted">
            <Building2 className="size-3 text-muted-foreground" />
          </AvatarFallback>
        )}
      </Avatar>
      <span className="max-w-44 truncate">{organization?.name ?? "Organization"}</span>
    </>
  );

  if (!href) {
    return <span className="flex items-center gap-2 px-2 font-medium">{content}</span>;
  }

  return (
    // Ghost, like the establishment selector next to it: the two header items
    // share one hover, one height and one radius.
    <Link
      href={href}
      className={buttonVariants({ variant: "ghost", className: "gap-2 px-2 font-medium" })}
    >
      {content}
    </Link>
  );
}
