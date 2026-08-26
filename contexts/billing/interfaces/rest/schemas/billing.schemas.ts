import { z } from "zod";

export const subscriptionResponseSchema = z.object({
  id: z.string().min(1), ownerId: z.string().min(1), planId: z.number().int(),
  billingCycle: z.string().min(1), status: z.string().min(1),
  currentPeriodStart: z.string().optional(), currentPeriodEnd: z.string().optional(),
  failedAttemptsCount: z.number().int().optional(), active: z.boolean().optional(),
  cancelAtPeriodEnd: z.boolean().optional(), clientSecret: z.string().nullable().optional(),
  stripePublicKey: z.string().nullable().optional(), pendingPlanId: z.number().int().nullable().optional(),
  pendingBillingCycle: z.string().nullable().optional(),
});

export const billingPlanResponseSchema = z.object({
  id: z.number().int(), name: z.string(), maxEstablishments: z.number().int(),
  monthlyPriceAmount: z.number(), annualPriceAmount: z.number(), currency: z.string(), active: z.boolean(),
});
