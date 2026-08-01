import "server-only";

import { HttpProfileRepository } from "../infrastructure/repositories/http-profile.repository";
import { ProfileCommandServiceImpl } from "./internal/commandservices/profile-command.service.impl";
import { ProfileQueryServiceImpl } from "./internal/queryservices/profile-query.service.impl";
import type { ProfileCommandService } from "./services/profile-command.service";
import type { ProfileQueryService } from "./services/profile-query.service";

let commandServiceInstance: ProfileCommandService | null = null;
let queryServiceInstance: ProfileQueryService | null = null;

export function createProfileCommandService(): ProfileCommandService {
  if (!commandServiceInstance) {
    const repository = new HttpProfileRepository();
    commandServiceInstance = new ProfileCommandServiceImpl(repository);
  }
  return commandServiceInstance;
}

export function createProfileQueryService(): ProfileQueryService {
  if (!queryServiceInstance) {
    const repository = new HttpProfileRepository();
    queryServiceInstance = new ProfileQueryServiceImpl(repository);
  }
  return queryServiceInstance;
}
