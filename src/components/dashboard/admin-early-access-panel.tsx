"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createAdminEarlyAccessInvite,
  fetchAdminEarlyAccessInvites,
  revokeAdminEarlyAccessInvite,
} from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import type { EarlyAccessInvitePayload } from "@/types/api";

type AdminEarlyAccessPanelProps = {
  token: string | null;
};

export function AdminEarlyAccessPanel({ token }: AdminEarlyAccessPanelProps) {
  const [invites, setInvites] = useState<EarlyAccessInvitePayload[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [lastCreatedUrl, setLastCreatedUrl] = useState<string | null>(null);

  async function load() {
    const data = await fetchAdminEarlyAccessInvites(token, { limit: 20 });
    setInvites(data.invites);
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const data = await fetchAdminEarlyAccessInvites(token, { limit: 20 });
        if (!cancelled) {
          setInvites(data.invites);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getDisplayMessage(err));
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    setLastCreatedUrl(null);

    try {
      const result = await createAdminEarlyAccessInvite(token, { email: email.trim() });
      setLastCreatedUrl(result.invite.url);
      setEmail("");
      await load();
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(invite: EarlyAccessInvitePayload) {
    if (!window.confirm(`Revoke invite for ${invite.email}?`)) {
      return;
    }

    setRevokingId(invite.id);
    setError(null);
    try {
      await revokeAdminEarlyAccessInvite(token, invite.id);
      await load();
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setRevokingId(null);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this invite URL:", url);
    }
  }

  if (error && !invites) {
    return (
      <section className="rounded-2xl border border-coral/30 bg-coral/10 p-5 text-sm text-coral">
        {error}
      </section>
    );
  }

  if (!invites) {
    return (
      <section className="rounded-2xl border border-brand-100 bg-white p-5 text-sm text-brand-700 shadow-sm">
        Loading early access invites…
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="font-semibold text-brand-900">Early access invites</h2>
        <p className="mt-1 text-sm text-brand-700">
          Issue unique signup links for waitlisted creators. Invites burn after successful registration.
        </p>
      </div>

      <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="ea-email" className="mb-1 block text-sm font-medium text-brand-800">
            Email
          </label>
          <input
            id="ea-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none ring-accent focus:border-accent focus:ring-2 focus:ring-accent/30"
            placeholder="creator@email.com"
          />
        </div>
        <Button type="submit" variant="primary" disabled={creating}>
          {creating ? "Creating…" : "Create invite"}
        </Button>
      </form>

      {lastCreatedUrl && (
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-brand-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 truncate font-mono text-xs">{lastCreatedUrl}</p>
          <Button type="button" variant="secondary" onClick={() => void copyUrl(lastCreatedUrl)}>
            Copy link
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
          {error}
        </p>
      )}

      {invites.length === 0 ? (
        <p className="mt-4 text-sm text-brand-600">No invites yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-brand-100">
          {invites.map((invite) => (
            <li key={invite.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-brand-900">{invite.email}</p>
                <p className="text-xs text-brand-600">
                  {invite.available
                    ? `Expires ${new Date(invite.expires_at).toLocaleString()}`
                    : invite.used_at
                      ? `Used ${new Date(invite.used_at).toLocaleString()}`
                      : invite.revoked_at
                        ? "Revoked"
                        : "Unavailable"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {invite.available && (
                  <>
                    <Button type="button" variant="secondary" onClick={() => void copyUrl(invite.url)}>
                      Copy
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={revokingId === invite.id}
                      onClick={() => void handleRevoke(invite)}
                    >
                      Revoke
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
