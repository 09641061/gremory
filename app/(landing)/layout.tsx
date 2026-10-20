import { getServerLocale } from "@/contexts/shared/infrastructure/i18n/server";
import { LandingNavbar } from "@/contexts/landing/interfaces/components";
import { getLandingDictionary } from "@/contexts/landing/interfaces/i18n";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dictionary = getLandingDictionary(await getServerLocale());

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
      <LandingNavbar nav={dictionary.nav} />
      <main id="app-main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
