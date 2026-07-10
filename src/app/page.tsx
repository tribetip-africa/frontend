import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { JsonLd } from "@/components/json-ld";
import { buildHomeJsonLd } from "@/lib/seo-schema";
import { buildHomeMetadata } from "@/lib/seo";

export const metadata: Metadata = buildHomeMetadata();

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildHomeJsonLd()} />
      <LandingPage />
    </>
  );
}
