import { NextResponse } from "next/server";
import { EARLY_ACCESS_COOKIE_NAME, isValidEarlyAccessToken } from "@/lib/launch-mode";

const MAX_AGE_SECONDS = 60 * 60 * 24; // 24h — enough to finish signup; invite still unused until register

export async function POST(request: Request) {
  let body: { token?: string };
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = body.token?.trim() ?? "";
  if (!isValidEarlyAccessToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: EARLY_ACCESS_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: EARLY_ACCESS_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
