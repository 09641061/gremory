import type { EstablishmentId } from "../valueobjects/establishment-id.vo";
import { createEstablishmentName, type EstablishmentName } from "../valueobjects/establishment-name.vo";
import { createEstablishmentPhoto, type EstablishmentPhoto } from "../valueobjects/establishment-photo.vo";

export interface EstablishmentProps {
  id: EstablishmentId;
  organizationId: string;
  name: EstablishmentName;
  photoUrl: EstablishmentPhoto;
  active: boolean;
}

export class Establishment {
  constructor(public readonly props: EstablishmentProps) {}

  static create(props: EstablishmentProps): Establishment {
    if (!props.organizationId.trim()) throw new Error("Organization ID is required");
    return new Establishment({
      ...props,
      photoUrl: props.photoUrl ?? createEstablishmentPhoto(),
    });
  }

  update(name: string, photoUrl?: string | null): void {
    this.props.name = createEstablishmentName(name);
    this.props.photoUrl = createEstablishmentPhoto(photoUrl);
  }
}
