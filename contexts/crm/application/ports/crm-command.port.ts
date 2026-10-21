import type { CustomerViewModel } from "../models/customer";
import type { RegisterCustomerCommand, RegisterCustomerInput } from "../models/commands";
import type { UpdateCustomerCommand, UpdateCustomerInput } from "../models/commands";
import type { DeleteCustomerCommand } from "../models/commands";

export interface CrmCommandPort {
  registerCustomer(command: RegisterCustomerCommand): Promise<CustomerViewModel>;
  updateCustomer(command: UpdateCustomerCommand): Promise<CustomerViewModel>;
  deleteCustomer(command: DeleteCustomerCommand): Promise<void>;
}

export type { RegisterCustomerCommand, UpdateCustomerCommand, DeleteCustomerCommand, RegisterCustomerInput, UpdateCustomerInput };
