export interface UpdateCustomerCommand {
  id: string;
  dni?: string | null;
  ruc?: string | null;
  foreignResidentCard?: string | null;
  passport?: string | null;
  name?: string;
  phone: string;
  email: string;
  establishmentId: string;
}
