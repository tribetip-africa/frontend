export type Tribe = {
  id: string;
  email: string;
  username: string;
  role: "creator" | "admin";
  account_status: "pending" | "active" | "suspended";
  referral_attached?: boolean;
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
  settlement_schedule_label?: string;
  pending_settlement_cents?: number;
  available_to_settle_cents?: number;
  total_transactions?: number;
  total_volume_cents?: number;
  currency?: string;
  can_publish?: boolean;
  publish_blocker?: string;
  refreshed_at?: string;
};

export type PaystackSettlement = {
  id: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "processing" | "success" | "failed" | "reversed" | string;
  settled_at?: string;
  destination?: string;
  reference?: string;
  source?: "sync" | "webhook" | "manual_withdrawal" | string;
  updated_at?: string;
  paystack_transfer_code?: string;
  tip_id?: string;
};

export type SettlementBreakdown = {
  gross_cents?: number;
  platform_fee_cents?: number;
  platform_fee_percent: number;
  referral_fee_credit_applied_cents?: number;
  net_cents: number;
  currency: string;
};

export type SettlementTipSummary = {
  id: string;
  paystack_reference: string;
  amount_cents: number;
  currency: string;
  supporter_email: string;
  supporter_name?: string | null;
  message?: string | null;
  paid_at?: string;
};

export type SettlementDetailPayload = {
  settlement: PaystackSettlement;
  breakdown: SettlementBreakdown;
  tip?: SettlementTipSummary;
};

export type CreatorNotification = {
  id: string;
  kind: "settlement_paid" | "settlement_failed" | string;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  read_at?: string | null;
  created_at: string;
};

export type CreatorNotificationsPayload = {
  notifications: CreatorNotification[];
  unread_count: number;
};

export type PaystackRepairResult = {
  settlements_synced_at?: string;
  settlements_count: number;
  settlement_summary?: SettlementSummary;
  tips_examined: number;
  tips_reconciled: number;
  tips_still_pending: number;
  payout?: PaystackPayoutStatus;
  earnings?: CreatorMetrics;
  refreshed_at?: string;
};

export type PaystackRepairPayload = {
  message: string;
  repair: PaystackRepairResult;
};

export type WithdrawalStatus = {
  payout_mode: "auto" | "manual" | "both" | string;
  configured_payout_mode?: "auto" | "manual" | "both" | string;
  effective_payout_mode?: "auto" | "manual" | "both" | string;
  transfers_supported?: boolean;
  business_tier?: "starter" | "registered" | "unknown" | string;
  auto_settlement_active?: boolean;
  available_to_withdraw_cents: number;
  min_withdrawal_cents: number;
  can_withdraw: boolean;
  withdraw_blocker?: string | null;
  destination?: string;
  currency: string;
  pending_withdrawal?: PaystackSettlement | null;
  cooldown_ends_at?: string | null;
};

export type PaystackWithdrawalsPayload = {
  status: WithdrawalStatus;
  withdrawals: PaystackSettlement[];
};

export type AdminPaystackRepairPayload = PaystackRepairPayload & {
  tribe_id: string;
  username: string;
};

export type PaymentAlert = {
  id: string;
  kind: string;
  severity: "warning" | "critical" | string;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  resolved_at?: string | null;
  created_at: string;
};

