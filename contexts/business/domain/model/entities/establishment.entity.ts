import type { EstablishmentId } from "../valueobjects/establishment-id.vo";

export interface EstablishmentProps {
  id: EstablishmentId;
  organizationId: string;
  name: string;
  photoUrl?: string | null;
  active: boolean;
}

export class Establishment {
  constructor(public readonly props: EstablishmentProps) {}

  static create(props: EstablishmentProps): Establishment {
    if (!props.name.trim()) throw new Error("Establishment name cannot be empty");
    return new Establishment(props);
  }
}
