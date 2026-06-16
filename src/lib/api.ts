import { createIdempotencyKey } from "@/lib/idempotency-key";
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
} from "@/types/api";
import {
  TribetipAuthError,
  TribetipNetworkError,
  getDisplayMessage,
  handleRequest,
  parseApiErrorBody,
} from "@/lib/errors";
import { getApiBaseUrl } from "@/lib/platform";
import { secureFetch } from "@/lib/secure-fetch";

const API_BASE = getApiBaseUrl();

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

async function requestJson<T>(
  input: string,
  init: Parameters<typeof secureFetch>[1] = {},
): Promise<{ response: Response; data: T }> {
  return handleRequest(async () => {
    let response: Response;

    try {
      response = await secureFetch(input, init);
    } catch (error) {
      throw new TribetipNetworkError(undefined, error);
    }

    const data = await parseJson<T & Record<string, unknown>>(response);
    if (!response.ok) {
      throw parseApiErrorBody(response.status, data);
    }

    return { response, data };
  }, { url: input, method: init.method ?? "GET" });
}

function parseBearerToken(authorization: string | null): string | null {
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice("Bearer ".length);
}

function extractToken(response: Response, data: AuthResponse): string | null {
  if (data.token) return data.token;
  return parseBearerToken(response.headers.get("Authorization"));
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
      cachePolicy: "noStore",
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

export async function fetchMyShareLink(authToken: string): Promise<ShareLinkPayload> {
  const { data } = await requestJson<{ share_link: ShareLinkPayload }>(
    `${API_BASE}/me/share_link`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(authToken),
    },
  );

  return data.share_link;
}

export async function rotateMyShareLink(authToken: string): Promise<ShareLinkPayload> {
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
    token: extractToken(response, data as AuthResponse),
  };
}

export async function signIn(
  payload: SignInPayload,
): Promise<{ data: AuthResponse; token: string }> {
  const { response, data } = await requestJson<AuthResponse>(
    `${API_BASE}/tribes/sign_in.json`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ tribe: payload }),
    },
  );

  const token = extractToken(response, data as AuthResponse);
  if (!token) {
    throw new TribetipAuthError(
      "No authentication token returned. Restart the Rails API so CORS exposes Authorization, or ensure sign-in returns token in JSON.",
    );
  }

  return { data: data as AuthResponse, token };
}

export async function signOut(token: string): Promise<void> {
  await requestJson<Record<string, unknown>>(`${API_BASE}/tribes/sign_out.json`, {
    method: "DELETE",
    cachePolicy: "noStore",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

function authHeaders(token: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchMyProfile(token: string): Promise<CreatorProfile> {
  const { data } = await requestJson<{ profile: CreatorProfile }>(`${API_BASE}/me/profile`, {
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });

  return data.profile;
}

export async function updateMyProfile(
  token: string,
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

export async function publishMyProfile(token: string): Promise<CreatorProfile> {
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
};

type CreateTipOptions = {
  idempotencyKey?: string;
  onCheckoutPolling?: () => void;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function pollPaystackOnboardingComplete(
  token: string,
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

export async function fetchMyTips(token: string): Promise<Tip[]> {
  const { data } = await requestJson<{ tips: Tip[] }>(`${API_BASE}/me/tips`, {
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });

  return data.tips;
}

type AdminTribesQuery = {
  q?: string;
  limit?: number;
  offset?: number;
};

export async function fetchAdminTribes(
  token: string,
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

export async function suspendAdminTribe(token: string, tribeId: string): Promise<AdminTribeSummary> {
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

export async function activateAdminTribe(token: string, tribeId: string): Promise<AdminTribeSummary> {
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
  token: string,
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
  token: string,
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
  token: string,
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
  token: string,
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
  token: string,
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
  token: string,
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
  token: string,
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
  token: string,
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

export async function markAllCreatorNotificationsRead(token: string): Promise<void> {
  await requestJson(`${API_BASE}/me/notifications/read_all`, {
    method: "PATCH",
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });
}

export async function fetchPaystackWithdrawals(
  token: string,
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

export async function createPaystackWithdrawal(token: string): Promise<{
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

export async function repairPaystackData(token: string): Promise<PaystackRepairPayload> {
  const { data } = await requestJson<PaystackRepairPayload>(`${API_BASE}/me/paystack/repair`, {
    method: "POST",
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });

  return data;
}

export async function reconcileMyTip(token: string, tipId: string): Promise<Tip> {
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
  token: string,
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
  token: string,
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

export async function fetchPaystackOnboarding(token: string): Promise<PaystackOnboardingPayload> {
  const { data } = await requestJson<PaystackOnboardingPayload>(
    `${API_BASE}/me/paystack/onboarding`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data;
}

export async function completePaystackOnboarding(
  token: string,
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
