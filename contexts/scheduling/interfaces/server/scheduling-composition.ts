import "server-only";

import { SchedulingApiGateway } from "../../infrastructure/gateways/scheduling-api.gateway";
import { SchedulingQueryServiceImpl } from "../../application/internal/queryservices/scheduling-query.service.impl";
import { SchedulingCommandServiceImpl } from "../../application/internal/commandservices/scheduling-command.service.impl";
import { SchedulingAccessPolicyService } from "../../application/internal/queryservices/scheduling-access-policy.service";

/**
 * Server-only composition for the Scheduling bounded context.
 *
 * Composition returns a fresh set of adapters per invocation. Callers MUST NOT
 * import the gateway or services directly. Future migration target: replace
 * this with `application/ports/{scheduling-appointments, scheduling-roster}.ts`
 * once the gateways implement those consumer-owned contracts.
 *
 * The page-data, members, services and customers helpers in the query folder
 * are plain server-only functions; they construct their own gateway so callers
 * that only need them can import the function directly without going through
 * this composition.
 */
export type ComposedSchedulingAdapters = Readonly<{
  gateway: SchedulingApiGateway;
  queryService: SchedulingQueryServiceImpl;
  commandService: SchedulingCommandServiceImpl;
  accessPolicyService: SchedulingAccessPolicyService;
}>;

export function composeSchedulingAdapters(): ComposedSchedulingAdapters {
  const gateway = new SchedulingApiGateway();
  return {
    gateway,
    queryService: new SchedulingQueryServiceImpl(),
    commandService: new SchedulingCommandServiceImpl(),
    accessPolicyService: new SchedulingAccessPolicyService(),
  };
}
