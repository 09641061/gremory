import { describe, expect, it, vi } from "vitest";
import { EstablishmentCommandServiceImpl } from "../../../../../contexts/business/application/internal/commandservices/establishment-command.service";
import { OrganizationCommandServiceImpl } from "../../../../../contexts/business/application/internal/commandservices/organization-command.service";
import { EstablishmentQueryServiceImpl } from "../../../../../contexts/business/application/internal/queryservices/establishment-query.service";
import { OrganizationQueryServiceImpl } from "../../../../../contexts/business/application/internal/queryservices/organization-query.service";
import { Establishment } from "../../../../../contexts/business/domain/model/entities/establishment.entity";
import { Organization } from "../../../../../contexts/business/domain/model/entities/organization.entity";
import { createEstablishmentId } from "../../../../../contexts/business/domain/model/valueobjects/establishment-id.vo";
import { createEstablishmentName } from "../../../../../contexts/business/domain/model/valueobjects/establishment-name.vo";
import { createEstablishmentPhoto } from "../../../../../contexts/business/domain/model/valueobjects/establishment-photo.vo";
import { createOrganizationId } from "../../../../../contexts/business/domain/model/valueobjects/organization-id.vo";
import { createOrganizationName } from "../../../../../contexts/business/domain/model/valueobjects/organization-name.vo";
import { createOrganizationImage } from "../../../../../contexts/business/domain/model/valueobjects/organization-image.vo";
import type {
  EstablishmentRepository,
  OrganizationRepository,
} from "../../../../../contexts/business/domain/services/business.repositories";
import type {
  EstablishmentPhotoStorage,
  OrganizationImageStorage,
} from "../../../../../contexts/business/application/services/business.services";

const organizationId = "11111111-1111-4111-8111-111111111111";
const establishmentId = "22222222-2222-4222-8222-222222222222";

