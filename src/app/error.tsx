"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/components/errors/error-page";
import { getErrorContent } from "@/lib/error-pages";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorPage {...getErrorContent()} onPrimaryAction={reset} />;
}
