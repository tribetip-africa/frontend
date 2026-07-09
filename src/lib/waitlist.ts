const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type WaitlistPayload = {
  email: string;
  name?: string;
  country?: string;
  role?: string;
  source?: string;
  website?: string;
};

export function normalizeWaitlistPayload(input: WaitlistPayload) {
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() ?? "";
  const country = input.country?.trim().toUpperCase() ?? "";
  const role = input.role?.trim() ?? "";
  const source = input.source?.trim() ?? "waitlist-page";
  const website = input.website?.trim() ?? "";

  return { email, name, country, role, source, website };
}

export function validateWaitlistPayload(input: WaitlistPayload): string | null {
  const payload = normalizeWaitlistPayload(input);

  if (payload.website) {
    return "Unable to submit right now.";
  }

  if (!payload.email) {
    return "Email is required.";
  }

  if (!EMAIL_PATTERN.test(payload.email)) {
    return "Enter a valid email address.";
  }

  if (payload.name.length > 80) {
    return "Name is too long.";
  }

  if (payload.country && payload.country.length !== 2) {
    return "Use a two-letter country code.";
  }

  return null;
}
