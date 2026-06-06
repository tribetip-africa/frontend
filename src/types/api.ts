export type Tribe = {
  id: string;
  email: string;
  username: string;
  role: "creator" | "admin";
  account_status: "pending" | "active" | "suspended";
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

export type CreatorProfile = Tribe & {
  display_name: string | null;
  bio: string | null;
  country_code: string;
  currency: string;
  default_tip_amount_cents: number;
  is_profile_public: boolean;
};

export type UpdateProfilePayload = {
  display_name?: string;
  bio?: string;
  country_code?: string;
  currency?: string;
  default_tip_amount_cents?: number;
};

export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

/** Supports legacy and structured API error bodies. */
export type ApiError = {
  errors?: string[];
  error?: string | ApiErrorPayload;
};
