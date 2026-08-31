import type { OrganizationId } from "../valueobjects/organization-id.vo";
import { createOrganizationName, type OrganizationName } from "../valueobjects/organization-name.vo";
import { createOrganizationImage, type OrganizationImage } from "../valueobjects/organization-image.vo";

export interface OrganizationProps {
  id: OrganizationId;
  ownerId: string;
  name: OrganizationName;
  imageUrl: OrganizationImage;
  active: boolean;
}

export class Organization {
  private constructor(
    public readonly id: OrganizationId,
    public readonly ownerId: string,
    private currentName: OrganizationName,
    private currentImageUrl: OrganizationImage,
    public readonly active: boolean,
  ) {}

  static create(props: OrganizationProps): Organization {
    if (!props.ownerId.trim()) throw new Error("Organization owner ID is required");
    return new Organization(
      props.id,
      props.ownerId,
      props.name,
      props.imageUrl ?? createOrganizationImage(),
      props.active
    );
  }

  get name(): OrganizationName {
    return this.currentName;
  }

  get imageUrl(): OrganizationImage {
    return this.currentImageUrl;
  }

  rename(name: string): void {
    this.currentName = createOrganizationName(name);
  }

  update(name: string, imageUrl?: string | null): void {
    this.currentName = createOrganizationName(name);
    this.currentImageUrl = createOrganizationImage(imageUrl);
  }
}
