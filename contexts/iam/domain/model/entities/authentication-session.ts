export type AuthenticationSession = Readonly<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}>;
