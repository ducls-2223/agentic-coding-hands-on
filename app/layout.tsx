import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/i18n/server";
import { FloatingActionWidget } from "./_components/floating-action-widget";
import { LanguageProvider } from "./_components/language-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "SAA 2025",
  description: "Sun* Annual Awards 2025",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const [
    {
      data: { user },
    },
    headerList,
    language,
  ] = await Promise.all([supabase.auth.getUser(), headers(), getLanguage()]);

  // Hide the FAB on /prelaunch — proxy.ts injects the request pathname so the
  // layout can vary chrome without re-deriving it from the URL.
  const pathname = headerList.get("x-pathname") ?? "";
  const showWidget = user && pathname !== "/prelaunch";

  return (
    <html
      lang={language}
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider value={language}>
          {children}
          {showWidget && <FloatingActionWidget />}
        </LanguageProvider>
      </body>
    </html>
  );
}
