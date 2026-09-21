import "server-only";

import { CrmApiGateway } from "../../infrastructure/gateways/crm-api.gateway";
import { createCrmCommandService as composeCommandService } from "../../application/internal/commandservices/crm-command.service";
import { createCrmQueryService as composeQueryService } from "../../application/internal/queryservices/crm-query.service";
import type { CrmCommandService } from "../../domain/services/crm-command.service";
import type { CrmQueryService } from "../../application/services/crm-query.service";

export function createCrmCommandService(organizationId?: string): CrmCommandService {
  return composeCommandService(new CrmApiGateway(organizationId));
}

export function createCrmQueryService(organizationId?: string): CrmQueryService {
  return composeQueryService(new CrmApiGateway(organizationId));
}
