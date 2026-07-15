import { createIdempotencyKey } from "@/lib/idempotency-key";
import { isCookieAuthEnabled } from "@/lib/auth-mode";
import { storeCsrfToken } from "@/lib/csrf-storage";
import { isCheckoutStillProcessing } from "@/lib/tip-checkout";
import type {
  AuthResponse,
  SignInPayload,
  SignUpPayload,
  CreatorProfile,
  UpdateProfilePayload,
  Tip,
  CreateTipPayload,
  PaystackOnboarding,
  PaystackOnboardingPayload,
  PaystackSettlementsPayload,
  PaystackSettlement,
  AdminSettlementsPayload,
  SettlementDetailPayload,
  CreatorNotificationsPayload,
  CreatorNotification,
  PaystackRepairPayload,
  PaystackWithdrawalsPayload,
  WithdrawalStatus,
  AdminPaystackRepairPayload,
  PaystackMarket,
  PaystackBank,
  Tribe,
  AdminTribesResponse,
  AdminTribeSummary,
  AdminPaystackEvent,
  AdminPaystackEventsResponse,
  PaystackAuditReport,
  TipInvestigation,
  PaymentAlertsResponse,
  PlatformReconciliationResponse,
  ReferralsPayload,
  ReferralInvitePayload,
  AdminReferralsResponse,
  EarlyAccessInvitePayload,
  EarlyAccessInvitePreview,
} from "@/types/api";
import { authHeaders, requestJson } from "@/lib/api-request";
import { TribetipAuthError, getDisplayMessage } from "@/lib/errors";
import { getApiBaseUrl } from "@/lib/platform";
import { secureFetch } from "@/lib/secure-fetch";

const API_BASE = getApiBaseUrl();

function parseBearerToken(authorization: string | null): string | null {
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice("Bearer ".length);
}

function extractToken(response: Response, data: AuthResponse): string | null {
  if (data.token) return data.token;
  return parseBearerToken(response.headers.get("Authorization"));
}

function persistAuthResponse(response: Response, data: AuthResponse): string | null {
  const token = extractToken(response, data);
  if (data.csrf_token) {
    storeCsrfToken(data.csrf_token);
  }
  return token;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await secureFetch(`${API_BASE}/up`, {
      cachePolicy: "noStore",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export type PublicProfile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  country_code: string;
  currency: string;
  default_tip_amount_cents: number;
};

export async function fetchPublicProfile(username: string): Promise<PublicProfile> {
  const { data } = await requestJson<{ profile: PublicProfile }>(
    `${API_BASE}/tribes/${username}`,
    {
      cachePolicy: "publicShort",
      headers: { Accept: "application/json" },
    },
  );

  return data.profile;
}

export async function fetchPublicProfileByShareToken(token: string): Promise<PublicProfile> {
  const { data } = await requestJson<{ profile: PublicProfile }>(
    `${API_BASE}/share/${encodeURIComponent(token)}`,
    {
      cachePolicy: "publicShort",
      headers: { Accept: "application/json" },
    },
  );

  return data.profile;
}

export type ShareLinkPayload = {
  token: string;
  path: string;
  url: string | null;
  shareable: boolean;
};

export async function fetchMyShareLink(authToken: string | null): Promise<ShareLinkPayload> {
  const { data } = await requestJson<{ share_link: ShareLinkPayload }>(
    `${API_BASE}/me/share_link`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(authToken),
    },
  );

  return data.share_link;
}

export async function rotateMyShareLink(authToken: string | null): Promise<ShareLinkPayload> {
  const { data } = await requestJson<{ share_link: ShareLinkPayload; message?: string }>(
    `${API_BASE}/me/share_link/rotate`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: authHeaders(authToken),
    },
  );

  return data.share_link;
}

export async function fetchMyReferrals(authToken: string | null): Promise<ReferralsPayload["referrals"]> {
  const { data } = await requestJson<ReferralsPayload>(`${API_BASE}/me/referrals`, {
    cachePolicy: "noStore",
    headers: authHeaders(authToken),
  });

  return data.referrals;
}

export async function updateMyReferrals(
  authToken: string | null,
  referralsEnabled: boolean,
): Promise<ReferralsPayload["referrals"]> {
  const { data } = await requestJson<ReferralsPayload>(`${API_BASE}/me/referrals`, {
    method: "PATCH",
    cachePolicy: "noStore",
    headers: {
      ...authHeaders(authToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      referrals: {
        referrals_enabled: referralsEnabled,
      },
    }),
  });

  return data.referrals;
}

