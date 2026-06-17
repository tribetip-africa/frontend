"use client";

import { useState } from "react";
import { LOCKED_PAGE_HINT } from "@/lib/creator-public-page";
import { getCreatorPageUrl } from "@/lib/platform";
import { Button } from "@/components/ui/button";

type PublicPageActionsProps = {
  username: string;
  shareable: boolean;
  viewLabel?: string;
  copyLabel?: string;
};

export function PublicPageActions({
  username,
  shareable,
  viewLabel = "View public page",
  copyLabel = "Copy page link",
}: PublicPageActionsProps) {
  const [copied, setCopied] = useState(false);
  const publicPageUrl = getCreatorPageUrl(username);

  async function copyPublicLink() {
    if (!shareable) return;

    try {
      await navigator.clipboard.writeText(publicPageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      {shareable ? (
        <a href={publicPageUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" type="button">
            {viewLabel}
          </Button>
        </a>
      ) : (
        <Button variant="secondary" type="button" disabled title={LOCKED_PAGE_HINT}>
          {viewLabel}
        </Button>
      )}
      <Button
        variant="ghost"
        type="button"
        disabled={!shareable}
        title={shareable ? undefined : LOCKED_PAGE_HINT}
        onClick={() => void copyPublicLink()}
      >
        {copied ? "Link copied" : copyLabel}
      </Button>
    </>
  );
}
