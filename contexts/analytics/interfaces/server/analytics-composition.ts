import "server-only";

import { AnalyticsApiGateway } from "../../infrastructure/gateways/analytics-api.gateway";
import { GetStandardAnalyticsQueryService } from "../../application/internal/queryservices/get-standard-analytics-query.service";
import { GetMaxAnalyticsQueryService } from "../../application/internal/queryservices/get-max-analytics-query.service";

/**
 * Server-only composition for the Analytics bounded context.
 *
 * Composition returns a fresh set of adapters per invocation. Callers MUST NOT
 * import the gateway directly. The Max service must only be reachable after
 * an explicit capability check; that decision lives in the route handler or
 * Server Action that calls into the composition.
 */
export type ComposedAnalyticsAdapters = Readonly<{
  gateway: AnalyticsApiGateway;
  standardQueryService: GetStandardAnalyticsQueryService;
  maxQueryService: GetMaxAnalyticsQueryService;
}>;

export function composeAnalyticsAdapters(): ComposedAnalyticsAdapters {
  const gateway = new AnalyticsApiGateway();
  return {
    gateway,
    standardQueryService: new GetStandardAnalyticsQueryService(),
    maxQueryService: new GetMaxAnalyticsQueryService(),
  };
}
