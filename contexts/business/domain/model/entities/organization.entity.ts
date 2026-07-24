import type { OrganizationId } from "../valueobjects/organization-id.vo";

export interface OrganizationProps {
  id: OrganizationId;
  ownerId: string;
  name: string;
  active: boolean;
}

export class Organization {
  constructor(public readonly props: OrganizationProps) {}

  static create(props: OrganizationProps): Organization {
    if (!props.name.trim()) throw new Error("Organization name cannot be empty");
    return new Organization(props);
  }
}
