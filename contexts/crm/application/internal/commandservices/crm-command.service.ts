import { CrmCommandService } from "../../../domain/services/crm-command.service";
import { RegisterCustomerCommand } from "../../../domain/model/commands/register-customer.command";
import { UpdateCustomerCommand } from "../../../domain/model/commands/update-customer.command";
import { DeleteCustomerCommand } from "../../../domain/model/commands/delete-customer.command";
import { CustomerResponse, ResolvedCustomerData } from "../../../domain/model/entities/customer";

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

export function createCrmCommandService(gateway: CrmCommandService): CrmCommandService {
  return new CrmCommandServiceImpl(gateway);
}
