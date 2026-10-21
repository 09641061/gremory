import type { CrmCommandPort } from "../../ports/crm-command.port";
import type { RegisterCustomerCommand, UpdateCustomerCommand, DeleteCustomerCommand } from "../../models/commands";
import type { CustomerViewModel } from "../../models/customer";

export class CrmCommandServiceImpl implements CrmCommandPort {
  constructor(private readonly gateway: CrmCommandPort) {}
  registerCustomer(command: RegisterCustomerCommand): Promise<CustomerViewModel> { return this.gateway.registerCustomer(command); }
  updateCustomer(command: UpdateCustomerCommand): Promise<CustomerViewModel> { return this.gateway.updateCustomer(command); }
  deleteCustomer(command: DeleteCustomerCommand): Promise<void> { return this.gateway.deleteCustomer(command); }
}

export function createCrmCommandService(gateway: CrmCommandPort): CrmCommandPort {
  return new CrmCommandServiceImpl(gateway);
}
