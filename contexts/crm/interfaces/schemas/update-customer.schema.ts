import { z } from "zod";
import { customerIdentityFields, refineCustomerIdentity } from "./customer-identity.schema";

export const updateCustomerSchema = refineCustomerIdentity(
  z.object({
    id: z.string().min(1),
    ...customerIdentityFields,
  })
);

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