export async function rotateReferralInvite(
  authToken: string | null,
): Promise<{ message: string; invite: ReferralInvitePayload }> {
  const { data } = await requestJson<{ message: string; invite: ReferralInvitePayload }>(
    `${API_BASE}/me/referrals/invite/rotate`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: authHeaders(authToken),
    },
  );

  return data;
}

export async function fetchAdminReferrals(
  authToken: string | null,
  params: { limit?: number; offset?: number } = {},
): Promise<AdminReferralsResponse> {
  const search = new URLSearchParams();
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.offset != null) search.set("offset", String(params.offset));

  const query = search.toString();
  const { data } = await requestJson<AdminReferralsResponse>(
    `${API_BASE}/admin/referrals${query ? `?${query}` : ""}`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(authToken),
    },
  );

  return data;
}

export async function rejectAdminReferral(
  authToken: string | null,
  referralId: string,
  reason: string,
): Promise<{ message: string }> {
  const { data } = await requestJson<{ message: string }>(
    `${API_BASE}/admin/referrals/${encodeURIComponent(referralId)}/reject`,
    {
      method: "PATCH",
      cachePolicy: "noStore",
      headers: authHeaders(authToken),
      body: JSON.stringify({ reason }),
    },
  );

  return data;
}

export async function fetchEarlyAccessInvite(token: string): Promise<EarlyAccessInvitePreview> {
  const { data } = await requestJson<EarlyAccessInvitePreview>(
    `${API_BASE}/early_access/${encodeURIComponent(token)}`,
    { cachePolicy: "noStore" },
  );
  return data;
}

export async function fetchAdminEarlyAccessInvites(
  authToken: string | null,
  params: { limit?: number; offset?: number } = {},
): Promise<{ invites: EarlyAccessInvitePayload[] }> {
  const search = new URLSearchParams();
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.offset != null) search.set("offset", String(params.offset));
  const query = search.toString();

  const { data } = await requestJson<{ invites: EarlyAccessInvitePayload[] }>(
    `${API_BASE}/admin/early_access_invites${query ? `?${query}` : ""}`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(authToken),
    },
  );
  return data;
}

export async function createAdminEarlyAccessInvite(
  authToken: string | null,
  payload: { email: string; expires_in_days?: number },
): Promise<{ message: string; invite: EarlyAccessInvitePayload }> {
  const { data } = await requestJson<{ message: string; invite: EarlyAccessInvitePayload }>(
    `${API_BASE}/admin/early_access_invites`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: authHeaders(authToken),
      body: JSON.stringify(payload),
    },
  );
  return data;
}

export async function revokeAdminEarlyAccessInvite(
  authToken: string | null,
  inviteId: string,
): Promise<{ message: string; invite: EarlyAccessInvitePayload }> {
  const { data } = await requestJson<{ message: string; invite: EarlyAccessInvitePayload }>(
    `${API_BASE}/admin/early_access_invites/${encodeURIComponent(inviteId)}/revoke`,
    {
      method: "PATCH",
      cachePolicy: "noStore",
      headers: authHeaders(authToken),
    },
  );
  return data;
}

export async function signUp(
  payload: SignUpPayload,
): Promise<{ data: AuthResponse; token: string | null }> {
  const { response, data } = await requestJson<AuthResponse>(
    `${API_BASE}/tribes.json`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ tribe: payload }),
    },
  );

  return {
    data: data as AuthResponse,
    token: persistAuthResponse(response, data as AuthResponse),
  };
}

export async function signIn(
  payload: SignInPayload,
): Promise<{ data: AuthResponse; token: string | null }> {
  const { response, data } = await requestJson<AuthResponse>(
    `${API_BASE}/tribes/sign_in.json`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ tribe: payload }),
    },
  );

  const token = persistAuthResponse(response, data as AuthResponse);
  if (!isCookieAuthEnabled() && !token) {
    throw new TribetipAuthError(
      "No authentication token returned. Restart the Rails API so CORS exposes Authorization, or ensure sign-in returns token in JSON.",
    );
  }

  return { data: data as AuthResponse, token };
}

export async function signOut(token?: string | null): Promise<void> {
  await requestJson<Record<string, unknown>>(`${API_BASE}/tribes/sign_out.json`, {
    method: "DELETE",
    cachePolicy: "noStore",
    headers: {
      Accept: "application/json",
      ...authHeaders(token),
    },
  });
}

