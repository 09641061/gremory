"use server";

import { z } from "zod";
import { requireAnalyticsContext } from "@/contexts/analytics/interfaces/authorization/analytics-authorization";
import { createCorrelationId } from "@/contexts/shared/infrastructure/http/api-client";
import { composeAnalyticsAdapters } from "../server/analytics-composition";
import { AnalyticsDateRange } from "../../domain/model/value-objects/analytics-date-range";
import { OperationAuthorizationError } from "@/contexts/shared/interfaces/authorization/operation-authorization";

const presetSchema = z.enum(["today", "7d", "30d", "90d"]);
const optionalId = z.string().uuid().optional();

async function resolveAnalyticsContext(preset: unknown, customEstId: unknown, requireMax = false) {
  const parsedPreset = presetSchema.safeParse(preset ?? "30d");
  const parsedEstablishment = customEstId === undefined ? { success: true as const, data: undefined } : optionalId.safeParse(customEstId);
  if (!parsedPreset.success || !parsedEstablishment.success) {
    throw new OperationAuthorizationError("INVALID_RESOURCE");
  }
  const auth = await requireAnalyticsContext(parsedEstablishment.data);
  if (requireMax && !auth.canRequestMax) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }
  // Correlation is generated at this protected boundary and reused for the
  // complete operation. Client headers cannot choose it.
  return { preset: parsedPreset.data, ...auth, correlationId: createCorrelationId() };
}

export async function fetchStandardAnalyticsAction(preset: unknown = "30d", _customOrgId?: unknown, customEstId?: unknown) {
  const context = await resolveAnalyticsContext(preset, customEstId);
  const dateRange = AnalyticsDateRange.fromPreset(context.preset, 30);
  return composeAnalyticsAdapters().standardQueryService.execute(
    { establishmentId: context.establishmentId ?? "", from: dateRange.from, to: dateRange.to, organizationId: context.organizationId ?? "" },
    context.token,
    context.correlationId,
  );
}

export async function fetchMaxAnalyticsAction(preset: unknown = "30d", _customOrgId?: unknown, customEstId?: unknown) {
  const context = await resolveAnalyticsContext(preset, customEstId, true);
  const dateRange = AnalyticsDateRange.fromPreset(context.preset, 90);
  return composeAnalyticsAdapters().maxQueryService.execute(
    { establishmentId: context.establishmentId ?? "", from: dateRange.from, to: dateRange.to, organizationId: context.organizationId ?? "" },
    context.token,
    context.correlationId,
  );
}
