import type { AccessTokenVerification } from "../model/resolved-session";

export interface IamAuthenticationQueryService {
  verifyAccessToken(accessToken: string): Promise<AccessTokenVerification>;
}
