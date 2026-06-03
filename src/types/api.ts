export type Tribe = {
  id: string;
  email: string;
  username: string;
};

export type AuthResponse = {
  message: string;
  token?: string;
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
  email: string;
  password: string;
};

export type ApiError = {
  errors?: string[];
  error?: string;
};
