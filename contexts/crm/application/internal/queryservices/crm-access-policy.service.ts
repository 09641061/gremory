export interface CrmPermissions {
  canReadCustomers: boolean;
  canCreateCustomer: boolean;
  canUpdateCustomer: boolean;
  canDeleteCustomer: boolean;
}

export class CrmAccessPolicyService {
  async getPermissions(establishmentId?: string): Promise<CrmPermissions> {
    const enabled = Boolean(establishmentId);

    return {
      canReadCustomers: enabled,
      canCreateCustomer: false,
      canUpdateCustomer: false,
      canDeleteCustomer: false,
    };
  }
}

export function createCrmAccessPolicyService() {
  return new CrmAccessPolicyService();
}
