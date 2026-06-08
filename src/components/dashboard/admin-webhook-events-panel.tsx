"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchAdminPaystackEvents, replayAdminPaystackEvent } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { runAfterPaint } from "@/lib/run-after-paint";
import type { AdminPaystackEvent } from "@/types/api";

type AdminWebhookEventsPanelProps = {
  token: string;
};

function statusTone(status: AdminPaystackEvent["status"]): string {
  if (status === "processed") return "text-emerald-700";
  if (status === "failed") return "text-red-700";
  if (status === "processing") return "text-amber-700";
  return "text-brand-700";
}

export function AdminWebhookEventsPanel({ token }: AdminWebhookEventsPanelProps) {
  const [events, setEvents] = useState<AdminPaystackEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [replayId, setReplayId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchAdminPaystackEvents(token, { limit: 20 });
      setEvents(payload.events);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    runAfterPaint(() => loadEvents());
  }, [loadEvents]);

  async function handleReplay(event: AdminPaystackEvent) {
    setReplayId(event.id);
    setError(null);

    try {
      await replayAdminPaystackEvent(token, event.id);
      await loadEvents();
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setReplayId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-brand-900">Paystack webhooks</h3>
          <p className="text-sm text-brand-700">
            Failed events are retried hourly. Replay manually when a tip payment needs recovery.
          </p>
        </div>
        <Button type="button" variant="secondary" disabled={loading} onClick={() => void loadEvents()}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading && events.length === 0 ? (
        <p className="text-sm text-brand-700">Loading webhook events…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-brand-700">No webhook events recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-100">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-600">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-t border-brand-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-900">{event.event_type}</div>
                    {event.error_message && (
                      <div className="mt-1 text-xs text-red-700">{event.error_message}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-800">
                    {event.paystack_reference ?? "—"}
                  </td>
                  <td className={`px-4 py-3 capitalize ${statusTone(event.status)}`}>
                    {event.status}
                  </td>
                  <td className="px-4 py-3 text-brand-700">
                    {new Date(event.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {event.status === "failed" && (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={replayId === event.id}
                        onClick={() => void handleReplay(event)}
                      >
                        {replayId === event.id ? "Replaying…" : "Replay"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
