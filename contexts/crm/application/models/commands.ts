export interface CustomerIdentityInput {
  dni?: string | null;
  ruc?: string | null;
  foreignResidentCard?: string | null;
  passport?: string | null;
  name?: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email: string;
}
export type RegisterCustomerInput = CustomerIdentityInput;
export type UpdateCustomerInput = CustomerIdentityInput & { id: string };
export type RegisterCustomerCommand = RegisterCustomerInput & { establishmentId: string };
export type UpdateCustomerCommand = UpdateCustomerInput & { establishmentId: string };
export interface DeleteCustomerCommand { id: string; establishmentId: string }
