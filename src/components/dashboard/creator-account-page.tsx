"use client";

import Link from "next/link";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { useDashboard } from "@/context/dashboard-context";

export function CreatorAccountPage() {
  const { tribe } = useDashboard();

  return (
    <>
      <DashboardPageHeader
        title="Account"
        description="Sign-in details and identifiers for support."
      />

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-brand-100 px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-brand-600">Email</dt>
            <dd className="mt-1 text-sm font-medium text-brand-900">{tribe.email}</dd>
          </div>
          <div className="rounded-xl border border-brand-100 px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-brand-600">Username</dt>
            <dd className="mt-1 text-sm font-medium text-brand-900">@{tribe.username}</dd>
          </div>
          <div className="rounded-xl border border-brand-100 px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-brand-600">Account status</dt>
            <dd className="mt-1 text-sm font-medium capitalize text-brand-900">
              {tribe.account_status}
            </dd>
          </div>
          <div className="rounded-xl border border-brand-100 px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-brand-600">Creator ID</dt>
            <dd className="mt-1 truncate font-mono text-xs text-brand-800">{tribe.id}</dd>
          </div>
        </dl>

        <p className="mt-5 text-sm text-brand-700">
          Looking to embed Tribetip on your own site?{" "}
          <Link href="/dashboard/widget" className="font-medium text-brand-700 underline">
            Open website widget settings
          </Link>
          .
        </p>
      </div>
    </>
  );
}
