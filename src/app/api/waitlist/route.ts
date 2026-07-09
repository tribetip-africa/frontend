import { NextResponse } from "next/server";
import { normalizeWaitlistPayload, validateWaitlistPayload, type WaitlistPayload } from "@/lib/waitlist";

function devWaitlistLog(payload: ReturnType<typeof normalizeWaitlistPayload>) {
  console.info("[waitlist:dev]", {
    submitted_at: new Date().toISOString(),
    email: payload.email,
    name: payload.name,
    country: payload.country,
    role: payload.role,
    source: payload.source,
  });
}

export async function POST(request: Request) {
  const webhookUrl = process.env.WAITLIST_GOOGLE_SCRIPT_URL?.trim();
  const devAccept = process.env.NODE_ENV === "development" && !webhookUrl;

  if (!webhookUrl && !devAccept) {
    return NextResponse.json({ error: "Waitlist is not configured yet." }, { status: 503 });
  }

  let body: WaitlistPayload;
  try {
    body = (await request.json()) as WaitlistPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validationError = validateWaitlistPayload(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 422 });
  }

  const payload = normalizeWaitlistPayload(body);

  if (devAccept) {
    devWaitlistLog(payload);
    return NextResponse.json({ ok: true, dev: true });
  }

  try {
    const response = await fetch(webhookUrl!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        name: payload.name,
        country: payload.country,
        role: payload.role,
        source: payload.source,
        submitted_at: new Date().toISOString(),
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Could not save your details. Try again shortly." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Could not save your details. Try again shortly." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
