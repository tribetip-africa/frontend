"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/components/errors/error-page";
import { getGlobalErrorContent } from "@/lib/error-pages";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <ErrorPage
          {...getGlobalErrorContent()}
          onPrimaryAction={() => {
            reset();
            window.location.reload();
          }}
        />
      </body>
    </html>
  );
}
