import type { ProfileViewModel } from "../services/profile.view-model";

/**
 * Server-only reader for the current user's profile. The implementation lives
 * in Infrastructure and is injected via `interfaces/server/profile-composition.ts`.
 * Application receives the port and never imports the concrete repository.
 */
export interface ProfileReader {
  getMyProfile(token: string): Promise<ProfileViewModel | null>;
}
