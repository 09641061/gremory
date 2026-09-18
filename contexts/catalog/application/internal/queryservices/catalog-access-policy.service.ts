export interface CatalogPermissions {
  canReadCatalog: boolean;
  canCreateCategory: boolean;
  canUpdateCategory: boolean;
  canDeleteCategory: boolean;
  canCreateService: boolean;
  canUpdateService: boolean;
  canDeleteService: boolean;
}

export class CatalogAccessPolicyService {
  async getPermissions(establishmentId?: string): Promise<CatalogPermissions> {
    const enabled = Boolean(establishmentId);

    return {
      canReadCatalog: enabled,
      canCreateCategory: false,
      canUpdateCategory: false,
      canDeleteCategory: false,
      canCreateService: false,
      canUpdateService: false,
      canDeleteService: false,
    };
  }
}

export function createCatalogAccessPolicyService() {
  return new CatalogAccessPolicyService();
}
