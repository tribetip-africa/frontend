export type Tribe = {
  id: string;
  email: string;
  username: string;
  role: "creator" | "admin";
  account_status: "pending" | "active" | "suspended";
  paystack_onboarding: PaystackOnboarding;
  public_page_shareable?: boolean;
};

export type PaystackVerificationCheck = {
  name: string;
  status: "ok" | "missing" | "failed" | "skipped" | string;
  message: string;
};

export type PaystackOnboarding = {
  customer_ready: boolean;
  subaccount_ready: boolean;
  complete: boolean;
  subaccount_verified?: boolean;
  market?: PaystackMarket;
  verification?: PaystackVerificationCheck[];
  provisioning_error?: string | null;
  payout?: PaystackPayoutStatus;
};

export type PaystackPayoutStatus = {
  subaccount_verified: boolean;
  settlement_bank?: string;
  account_number?: string;
  account_name?: string;
  settlement_schedule?: string;
  pending_settlement_cents?: number;
  total_transactions?: number;
  total_volume_cents?: number;
  currency?: string;
  can_publish?: boolean;
  publish_blocker?: string;
};

export type PaystackBank = {
  name: string;
  code: string;
  type?: string;
  currency?: string;
  mobile_money?: boolean;
};

export type PaystackMarket = {
  country_code: string;
  name: string;
  currency: string;
  paystack_bank_country: string;
  subaccount_supported: boolean;
};

export type PaystackOnboardingPayload = {
  onboarding: PaystackOnboarding;
  payout?: PaystackPayoutStatus;
  market: PaystackMarket;
  banks: PaystackBank[];
};

export type AdminOverview = {
  total_tribes: number;
  active_tribes: number;
  suspended_tribes: number;
  pending_tribes: number;
  published_profiles: number;
  admins: number;
  creators: number;
  total_tips: number;
  paid_tips: number;
  pending_tips: number;
  failed_tips: number;
  paid_volume_cents: Record<string, number>;
  pending_volume_cents: Record<string, number>;
  onboarding_complete: number;
  payout_linked: number;
  payout_customers: number;
  tips_last_30_days: number;
  volume_last_30_days_cents: Record<string, number>;
};

export type AdminTribeSummary = {
  id: string;
  username: string;
  email: string;
  role: Tribe["role"];
  account_status: Tribe["account_status"];
  is_profile_public: boolean;
  paystack_onboarding_complete: boolean;
  paystack_customer_ready: boolean;
  paystack_subaccount_ready: boolean;
  paid_tips_count: number;
  pending_tips_count: number;
  total_earned_cents: number;
  pending_tips_cents: number;
  currency: string;
  created_at: string;
};

export type AdminTribesResponse = {
  overview: AdminOverview;
  tribes: AdminTribeSummary[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
};

export type AdminPaystackEvent = {
  id: string;
  event_id: string;
  event_type: string;
  status: "pending" | "processing" | "processed" | "failed";
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
  paystack_reference: string | null;
};

export type AdminPaystackEventsResponse = {
  events: AdminPaystackEvent[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
};

export type PaystackAuditReport = {
  username: string;
  healthy: boolean;
  customer_ready: boolean;
  subaccount_ready: boolean;
  onboarding_complete: boolean;
  checks: PaystackVerificationCheck[];
};

export type AuthResponse = {
  message: string;
  token?: string;
  confirmation_required?: boolean;
  tribe: Tribe;
};

export type SignUpPayload = {
  email: string;
  password: string;
  password_confirmation: string;
  username: string;
  country_code?: string;
  currency?: string;
};

export type SignInPayload = {
  login: string;
  password: string;
};

export type CreatorMetrics = {
  paid_tips_count: number;
  pending_tips_count: number;
  failed_tips_count: number;
  total_earned_cents: number;
  pending_tips_cents: number;
  tips_last_30_days_count: number;
  tips_last_30_days_cents: number;
  last_paid_at?: string | null;
  currency: string;
  pending_settlement_cents?: number;
  subaccount_verified?: boolean;
};

export type CreatorProfile = Tribe & {
  display_name: string | null;
  bio: string | null;
  country_code: string;
  currency: string;
  default_tip_amount_cents: number;
  is_profile_public: boolean;
  metrics?: CreatorMetrics;
};

export type UpdateProfilePayload = {
  display_name?: string;
  bio?: string;
  country_code?: string;
  currency?: string;
  default_tip_amount_cents?: number;
};

export type TipStatus = "pending" | "paid" | "failed";

export type TipCheckoutStatus = "processing" | "ready" | "failed";

export type TipPaidVia = "webhook" | "reconcile" | "sweep";

export type Tip = {
  id: string;
  tribe_id: string;
  amount_cents: number;
  currency: string;
  status: TipStatus;
  paystack_reference: string;
  supporter_email: string;
  supporter_name: string | null;
  message: string | null;
  paid_at: string | null;
  paid_via?: TipPaidVia | null;
  failed_reason?: string | null;
  created_at: string;
  authorization_url?: string;
  checkout_status?: TipCheckoutStatus;
};

export type TipAuditEvent = {
  id: string;
  tip_id: string;
  paystack_event_id: string | null;
  action: string;
  from_status: string | null;
  to_status: string | null;
  source: string;
  actor_id: string | null;
  paystack_reference: string;
  paid_via?: TipPaidVia | null;
  failed_reason?: string | null;
  verification: Record<string, unknown>;
  metadata: Record<string, unknown>;
  request_id: string | null;
  ip: string | null;
  created_at: string;
};

export type TipInvestigation = {
  tip: Tip & {
    tribe_username: string;
    last_paystack_event_id?: string | null;
    paystack_metadata?: Record<string, unknown>;
    updated_at: string;
  };
  tip_events: TipAuditEvent[];
  paystack_events: Array<{
    id: string;
    event_id: string;
    event_type: string;
    status: string;
    tip_id: string | null;
    error_message: string | null;
    processed_at: string | null;
    created_at: string;
    paystack_reference: string | null;
  }>;
  tribe_versions: Array<{
    id: number;
    event: string;
    whodunnit: string | null;
    object_changes: string | null;
    request_id: string | null;
    ip: string | null;
    created_at: string;
  }>;
  admin_audit_logs: Array<{
    id: string;
    admin_id: string;
    action: string;
    target_type: string;
    target_id: string;
    details: Record<string, unknown>;
    request_id: string | null;
    ip: string | null;
    user_agent: string | null;
    created_at: string;
  }>;
};

export type CreateTipPayload = {
  username: string;
  amount_cents: number;
  currency?: string;
  supporter_email: string;
  supporter_name?: string;
  message?: string;
};