export async function refreshSession(
  token?: string | null,
): Promise<{ data: AuthResponse; token: string | null }> {
  const { response, data } = await requestJson<AuthResponse>(
    `${API_BASE}/tribes/session/refresh`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  const nextToken = persistAuthResponse(response, data as AuthResponse);
  if (!isCookieAuthEnabled() && !nextToken) {
    throw new TribetipAuthError("No authentication token returned from session refresh.");
  }

  return { data: data as AuthResponse, token: nextToken };
}

export async function fetchMyProfile(token?: string | null): Promise<CreatorProfile> {
  const { data } = await requestJson<{ profile: CreatorProfile }>(`${API_BASE}/me/profile`, {
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });

  return data.profile;
}

export async function updateMyProfile(
  token: string | null,
  payload: UpdateProfilePayload,
): Promise<CreatorProfile> {
  const { data } = await requestJson<{ profile: CreatorProfile }>(`${API_BASE}/me/profile`, {
    method: "PATCH",
    cachePolicy: "noStore",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profile: payload }),
  });

  return data.profile;
}

export async function publishMyProfile(token: string | null): Promise<CreatorProfile> {
  const { data } = await requestJson<{ profile: CreatorProfile }>(
    `${API_BASE}/me/profile/publish`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data.profile;
}

type CompletePaystackOnboardingPayload = {
  settlement_bank: string;
  account_number: string;
  business_name?: string;
  referral_code?: string;
};

type CreateTipOptions = {
  idempotencyKey?: string;
  onCheckoutPolling?: () => void;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function pollPaystackOnboardingComplete(
  token: string | null,
  { attempts = 60, intervalMs = 500 } = {},
): Promise<PaystackOnboardingPayload> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const payload = await fetchPaystackOnboarding(token);
    if (payload.onboarding.provisioning_error) {
      throw new Error(payload.onboarding.provisioning_error);
    }
    if (payload.onboarding.complete) return payload;
    await sleep(intervalMs);
  }

  throw new Error("Payout setup is still processing. Please wait a moment and refresh.");
}

export async function createTip(
  payload: CreateTipPayload,
  options: CreateTipOptions = {},
): Promise<Tip> {
  const idempotencyKey = options.idempotencyKey ?? createIdempotencyKey();
  const { data } = await requestJson<{ tip: Tip; message?: string }>(`${API_BASE}/tips`, {
    method: "POST",
    cachePolicy: "noStore",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ tip: payload }),
  });

  const tip = data.tip;
  if (tip.authorization_url) return tip;
  if (tip.checkout_status === "failed") {
    throw new Error("Unable to initialize Paystack checkout. Please try again.");
  }

  options.onCheckoutPolling?.();
  return pollTipCheckout(tip.paystack_reference);
}

async function fetchTipCheckout(paystackReference: string): Promise<Tip> {
  const { data } = await requestJson<{ tip: Tip }>(
    `${API_BASE}/tips/checkout/${encodeURIComponent(paystackReference)}`,
    {
      cachePolicy: "noStore",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return data.tip;
}

async function pollTipCheckout(paystackReference: string, attempts = 30): Promise<Tip> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const tip = await fetchTipCheckout(paystackReference);
    if (tip.authorization_url) return tip;
    if (tip.checkout_status === "failed") {
      throw new Error("Unable to initialize Paystack checkout. Please try again.");
    }
    await sleep(500);
  }

  throw new Error("Checkout could not be started. Please try again.");
}

