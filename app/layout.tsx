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
        <I18nProvider initialLocale={DEFAULT_LOCALE}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

