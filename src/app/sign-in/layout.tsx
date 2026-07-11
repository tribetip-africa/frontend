import type { Metadata } from "next";
import { buildAuthPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildAuthPageMetadata({
  title: "Sign in",
  description: "Sign in to your TribeTip creator dashboard to manage tips, payouts, and your public page.",
  path: "/sign-in",
});

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
