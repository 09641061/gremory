import type { OrganizationId } from "../valueobjects/organization-id.vo";
import { createOrganizationName, type OrganizationName } from "../valueobjects/organization-name.vo";

export interface OrganizationProps {
  id: OrganizationId;
  ownerId: string;
  name: OrganizationName;
  active: boolean;
}

export class Organization {
  constructor(public readonly props: OrganizationProps) {}

  static create(props: OrganizationProps): Organization {
    if (!props.ownerId.trim()) throw new Error("Organization owner ID is required");
    return new Organization({ ...props, name: props.name ?? createOrganizationName("") });
  }

  rename(name: string): void {
    this.props.name = createOrganizationName(name);
  }
}
