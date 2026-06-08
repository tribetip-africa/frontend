"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  isAdminDashboardPath,
  isCreatorDashboardPath,
} from "@/lib/dashboard-nav";

type DashboardRoleGuardProps = {
  isAdmin: boolean;
  children: React.ReactNode;
};

export function DashboardRoleGuard({ isAdmin, children }: DashboardRoleGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isAdmin && isCreatorDashboardPath(pathname)) {
      router.replace("/dashboard");
      return;
    }

    if (!isAdmin && isAdminDashboardPath(pathname)) {
      router.replace("/dashboard");
    }
  }, [isAdmin, pathname, router]);

  if (isAdmin && isCreatorDashboardPath(pathname)) {
    return null;
  }

  if (!isAdmin && isAdminDashboardPath(pathname)) {
    return null;
  }

  return <>{children}</>;
}
