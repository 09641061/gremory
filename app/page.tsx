import { LogoutButton } from "@/contexts/iam/interfaces/components/logout-button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-foreground">
      <h1 className="text-4xl font-bold tracking-tight">Hello world</h1>
      <LogoutButton />
    </main>
  );
}
