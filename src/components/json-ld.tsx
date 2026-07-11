import { headers } from "next/headers";
import { serializeJsonLd } from "@/lib/seo";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export async function JsonLd({ data }: JsonLdProps) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
