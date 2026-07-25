import type { EstablishmentId } from "../valueobjects/establishment-id.vo";
import type { OrganizationId } from "../valueobjects/organization-id.vo";
import { createEstablishmentName, type EstablishmentName } from "../valueobjects/establishment-name.vo";
import { createEstablishmentPhoto, type EstablishmentPhoto } from "../valueobjects/establishment-photo.vo";

export interface EstablishmentProps {
  id: EstablishmentId;
  organizationId: OrganizationId;
  name: EstablishmentName;
  photoUrl: EstablishmentPhoto;
  active: boolean;
}

export class Establishment {
  private constructor(
    public readonly id: EstablishmentId,
    public readonly organizationId: OrganizationId,
    private currentName: EstablishmentName,
    private currentPhotoUrl: EstablishmentPhoto,
    public readonly active: boolean,
  ) {}

  static create(props: EstablishmentProps): Establishment {
    return new Establishment(
      props.id,
      props.organizationId,
      props.name,
      props.photoUrl ?? createEstablishmentPhoto(),
      props.active,
    );
  }

  get name(): EstablishmentName {
    return this.currentName;
  }

  get photoUrl(): EstablishmentPhoto {
    return this.currentPhotoUrl;
  }

  update(name: string, photoUrl?: string | null): void {
    this.currentName = createEstablishmentName(name);
    this.currentPhotoUrl = createEstablishmentPhoto(photoUrl);
  }
}
