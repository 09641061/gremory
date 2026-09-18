import { describe, expect, it } from "vitest";
import { Organization } from "../../../../../contexts/business/domain/model/entities/organization.entity";
import { Establishment } from "../../../../../contexts/business/domain/model/entities/establishment.entity";
import { createOrganizationId } from "../../../../../contexts/business/domain/model/valueobjects/organization-id.vo";
import { createOrganizationName } from "../../../../../contexts/business/domain/model/valueobjects/organization-name.vo";
import { createEstablishmentId } from "../../../../../contexts/business/domain/model/valueobjects/establishment-id.vo";
import { createEstablishmentName } from "../../../../../contexts/business/domain/model/valueobjects/establishment-name.vo";
import { createEstablishmentPhoto } from "../../../../../contexts/business/domain/model/valueobjects/establishment-photo.vo";
import { createOrganizationImage } from "../../../../../contexts/business/domain/model/valueobjects/organization-image.vo";

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
    expect(() => createEstablishmentName("a".repeat(21))).toThrow("between 3 and 20 characters");
  });

  it("shouldAcceptNullPhotoWhenEstablishmentHasNoPhoto", () => {
    expect(createEstablishmentPhoto(null).value).toBeNull();
  });

  it("shouldCreateOrganizationImageWhenUrlIsValid", () => {
    expect(createOrganizationImage("  https://picsum.photos/seed/replik-test/800/600  ").value).toBe("https://picsum.photos/seed/replik-test/800/600");
  });

  it("shouldRejectOrganizationImageWhenUrlExceedsTheLimit", () => {
    expect(() => createOrganizationImage("a".repeat(501))).toThrow("500 characters");
  });
});

describe("Business entities", () => {
  it("shouldRenameOrganizationWhenNewNameIsValid", () => {
    const organization = Organization.create({
      id: createOrganizationId(organizationId),
      ownerId: organizationId,
      name: createOrganizationName("OldName"),
      imageUrl: createOrganizationImage(null),
      active: true,
    });

    organization.rename("NewName");

    expect(organization.name.value).toBe("NewName");
  });

  it("shouldUpdateOrganizationDetailsWhenValuesAreValid", () => {
    const organization = Organization.create({
      id: createOrganizationId(organizationId),
      ownerId: organizationId,
      name: createOrganizationName("OldName"),
      imageUrl: createOrganizationImage(null),
      active: true,
    });

    organization.update("NewName", "https://picsum.photos/seed/replik-test/800/600");

    expect(organization.name.value).toBe("NewName");
    expect(organization.imageUrl.value).toBe("https://picsum.photos/seed/replik-test/800/600");
  });

  it("shouldUpdateEstablishmentDetailsWhenValuesAreValid", () => {
    const establishment = Establishment.create({
      id: createEstablishmentId(establishmentId),
      organizationId: createOrganizationId(organizationId),
      name: createEstablishmentName("OldShop"),
      photoUrl: createEstablishmentPhoto(null),
      active: true,
    });

    establishment.update("NewShop", "https://picsum.photos/seed/replik-test/800/600");

    expect(establishment.name.value).toBe("NewShop");
    expect(establishment.photoUrl.value).toBe("https://picsum.photos/seed/replik-test/800/600");
  });
});
