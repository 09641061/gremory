export type ProfileViewModel = Readonly<{
  username: string;
  imageUrl: string | null;
  language: "ES" | "EN";
  theme: "LIGHT" | "DARK" | "SYSTEM";
}>;
