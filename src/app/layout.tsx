import { Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import { AuthGate } from "@/components/auth-gate";
import { SessionMonitor } from "@/components/session-monitor";
import { ThemeInitScript } from "@/components/theme-init-script";
import { buildRootMetadata } from "@/lib/seo";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = buildRootMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" className={`${jakarta.variable} h-full`} suppressHydrationWarning nonce={nonce}>
      <head>
        <ThemeInitScript nonce={nonce} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>
            <SessionMonitor />
            <AuthGate>{children}</AuthGate>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
