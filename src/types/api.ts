export type Tribe = {
  id: string;
  email: string;
  username: string;
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
