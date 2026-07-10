import type { Metadata } from "next";
import { buildAuthPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildAuthPageMetadata({
  title: "Sign up",
  description: "Create your free TribeTip page and start accepting tips from supporters in Kenya and across Africa.",
  path: "/sign-up",
});

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
