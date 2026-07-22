export type SignOutCommand = Readonly<{
  accessToken?: string;
  refreshToken: string;
}>;