describe("Business command services", () => {
  it("normalizes organization input before updating it", async () => {
    const repository = organizationRepository();
    const save = vi
      .spyOn(repository, "save")
      .mockImplementation(async (value) => value);

    const id = await new OrganizationCommandServiceImpl(
      repository,
      organizationImageStorage(),
    ).update({
      id: organizationId,
      name: "Acme",
    });

    expect(save).toHaveBeenCalled();
    expect(id.value).toBe(organizationId);
  });

  it("still validates the name through the domain when a logo is uploaded", async () => {
    const repository = organizationRepository();
    const save = vi.spyOn(repository, "save");
    const images = organizationImageStorage();
    const upload = vi.spyOn(images, "upload");

    await expect(
      new OrganizationCommandServiceImpl(repository, images).update({
        id: organizationId,
        name: "   ",
        imageFile: new File(["logo"], "logo.png", { type: "image/png" }),
      }),
    ).rejects.toThrow("Organization name is required");

    expect(upload).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("stores a new photo before the establishment records its reference", async () => {
    const current = establishment("OldShop", null);
    const repository = establishmentRepository();
    vi.spyOn(repository, "findById").mockResolvedValue(current);
    vi.spyOn(repository, "save").mockImplementation(async (value) => value);
    const photos = establishmentPhotoStorage();
    const upload = vi.spyOn(photos, "upload").mockResolvedValue(
      createEstablishmentPhoto("https://picsum.photos/seed/replik-test/800/600"),
    );

    await new EstablishmentCommandServiceImpl(repository, photos).update({
      id: establishmentId,
      name: "NewShop",
      photoFile: new File(["photo"], "photo.png", { type: "image/png" }),
    });

    expect(upload).toHaveBeenCalledWith(
      expect.any(File),
      expect.objectContaining({ value: organizationId }),
    );
    expect(current.photoUrl.value).toBe("https://picsum.photos/seed/replik-test/800/600");
  });

  it("drops the stored photo when the account removes it", async () => {
    const current = establishment("Shop", "https://picsum.photos/seed/replik-test/800/600");
    const repository = establishmentRepository();
    vi.spyOn(repository, "findById").mockResolvedValue(current);
    vi.spyOn(repository, "save").mockImplementation(async (value) => value);
    const photos = establishmentPhotoStorage();
    const remove = vi.spyOn(photos, "remove");

    await new EstablishmentCommandServiceImpl(repository, photos).update({
      id: establishmentId,
      name: "Shop",
      removePhoto: true,
    });

    expect(remove).toHaveBeenCalled();
    expect(current.photoUrl.value).toBeNull();
  });

  it("loads the establishment and applies domain behavior before saving", async () => {
    const current = establishment("OldShop", null);
    const repository = establishmentRepository();
    vi.spyOn(repository, "findById").mockResolvedValue(current);
    const save = vi
      .spyOn(repository, "save")
      .mockImplementation(async (value) => value);

    const id = await new EstablishmentCommandServiceImpl(
      repository,
      establishmentPhotoStorage(),
    ).update({
      id: establishmentId,
      name: "NewShop",
      photoUrl: "https://picsum.photos/seed/replik-test/800/600",
    });

    expect(save).toHaveBeenCalledWith(current);
    expect(current.name.value).toBe("NewShop");
    expect(current.photoUrl.value).toBe("https://picsum.photos/seed/replik-test/800/600");
    expect(id.value).toBe(establishmentId);
  });

  it("resolves the owning organization before deleting an establishment", async () => {
    const current = establishment("OldShop", null);
    const repository = establishmentRepository();
    vi.spyOn(repository, "findById").mockResolvedValue(current);
    const remove = vi.spyOn(repository, "delete").mockResolvedValue(undefined);

    await new EstablishmentCommandServiceImpl(
      repository,
      establishmentPhotoStorage(),
    ).delete({ id: establishmentId });

    expect(remove).toHaveBeenCalledWith(
      expect.objectContaining({ value: establishmentId }),
      expect.objectContaining({ value: organizationId }),
    );
  });
});

describe("Business query services", () => {
  it("returns a serializable organization read model", async () => {
    const repository = organizationRepository();
    vi.spyOn(repository, "findMine").mockResolvedValue(organization("Acme"));

    const result = await new OrganizationQueryServiceImpl(
      repository,
    ).getMyOrganization();

    expect(result).toEqual({
      id: organizationId,
      ownerId: organizationId,
      name: "Acme",
      imageUrl: null,
    });
    expect(result).not.toBeInstanceOf(Organization);
  });

  it("returns paginated serializable establishment read models", async () => {
    const repository = establishmentRepository();
    vi.spyOn(repository, "findByOrganization").mockResolvedValue({
      content: [establishment("MainStore", null)],
      number: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
      numberOfElements: 1,
      empty: false,
    });

    const result = await new EstablishmentQueryServiceImpl(
      repository,
    ).getByOrganization({ organizationId, page: 0, size: 20 });

    expect(result.content).toEqual([
      {
        id: establishmentId,
        organizationId,
        name: "MainStore",
        photoUrl: null,
        timeZone: "UTC",
        ownerAvailableForScheduling: true,
      },
    ]);
    expect(result.content[0]).not.toBeInstanceOf(Establishment);
  });
});

function organization(name: string) {
  return Organization.create({
    id: createOrganizationId(organizationId),
    ownerId: organizationId,
    name: createOrganizationName(name),
    imageUrl: createOrganizationImage(null),
    active: true,
  });
}

function establishment(name: string, photoUrl: string | null, timeZone = "UTC") {
  return Establishment.create({
    id: createEstablishmentId(establishmentId),
    organizationId: createOrganizationId(organizationId),
    name: createEstablishmentName(name),
    photoUrl: createEstablishmentPhoto(photoUrl),
    timeZone,
    active: true,
  });
}

function organizationImageStorage(): OrganizationImageStorage {
  return { upload: vi.fn(async () => undefined) };
}

function establishmentPhotoStorage(): EstablishmentPhotoStorage {
  return {
    upload: vi.fn(async () => createEstablishmentPhoto(null)),
    remove: vi.fn(async () => undefined),
  };
}

function organizationRepository(): OrganizationRepository {
  return {
    create: vi.fn(async () => organization("Acme")),
    findMine: vi.fn(async () => organization("Acme")),
    findById: vi.fn(async () => organization("Acme")),
    save: vi.fn(async (value) => value),
  };
}

function establishmentRepository(): EstablishmentRepository {
  return {
    create: vi.fn(async (_organizationId, name, photoUrl, timeZone) =>
      establishment(name.value, photoUrl.value, timeZone),
    ),
    findById: vi.fn(async () => establishment("MainStore", null)),
    findByOrganization: vi.fn(async () => ({
      content: [establishment("MainStore", null)],
      number: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
      numberOfElements: 1,
      empty: false,
    })),
    save: vi.fn(async (value) => value),
    delete: vi.fn(async () => undefined),
  };
}
