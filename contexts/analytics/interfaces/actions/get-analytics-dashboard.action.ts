"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { requireAnalyticsContext } from "@/contexts/analytics/interfaces/authorization/analytics-authorization";
import { createGetStandardAnalyticsQueryService } from "../../application/internal/queryservices/get-standard-analytics-query.service";
import { createGetMaxAnalyticsQueryService } from "../../application/internal/queryservices/get-max-analytics-query.service";
import { AnalyticsDateRange } from "../../domain/model/value-objects/analytics-date-range";

const presetSchema = z.enum(["7d", "30d", "90d"]);
const optionalId = z.string().uuid().optional();

async function resolveAnalyticsContext(preset: unknown, customEstId: unknown) {
  const parsedPreset = presetSchema.safeParse(preset ?? "30d");
  const parsedEstablishment = customEstId === undefined ? { success: true as const, data: undefined } : optionalId.safeParse(customEstId);
  if (!parsedPreset.success || !parsedEstablishment.success) throw new Error("Invalid analytics selection");
  const auth = await requireAnalyticsContext(parsedEstablishment.data);
  return { preset: parsedPreset.data, ...auth };
}

export async function fetchStandardAnalyticsAction(preset: unknown = "30d", _customOrgId?: unknown, customEstId?: unknown) {
  const context = await resolveAnalyticsContext(preset, customEstId);
  const requestHeaders = await headers();
  const establishmentId = context.establishmentId ?? requestHeaders.get("x-takodu-establishment-id") ?? undefined;
  const dateRange = AnalyticsDateRange.fromPreset(context.preset, 30);
  return createGetStandardAnalyticsQueryService().execute(
    { establishmentId, from: dateRange.from, to: dateRange.to, organizationId: context.organizationId },
    context.token,
  );
}

export async function fetchMaxAnalyticsAction(preset: unknown = "30d", _customOrgId?: unknown, customEstId?: unknown) {
  const context = await resolveAnalyticsContext(preset, customEstId);
  const requestHeaders = await headers();
  const establishmentId = context.establishmentId ?? requestHeaders.get("x-takodu-establishment-id") ?? undefined;
  const dateRange = AnalyticsDateRange.fromPreset(context.preset, 90);
  return createGetMaxAnalyticsQueryService().execute(
    { establishmentId, from: dateRange.from, to: dateRange.to, organizationId: context.organizationId },
    context.token,
  );
}
