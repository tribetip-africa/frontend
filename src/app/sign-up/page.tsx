"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/context/auth-context";
import type { SignUpPayload } from "@/types/api";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  async function handleSubmit(values: Record<string, string>) {
    await signUp(values as unknown as SignUpPayload);
    router.push("/dashboard");
  }

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="text-sm text-brand-600 hover:underline">
            ← Back to home
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-brand-900">Create your creator page</h1>
          <p className="mt-2 text-sm text-brand-700">
            Free to start. Choose your African market and claim your username.
          </p>
          <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
            <AuthForm mode="sign-up" onSubmit={handleSubmit} />
          </div>
        </div>
      </main>
    </>
  );
}
