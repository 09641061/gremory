import "server-only";

import { cookies } from "next/headers";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import {
  AnalyticsApiGateway,
  type FreeAnalyticsDashboardResponse,
} from "@/contexts/analytics/infrastructure/gateways/analytics-api.gateway";

export class FreeAnalyticsQueryService {
  constructor(private readonly gateway = new AnalyticsApiGateway()) {}

  async handle(): Promise<FreeAnalyticsDashboardResponse> {
    const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

    if (!accessToken) {
      const error = new Error("Authentication required");
      (error as Error & { status?: number }).status = 401;
      throw error;
    }

    return this.gateway.getFreeDashboard(accessToken);
  }
}

export function createFreeAnalyticsQueryService() {
  return new FreeAnalyticsQueryService();
}
