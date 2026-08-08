import { z } from "zod";
import { customerIdentityFields, refineCustomerIdentity } from "./customer-identity.schema";

export const registerCustomerSchema = refineCustomerIdentity(
  z.object(customerIdentityFields)
);

export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;
