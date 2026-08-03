import { z } from "zod";

const nullableDoc = z.string().nullish();

export const customerIdentityFields = {
  dni: nullableDoc,
  ruc: nullableDoc,
  foreignResidentCard: nullableDoc,
  passport: nullableDoc,
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
};

export function refineCustomerIdentity<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data, ctx) => {
    const value = data as {
      dni?: string | null;
      ruc?: string | null;
      foreignResidentCard?: string | null;
      passport?: string | null;
    };
    const provided = [
      ["dni", value.dni, /^\d{8}$/],
      ["ruc", value.ruc, /^\d{11}$/],
      ["foreignResidentCard", value.foreignResidentCard, /^\d{9,11}$/],
      ["passport", value.passport, /^[A-Za-z0-9]{6,15}$/],
    ] as const;

    const nonEmpty = provided.filter(([, val]) => val != null && val !== "");
    if (nonEmpty.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide exactly one identity document",
        path: ["dni"],
      });
      return;
    }

    const [field, val, pattern] = nonEmpty[0];
    if (!pattern.test(val as string)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The ${field} format is invalid`,
        path: [field],
      });
    }
  });
}
