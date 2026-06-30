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
  displayName?: string | null;
  compact?: boolean;
};

const QR_RENDER_SIZE = 512;

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

// Bake the creator's name into the centre of the QR. Uses high error correction
// (level H, ~30% recovery) so the covered modules still decode, and renders onto
// a canvas so the centre label is included in the downloaded PNG too.
async function generateQrWithLabel(url: string, label: string): Promise<string> {
  const size = QR_RENDER_SIZE;
  const canvas = document.createElement("canvas");

  await QRCode.toCanvas(canvas, url, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "H",
    color: { dark: "#1a1a1a", light: "#ffffff" },
  });

  const ctx = canvas.getContext("2d");
  const text = label.trim();
  if (!ctx || !text) {
    return canvas.toDataURL("image/png");
  }

  ctx.font = `700 ${Math.round(size * 0.064)}px system-ui, -apple-system, "Segoe UI", sans-serif`;

  const maxTextWidth = size * 0.6;
  let display = text;
  if (ctx.measureText(display).width > maxTextWidth) {
    while (display.length > 1 && ctx.measureText(`${display}…`).width > maxTextWidth) {
      display = display.slice(0, -1);
    }
    display = `${display}…`;
  }

  const textWidth = ctx.measureText(display).width;
  const badgeHeight = size * 0.18;
  const badgeWidth = Math.min(size * 0.72, textWidth + size * 0.1);
  const badgeX = (size - badgeWidth) / 2;
  const badgeY = (size - badgeHeight) / 2;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = size * 0.008;
  drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#1a1a1a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(display, size / 2, size / 2);

  return canvas.toDataURL("image/png");
}

export function ShareQrPanel({ token, shareable, displayName, compact = false }: ShareQrPanelProps) {
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

    void generateQrWithLabel(shareLink.url, displayName ?? "").then((dataUrl) => {
      if (!cancelled) {
        setGeneratedQrDataUrl(dataUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [shareLink, displayName]);

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
