"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/context/auth-context";
import type { SignInPayload } from "@/types/api";

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  async function handleSubmit(values: Record<string, string>) {
    await signIn(values as unknown as SignInPayload);
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
          <h1 className="mt-4 text-2xl font-bold text-brand-900">Welcome back</h1>
          <p className="mt-2 text-sm text-brand-700">Sign in to manage your tip page and payouts.</p>
          <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
            <AuthForm mode="sign-in" onSubmit={handleSubmit} />
          </div>
        </div>
      </main>
    </>
  );
}
