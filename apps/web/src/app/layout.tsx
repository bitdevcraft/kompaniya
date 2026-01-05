import type { Metadata } from "next";

import { APP } from "@repo/shared";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Geist_Mono, JetBrains_Mono, Lora } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import "@kompaniya/ui-common/globals.css";

import { Providers } from "./providers";

const sansSerif = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
});
const serif = Lora({ subsets: ["latin"], variable: "--font-serif" });
const monospace = JetBrains_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  description: "Enterprise Resource Planning",
  title: APP.TITLE,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html
      className={`h-full w-full ${sansSerif.variable} ${monospace.variable} ${serif.variable}`}
      lang={locale}
      suppressHydrationWarning
    >
      <body className={`  antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <NextIntlClientProvider messages={messages}>
            <div className="h-full min-h-0 w-full">
              <Providers>
                <NuqsAdapter>{children}</NuqsAdapter>
              </Providers>
              <Toaster
                toastOptions={{
                  closeButton: true,
                  style: {
                    fontWeight: "lighter",
                  },
                  classNames: {
                    toast: "!text-[15px] !pr-16",
                    closeButton: "bg-white",
                    error: "!bg-red-50 !text-red-700 !border !border-red-400",
                    warning:
                      "!bg-orange-50 !text-orange-700 !border !border-orange-400",
                    success:
                      "!bg-indigo-500 !text-white !border !border-indigo-800",
                    info: "!bg-blue-50 !text-blue-700 !border !border-blue-400",
                  },
                }}
              />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
