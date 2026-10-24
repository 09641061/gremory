import "server-only";

import { WorkforceService } from "../../application/services/workforce.service";
import { WorkforceApiGateway } from "../../infrastructure/workforce-api.gateway";

export function composeWorkforceAdapters() {
  return { workforceService: new WorkforceService(new WorkforceApiGateway()) };
}
