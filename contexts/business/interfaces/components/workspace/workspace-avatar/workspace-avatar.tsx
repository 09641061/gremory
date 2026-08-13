import { Building2, Store } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";

/**
 * The establishment's photo with the organization's logo resting on its corner.
 *
 * One mark instead of two: the establishment belongs to the organization, and
 * stacking the small logo onto the large photo draws that containment instead
 * of asking the user to infer it from two elements sitting near each other.
 *
 * The ring punches the logo out of the surface behind it, so the two images
 * never bleed into one shape.
 */
export function WorkspaceAvatar({
  establishmentPhotoUrl,
  organizationImageUrl,
  hasOrganization,
}: {
  establishmentPhotoUrl?: string | null;
  organizationImageUrl?: string | null;
  hasOrganization: boolean;
}) {
  return (
    <span className="relative shrink-0" aria-hidden="true">
      <Avatar className="size-(--app-sidebar-avatar-size) border border-border/60 bg-muted">
        <AvatarImage src={establishmentPhotoUrl ?? undefined} alt="" />
        <AvatarFallback className="bg-muted">
          <Store className="size-3.5 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      {hasOrganization && (
        <Avatar className="absolute -end-1 -bottom-1 size-4 bg-muted ring-2 ring-card">
          <AvatarImage src={organizationImageUrl ?? undefined} alt="" />
          <AvatarFallback className="bg-muted">
            <Building2 className="size-2.5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
    </span>
  );
}
