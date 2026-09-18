"use server";

import { cookies, headers } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { createGetStandardAnalyticsQueryService } from "../../application/internal/queryservices/get-standard-analytics-query.service";
import { createGetMaxAnalyticsQueryService } from "../../application/internal/queryservices/get-max-analytics-query.service";
import { AnalyticsDateRange, type AnalyticsPreset } from "../../domain/model/value-objects/analytics-date-range";

export async function fetchStandardAnalyticsAction(
  preset: AnalyticsPreset = "30d",
  customOrgId?: string,
  customEstId?: string
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;
  const cookieOrgId = cookieStore.get(workspaceSelectionCookies.organizationId)?.value;
  const requestHeaders = await headers();
  const headerEstId = requestHeaders.get("x-takodu-establishment-id") ?? undefined;

  const organizationId = customOrgId ?? cookieOrgId;
  const establishmentId = customEstId ?? headerEstId;

  const dateRange = AnalyticsDateRange.fromPreset(preset, 30);
  const service = createGetStandardAnalyticsQueryService();

  return service.execute(
    {
      establishmentId,
      from: dateRange.from,
      to: dateRange.to,
      organizationId,
    },
    accessToken
  );
}

export async function fetchMaxAnalyticsAction(
  preset: AnalyticsPreset = "30d",
  customOrgId?: string,
  customEstId?: string
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;
  const cookieOrgId = cookieStore.get(workspaceSelectionCookies.organizationId)?.value;
  const requestHeaders = await headers();
  const headerEstId = requestHeaders.get("x-takodu-establishment-id") ?? undefined;

  const organizationId = customOrgId ?? cookieOrgId;
  const establishmentId = customEstId ?? headerEstId;

  const dateRange = AnalyticsDateRange.fromPreset(preset, 90);
  const service = createGetMaxAnalyticsQueryService();

  return service.execute(
    {
      establishmentId,
      from: dateRange.from,
      to: dateRange.to,
      organizationId,
    },
    accessToken
  );
}
