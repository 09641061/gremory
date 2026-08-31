import "server-only";

import { CrmCommandService } from "../../../domain/services/crm-command.service";
import { RegisterCustomerCommand } from "../../../domain/model/commands/register-customer.command";
import { UpdateCustomerCommand } from "../../../domain/model/commands/update-customer.command";
import { DeleteCustomerCommand } from "../../../domain/model/commands/delete-customer.command";
import { CustomerResponse, ResolvedCustomerData } from "../../../domain/model/entities/customer";
import { CrmApiGateway } from "../../../infrastructure/gateways/crm-api.gateway";

export class CrmCommandServiceImpl implements CrmCommandService {
  constructor(private readonly gateway: CrmCommandService) {}

  registerCustomer(command: RegisterCustomerCommand): Promise<CustomerResponse> {
    return this.gateway.registerCustomer(command);
  }

  updateCustomer(command: UpdateCustomerCommand): Promise<CustomerResponse> {
    return this.gateway.updateCustomer(command);
  }

  deleteCustomer(command: DeleteCustomerCommand): Promise<void> {
    return this.gateway.deleteCustomer(command);
  }

  resolveDocument(establishmentId: string, dni?: string, ruc?: string): Promise<ResolvedCustomerData> {
    return this.gateway.resolveDocument(establishmentId, dni, ruc);
  }
}

export function createCrmCommandService(organizationId?: string): CrmCommandService {
  return new CrmCommandServiceImpl(new CrmApiGateway(organizationId));
}
