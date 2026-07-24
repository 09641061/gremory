import { describe, expect, it } from "vitest";
import { Organization } from "../../../../../contexts/business/domain/model/entities/organization.entity";
import { Establishment } from "../../../../../contexts/business/domain/model/entities/establishment.entity";
import { createOrganizationId } from "../../../../../contexts/business/domain/model/valueobjects/organization-id.vo";
import { createOrganizationName } from "../../../../../contexts/business/domain/model/valueobjects/organization-name.vo";
import { createEstablishmentId } from "../../../../../contexts/business/domain/model/valueobjects/establishment-id.vo";
import { createEstablishmentName } from "../../../../../contexts/business/domain/model/valueobjects/establishment-name.vo";
import { createEstablishmentPhoto } from "../../../../../contexts/business/domain/model/valueobjects/establishment-photo.vo";

const organizationId = "11111111-1111-4111-8111-111111111111";
const establishmentId = "22222222-2222-4222-8222-222222222222";

describe("Business value objects", () => {
  it("shouldCreateOrganizationNameWhenNameIsValid", () => {
    expect(createOrganizationName("  Acme  ").value).toBe("Acme");
  });

  it("shouldRejectOrganizationNameWhenNameIsBlank", () => {
    expect(() => createOrganizationName(" ")).toThrow("Organization name is required");
  });

  it("shouldRejectEstablishmentNameWhenNameExceedsTheLimit", () => {
    expect(() => createEstablishmentName("a".repeat(101))).toThrow("100 characters");
  });

  it("shouldAcceptNullPhotoWhenEstablishmentHasNoPhoto", () => {
    expect(createEstablishmentPhoto(null).value).toBeNull();
  });
});

describe("Business entities", () => {
  it("shouldRenameOrganizationWhenNewNameIsValid", () => {
    const organization = Organization.create({
      id: createOrganizationId(organizationId),
      ownerId: organizationId,
      name: createOrganizationName("Old name"),
      active: true,
    });

    organization.rename("New name");

    expect(organization.props.name.value).toBe("New name");
  });

  it("shouldUpdateEstablishmentDetailsWhenValuesAreValid", () => {
    const establishment = Establishment.create({
      id: createEstablishmentId(establishmentId),
      organizationId,
      name: createEstablishmentName("Old shop"),
      photoUrl: createEstablishmentPhoto(null),
      active: true,
    });

    establishment.update("New shop", "https://example.com/shop.png");

    expect(establishment.props.name.value).toBe("New shop");
    expect(establishment.props.photoUrl.value).toBe("https://example.com/shop.png");
  });
});