export async function reconcileTipPayment(paystackReference: string): Promise<Tip> {
  const { data } = await requestJson<{ tip: Tip; message?: string }>(
    `${API_BASE}/tips/${encodeURIComponent(paystackReference)}/reconcile`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return data.tip;
}

export async function fetchMyTips(token: string | null): Promise<Tip[]> {
  const { data } = await requestJson<{ tips: Tip[] }>(`${API_BASE}/me/tips`, {
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });

  return data.tips;
}

export async function fetchMyTip(token: string | null, tipId: string): Promise<Tip> {
  const { data } = await requestJson<{ tip: Tip }>(
    `${API_BASE}/me/tips/${encodeURIComponent(tipId)}`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data.tip;
}

type AdminTribesQuery = {
  q?: string;
  limit?: number;
  offset?: number;
};

export async function fetchAdminTribes(
  token: string | null,
  query: AdminTribesQuery = {},
): Promise<AdminTribesResponse> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (typeof query.limit === "number") params.set("limit", String(query.limit));
  if (typeof query.offset === "number") params.set("offset", String(query.offset));

  const suffix = params.toString();
  const url = suffix ? `${API_BASE}/admin/tribes?${suffix}` : `${API_BASE}/admin/tribes`;

  const { data } = await requestJson<AdminTribesResponse>(url, {
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });

  return data;
}

export async function suspendAdminTribe(token: string | null, tribeId: string): Promise<AdminTribeSummary> {
  const { data } = await requestJson<{ tribe: AdminTribeSummary }>(
    `${API_BASE}/admin/tribes/${encodeURIComponent(tribeId)}/suspend`,
    {
      method: "PATCH",
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data.tribe;
}

export async function activateAdminTribe(token: string | null, tribeId: string): Promise<AdminTribeSummary> {
  const { data } = await requestJson<{ tribe: AdminTribeSummary }>(
    `${API_BASE}/admin/tribes/${encodeURIComponent(tribeId)}/activate`,
    {
      method: "PATCH",
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data.tribe;
}

type PaystackAuditOptions = {
  sync?: boolean;
};

export async function fetchAdminPaystackEvents(
  token: string | null,
  query: { status?: string; limit?: number; offset?: number } = {},
): Promise<AdminPaystackEventsResponse> {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (typeof query.limit === "number") params.set("limit", String(query.limit));
  if (typeof query.offset === "number") params.set("offset", String(query.offset));

  const suffix = params.toString();
  const url = suffix
    ? `${API_BASE}/admin/paystack_events?${suffix}`
    : `${API_BASE}/admin/paystack_events`;

  const { data } = await requestJson<AdminPaystackEventsResponse>(url, {
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });

  return data;
}

export async function investigateAdminTip(
  token: string | null,
  paystackReference: string,
): Promise<TipInvestigation> {
  const { data } = await requestJson<{ investigation: TipInvestigation }>(
    `${API_BASE}/admin/tips/${encodeURIComponent(paystackReference)}/investigate`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data.investigation;
}

export async function replayAdminPaystackEvent(
  token: string | null,
  eventId: string,
): Promise<AdminPaystackEvent> {
  const { data } = await requestJson<{ event: AdminPaystackEvent }>(
    `${API_BASE}/admin/paystack_events/${encodeURIComponent(eventId)}/replay`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data.event;
}

export async function fetchAdminPaystackAudit(
  token: string | null,
  tribeId: string,
  options: PaystackAuditOptions = {},
): Promise<PaystackAuditReport> {
  const params = new URLSearchParams();
  if (options.sync) params.set("sync", "true");
  const suffix = params.toString();
  const url = suffix
    ? `${API_BASE}/admin/tribes/${encodeURIComponent(tribeId)}/paystack_audit?${suffix}`
    : `${API_BASE}/admin/tribes/${encodeURIComponent(tribeId)}/paystack_audit`;

  const { data } = await requestJson<{ audit: PaystackAuditReport }>(url, {
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });

  return data.audit;
}

export async function fetchPaystackSettlements(
  token: string | null,
  options?: { refresh?: boolean },
): Promise<PaystackSettlementsPayload> {
  const query = options?.refresh ? "?refresh=true" : "";
  const { data } = await requestJson<PaystackSettlementsPayload>(
    `${API_BASE}/me/paystack/settlements${query}`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data;
}

export async function fetchPaystackSettlementDetail(
  token: string | null,
  settlementId: string,
): Promise<SettlementDetailPayload> {
  const { data } = await requestJson<SettlementDetailPayload>(
    `${API_BASE}/me/paystack/settlements/${encodeURIComponent(settlementId)}`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data;
}

export async function fetchCreatorNotifications(
  token: string | null,
  options?: { limit?: number },
): Promise<CreatorNotificationsPayload> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  const suffix = params.toString();
  const url = suffix ? `${API_BASE}/me/notifications?${suffix}` : `${API_BASE}/me/notifications`;

  const { data } = await requestJson<CreatorNotificationsPayload>(url, {
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });

  return data;
}

export async function markCreatorNotificationRead(
  token: string | null,
  notificationId: string,
): Promise<CreatorNotification> {
  const { data } = await requestJson<{ notification: CreatorNotification }>(
    `${API_BASE}/me/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: "PATCH",
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data.notification;
}

export async function markAllCreatorNotificationsRead(token: string | null): Promise<void> {
  await requestJson(`${API_BASE}/me/notifications/read_all`, {
    method: "PATCH",
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });
}

export async function fetchPaystackWithdrawals(
  token: string | null,
  options?: { refresh?: boolean },
): Promise<PaystackWithdrawalsPayload> {
  const query = options?.refresh ? "?refresh=true" : "";
  const { data } = await requestJson<PaystackWithdrawalsPayload>(
    `${API_BASE}/me/paystack/withdrawals${query}`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data;
}

export async function createPaystackWithdrawal(token: string | null): Promise<{
  message: string;
  withdrawal: PaystackSettlement;
  status: WithdrawalStatus;
}> {
  const { data } = await requestJson<{
    message: string;
    withdrawal: PaystackSettlement;
    status: WithdrawalStatus;
  }>(`${API_BASE}/me/paystack/withdrawals`, {
    method: "POST",
    cachePolicy: "noStore",
    headers: {
      ...authHeaders(token),
      "Idempotency-Key": createIdempotencyKey(),
    },
  });

  return data;
}

export async function repairPaystackData(token: string | null): Promise<PaystackRepairPayload> {
  const { data } = await requestJson<PaystackRepairPayload>(`${API_BASE}/me/paystack/repair`, {
    method: "POST",
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });

  return data;
}

export async function reconcileMyTip(token: string | null, tipId: string): Promise<Tip> {
  const { data } = await requestJson<{ message: string; tip: Tip }>(
    `${API_BASE}/me/tips/${encodeURIComponent(tipId)}/reconcile`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data.tip;
}

export async function repairAdminPaystackData(
  token: string | null,
  tribeId: string,
): Promise<AdminPaystackRepairPayload> {
  const { data } = await requestJson<AdminPaystackRepairPayload>(
    `${API_BASE}/admin/tribes/${encodeURIComponent(tribeId)}/repair`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data;
}

export async function fetchAdminSettlements(
  token: string | null,
  tribeId: string,
  options?: { refresh?: boolean },
): Promise<AdminSettlementsPayload> {
  const query = options?.refresh ? "?refresh=true" : "";
  const { data } = await requestJson<AdminSettlementsPayload>(
    `${API_BASE}/admin/tribes/${encodeURIComponent(tribeId)}/settlements${query}`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data;
}

type PaymentAlertsQuery = {
  unresolved?: boolean;
  limit?: number;
  offset?: number;
};

export async function fetchAdminPaymentAlerts(
  token: string | null,
  query: PaymentAlertsQuery = {},
): Promise<PaymentAlertsResponse> {
  const params = new URLSearchParams();
  if (query.unresolved) params.set("unresolved", "true");
  if (typeof query.limit === "number") params.set("limit", String(query.limit));
  if (typeof query.offset === "number") params.set("offset", String(query.offset));

  const suffix = params.toString();
  const url = suffix
    ? `${API_BASE}/admin/payment_alerts?${suffix}`
    : `${API_BASE}/admin/payment_alerts`;

  const { data } = await requestJson<PaymentAlertsResponse>(url, {
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });

  return data;
}

export async function fetchAdminPlatformReconciliation(
  token: string | null,
): Promise<PlatformReconciliationResponse> {
  const { data } = await requestJson<PlatformReconciliationResponse>(
    `${API_BASE}/admin/paystack/reconciliation`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data;
}

export async function runAdminPlatformReconciliation(
  token: string | null,
  options?: { autoRepair?: boolean },
): Promise<PlatformReconciliationResponse> {
  const { data } = await requestJson<PlatformReconciliationResponse>(
    `${API_BASE}/admin/paystack/reconciliation`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: {
        ...authHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auto_repair: options?.autoRepair ?? true,
        async: false,
      }),
    },
  );

  return data;
}

export async function fetchPaystackOnboarding(token: string | null): Promise<PaystackOnboardingPayload> {
  const { data } = await requestJson<PaystackOnboardingPayload>(
    `${API_BASE}/me/paystack/onboarding`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data;
}

export async function fetchPaystackAccountNumber(token: string | null): Promise<string> {
  const { data } = await requestJson<{ account_number: string }>(
    `${API_BASE}/me/paystack/account_number`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data.account_number;
}

export async function completePaystackOnboarding(
  token: string | null,
  payload: CompletePaystackOnboardingPayload,
  idempotencyKey: string = createIdempotencyKey(),
): Promise<{ onboarding: PaystackOnboarding; tribe: Tribe; market: PaystackMarket; banks: PaystackBank[] }> {
  try {
    const { data } = await requestJson<{
      onboarding: PaystackOnboarding;
      tribe: Tribe;
      market: PaystackMarket;
      banks: PaystackBank[];
    }>(
      `${API_BASE}/me/paystack/onboarding`,
      {
        method: "POST",
        cachePolicy: "noStore",
        headers: {
          ...authHeaders(token),
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ onboarding: payload }),
      },
    );

    return {
      onboarding: data.onboarding,
      tribe: data.tribe,
      market: data.market,
      banks: data.banks ?? [],
    };
  } catch (error) {
    if (!isCheckoutStillProcessing(getDisplayMessage(error))) {
      throw error;
    }

    const polled = await pollPaystackOnboardingComplete(token);
    const profile = await fetchMyProfile(token);

    return {
      onboarding: polled.onboarding,
      tribe: profile,
      market: polled.market,
      banks: polled.banks,
    };
  }
}

export { API_BASE };
