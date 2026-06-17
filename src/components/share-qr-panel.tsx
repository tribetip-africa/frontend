"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { fetchMyShareLink, rotateMyShareLink, type ShareLinkPayload } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { runAfterPaint } from "@/lib/run-after-paint";
import { shareLinkHint } from "@/lib/share-link";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type ShareQrPanelProps = {
  token: string;
  shareable: boolean;
  compact?: boolean;
};

export function ShareQrPanel({ token, shareable, compact = false }: ShareQrPanelProps) {
  const [shareLink, setShareLink] = useState<ShareLinkPayload | null>(null);
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rotateOpen, setRotateOpen] = useState(false);

  const loadShareLink = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchMyShareLink(token);
      setShareLink(payload);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    runAfterPaint(() => loadShareLink());
  }, [loadShareLink]);

  const qrDataUrl =
    shareLink?.url && shareLink.shareable ? generatedQrDataUrl : null;

  useEffect(() => {
    if (!shareLink?.url || !shareLink.shareable) return;

    let cancelled = false;

    void QRCode.toDataURL(shareLink.url, {
      margin: 1,
      width: 240,
      errorCorrectionLevel: "M",
    }).then((dataUrl) => {
      if (!cancelled) {
        setGeneratedQrDataUrl(dataUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [shareLink]);

  const handleRotate = useCallback(async () => {
    setRotating(true);
    setError(null);

    try {
      const payload = await rotateMyShareLink(token);
      setShareLink(payload);
      setRotateOpen(false);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setRotating(false);
    }
  }, [token]);

  const handleDownload = useCallback(() => {
    if (!qrDataUrl) return;

    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = "tribetip-tip-qr.png";
    anchor.click();
  }, [qrDataUrl]);

  return (
    <div
      className={
        compact
          ? "space-y-4"
          : "space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-5"
      }
    >
      <div>
        <h3 className={compact ? "text-sm font-semibold text-brand-900" : "font-semibold text-brand-900"}>
          QR tip code
        </h3>
        <p className="mt-1 text-sm text-brand-700">{shareLinkHint(shareable)}</p>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {loading && !shareLink ? (
        <p className="text-sm text-brand-700">Preparing your secure share code…</p>
      ) : shareable && shareLink?.url && qrDataUrl ? (
        <div
          className={
            compact
              ? "flex items-center gap-4"
              : "flex flex-col items-center gap-4 sm:flex-row sm:items-start"
          }
        >
          <Image
            src={qrDataUrl}
            alt="QR code to tip this creator"
            width={compact ? 120 : 240}
            height={compact ? 120 : 240}
            unoptimized
            className="rounded-xl border border-brand-100 bg-white p-3 shadow-sm"
          />
          <div className="space-y-3 text-sm text-brand-700">
            {!compact && (
              <p>
                Scanning opens your tip page directly. You can share this image instead of your public
                username link.
              </p>
            )}
            <p className="font-mono text-xs text-brand-600">{shareLink.path}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={handleDownload}>
                Download PNG
              </Button>
              {!compact && (
                <Button type="button" variant="ghost" onClick={() => setRotateOpen(true)}>
                  Rotate code
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-brand-700">
          Your QR code unlocks once your page is published and payout verification completes.
        </p>
      )}

      <Modal open={rotateOpen} onClose={() => setRotateOpen(false)} title="Rotate QR code?">
        <p className="text-sm text-brand-700">
          Anyone with your current QR or old link will no longer reach your tip page. Print or share a
          new code after rotating.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setRotateOpen(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={rotating} onClick={() => void handleRotate()}>
            {rotating ? "Rotating…" : "Rotate code"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
