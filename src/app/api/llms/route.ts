import { buildLlmsTxt } from "@/lib/llms-content";

export async function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
    },
  });
}
