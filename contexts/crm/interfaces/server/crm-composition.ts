import "server-only";

import { CrmApiGateway } from "../../infrastructure/gateways/crm-api.gateway";
import { createCrmCommandService as composeCommandService } from "../../application/internal/commandservices/crm-command.service";
import { createCrmQueryService as composeQueryService } from "../../application/internal/queryservices/crm-query.service";
import type { CrmCommandPort } from "../../application/ports/crm-command.port";
import type { CrmQueryPort } from "../../application/ports/crm-query.port";

export function createCrmCommandService(organizationId?: string): CrmCommandPort {
  return composeCommandService(new CrmApiGateway(organizationId));
}

export function createCrmQueryService(organizationId?: string): CrmQueryPort {
  return composeQueryService(new CrmApiGateway(organizationId));
}
