import { getIndexNowKey } from "@/lib/indexnow";

export async function GET(request: Request) {
  const key = getIndexNowKey();
  if (!key) {
    return new Response("Not found", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get("key") !== key) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
    },
  });
}
