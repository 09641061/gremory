import "server-only";

import { SchedulingApiGateway } from "../../infrastructure/gateways/scheduling-api.gateway";
import { SchedulingQueryServiceImpl } from "../../application/internal/queryservices/scheduling-query.service.impl";
import { SchedulingCommandServiceImpl } from "../../application/internal/commandservices/scheduling-command.service.impl";
import { SchedulingRosterCommandService } from "../../application/internal/commandservices/scheduling-roster-command.service";
import { loadSchedulingPageData } from "../../application/internal/queryservices/scheduling-page-data.query.service";
import type { SchedulingPageData } from "../../application/model/scheduling-page-data.view-model";
import type { SchedulingRosterReader } from "../../application/ports/scheduling-roster";

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
  rosterCommandService: SchedulingRosterCommandService;
  rosterReader: SchedulingRosterReader;
}>;

export function composeSchedulingAdapters(organizationId?: string): ComposedSchedulingAdapters {
  const gateway = new SchedulingApiGateway(organizationId);
  return {
    gateway,
    queryService: new SchedulingQueryServiceImpl(gateway),
    commandService: new SchedulingCommandServiceImpl(gateway),
    rosterCommandService: new SchedulingRosterCommandService(gateway),
    rosterReader: gateway,
  };
}

export async function loadComposedSchedulingPageData(
  establishmentId: string,
  organizationId: string,
  canManageScheduling: boolean,
  token?: string,
): Promise<SchedulingPageData> {
  const { rosterReader } = composeSchedulingAdapters(organizationId);
  return loadSchedulingPageData(rosterReader, establishmentId, token, canManageScheduling);
}
