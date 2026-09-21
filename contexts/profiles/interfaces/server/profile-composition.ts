import "server-only";

import { HttpProfileRepository } from "../../infrastructure/repositories/http-profile.repository";
import type { ProfileReader } from "../../application/ports/profile-reader";
import type { ProfileWriter } from "../../application/ports/profile-writer";
import type { ProfileCommandService } from "../../application/services/profile-command.service";
import type { ProfileQueryService } from "../../application/services/profile-query.service";
import { ProfileCommandServiceImpl } from "../../application/internal/commandservices/profile-command.service.impl";
import { ProfileQueryServiceImpl } from "../../application/internal/queryservices/profile-query.service.impl";

/**
 * Server-only composition for the Profiles bounded context.
 *
 * Returns a fresh composition per invocation: profile state is per-request and
 * the gateway must not capture actor tokens through a long-lived singleton.
 * Callers may destructure the parts they need; the entry point is intentionally
 * explicit so we never accidentally leak the writer into a read-only path.
 */
export type ComposedProfileAdapters = Readonly<{
  reader: ProfileReader;
  writer: ProfileWriter;
  queryService: ProfileQueryService;
  commandService: ProfileCommandService;
}>;

export function composeProfileAdapters(): ComposedProfileAdapters {
  const repository = new HttpProfileRepository();
  return {
    reader: repository,
    writer: repository,
    queryService: new ProfileQueryServiceImpl(repository),
    commandService: new ProfileCommandServiceImpl(repository),
  };
}