export type PaymentAlertsResponse = {
  alerts: PaymentAlert[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
};

export type PlatformReconciliationFinding = {
  kind: string;
  severity: string;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
};

export type PlatformReconciliationReport = {
  checked_at?: string;
  auto_repair?: boolean;
  repairs?: {
    pending_tips_reconciled: number;
    creators_synced: number;
  };
  summary?: {
    findings_count: number;
    critical_count: number;
    warning_count: number;
    creators_examined: number;
    tips_verified: number;
  };
  findings?: PlatformReconciliationFinding[];
  status?: string;
  message?: string;
};

export type PlatformReconciliationResponse = {
  reconciliation: PlatformReconciliationReport;
  message?: string;
  auto_repair?: boolean;
};

export type SettlementSummary = {
  total_settled_cents: number;
  successful_settlements_count: number;
  failed_settlements_count: number;
  last_settled_at?: string | null;
  currency: string;
};

export type PaystackSettlementsPayload = {
  settlements: PaystackSettlement[];
  summary?: SettlementSummary;
  source?: "database" | string;
  refreshed_at?: string;
  synced_at?: string;
};

export type AdminSettlementsPayload = PaystackSettlementsPayload & {
  tribe_id: string;
  username: string;
  summary?: SettlementSummary;
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
  mobile_money_supported?: boolean;
};

export type PaystackOnboardingPayload = {
  onboarding: PaystackOnboarding;
  payout?: PaystackPayoutStatus;
  market: PaystackMarket;
  banks: PaystackBank[];
  earnings?: CreatorMetrics;
  settlements_summary?: SettlementSummary;
  refreshed_at?: string;
};

export type AdminReconciliationOverview = {
  never_run: boolean;
  checked_at?: string;
  findings_count?: number;
  critical_count?: number;
  warning_count?: number;
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
  unresolved_payment_alerts?: number;
  failed_webhooks?: number;
  reconciliation?: AdminReconciliationOverview;
  referrals_pending?: number;
  referrals_qualified?: number;
  referrals_rewarded?: number;
  referrals_rejected?: number;
  referral_bonus_paid_cents?: Record<string, number>;
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
  csrf_token?: string;
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
  referral_code?: string;
  early_access_token?: string;
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
  referral_fee_credit_cents_remaining?: number;
  metrics?: CreatorMetrics;
};

export type UpdateProfilePayload = {
  display_name?: string;
  bio?: string;
  country_code?: string;
  currency?: string;
  default_tip_amount_cents?: number;
};

export type ReferralLink = {
  code: string | null;
  path: string | null;
  url: string | null;
  expires_at: string | null;
  kind: "invite";
  username_code: string;
};

export type ReferralInvitePayload = ReferralLink;

export type ReferralStats = {
  pending: number;
  qualified: number;
  rewarded: number;
  rejected: number;
  total: number;
};

export type ReferralQualification = {
  requires_onboarding: boolean;
  requires_first_paid_tip: boolean;
  min_tip_cents: number;
  referrer_bonus_cents: number;
  referred_fee_credit_cents: number;
  currency: string;
};

export type ReferralEntry = {
  username: string;
  status: "pending" | "qualified" | "rewarded" | "rejected";
  signed_up_at: string;
  qualified_at?: string | null;
  rewarded_at?: string | null;
};

export type ReferralsSummary = {
  referrals_enabled: boolean;
  program_enabled: boolean;
  link: ReferralLink;
  can_refer: boolean;
  stats: ReferralStats;
  qualification: ReferralQualification;
  fee_credit_cents_remaining: number;
  entries: ReferralEntry[];
};

export type ReferralsPayload = {
  referrals: ReferralsSummary;
};

export type AdminReferralSummary = {
  id: string;
  status: ReferralEntry["status"];
  referral_code_used: string;
  referrer_username: string;
  referred_username: string;
  signed_up_at: string;
  qualified_at?: string | null;
  rewarded_at?: string | null;
  referrer_bonus_cents?: number | null;
  referrer_bonus_currency?: string | null;
  qualifying_tip_reference?: string | null;
  metadata: Record<string, unknown>;
};

export type EarlyAccessInvitePayload = {
  id: string;
  email: string;
  token: string;
  path: string;
  url: string;
  expires_at: string;
  used_at?: string | null;
  revoked_at?: string | null;
  available: boolean;
};

export type EarlyAccessInvitePreview = {
  email: string;
  expires_at: string;
};

export type AdminReferralsOverview = {
  pending: number;
  qualified: number;
  rewarded: number;
  rejected: number;
  total: number;
  bonus_paid_cents: Record<string, number>;
};

export type AdminReferralsResponse = {
  overview: AdminReferralsOverview;
  referrals: AdminReferralSummary[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
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
  supporter_email?: string;
  supporter_name?: string | null;
  message?: string | null;
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
