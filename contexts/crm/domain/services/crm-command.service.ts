import { CustomerResponse, ResolvedCustomerData } from "../model/entities/customer";
import { RegisterCustomerCommand } from "../model/commands/register-customer.command";
import { UpdateCustomerCommand } from "../model/commands/update-customer.command";
import { DeleteCustomerCommand } from "../model/commands/delete-customer.command";

export interface CrmCommandService {
  registerCustomer(command: RegisterCustomerCommand): Promise<CustomerResponse>;
  updateCustomer(command: UpdateCustomerCommand): Promise<CustomerResponse>;
  deleteCustomer(command: DeleteCustomerCommand): Promise<void>;
  resolveDocument(dni?: string, ruc?: string): Promise<ResolvedCustomerData>;
}
