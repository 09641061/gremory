import type { OrganizationId } from "../valueobjects/organization-id.vo";
import { createOrganizationName, type OrganizationName } from "../valueobjects/organization-name.vo";

export interface OrganizationProps {
  id: OrganizationId;
  ownerId: string;
  name: OrganizationName;
  active: boolean;
}

export class Organization {
  private constructor(
    public readonly id: OrganizationId,
    public readonly ownerId: string,
    private currentName: OrganizationName,
    public readonly active: boolean,
  ) {}

  static create(props: OrganizationProps): Organization {
    if (!props.ownerId.trim()) throw new Error("Organization owner ID is required");
    return new Organization(props.id, props.ownerId, props.name, props.active);
  }

  get name(): OrganizationName {
    return this.currentName;
  }

  rename(name: string): void {
    this.currentName = createOrganizationName(name);
  }
}
