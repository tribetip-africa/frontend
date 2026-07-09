import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import { AuthGate } from "@/components/auth-gate";
import { SessionMonitor } from "@/components/session-monitor";
import { ThemeInitScript } from "@/components/theme-init-script";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "TribeTip — Creator tips for Africa",
    template: "%s | TribeTip",
  },
  description:
    "Accept tips from your supporters in KES, NGN, GHS, and more. Built for African creators — one link, local payments, payouts that reach your bank.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`} suppressHydrationWarning>
      <head>
        <ThemeInitScript />
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
