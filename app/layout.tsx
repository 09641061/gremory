import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DEFAULT_LOCALE } from "@/contexts/shared/domain/model/i18n";
import { I18nProvider } from "@/contexts/shared/interfaces/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Takodu",
  description: "Your favorite agentic planner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <body className={inter.variable}>
        <a
          href="#app-main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          {DEFAULT_LOCALE === "es" ? "Saltar al contenido principal" : "Skip to main content"}
        </a>
        <I18nProvider initialLocale={DEFAULT_LOCALE}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

