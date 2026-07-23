import { IamJwtQueryService } from "../../application/internal/queryservices/iam-jwt-query.service";

const DEFAULT_REFRESH_WINDOW_IN_SECONDS = 30;

export function shouldRefreshAccessToken(
  accessToken: string,
  nowInMilliseconds = Date.now(),
  refreshWindowInSeconds = DEFAULT_REFRESH_WINDOW_IN_SECONDS
): boolean {
  const expirationInSeconds = new IamJwtQueryService().decodeToken(accessToken)?.exp ?? null;
  if (expirationInSeconds === null) return true;

  return expirationInSeconds <=
    Math.floor(nowInMilliseconds / 1000) + refreshWindowInSeconds;
}

