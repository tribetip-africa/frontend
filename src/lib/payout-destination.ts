export function parsePayoutDestination(destination: string): {
  label: string | null;
  account: string;
} {
  const parts = destination.split("·").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      label: parts.slice(0, -1).join(" · "),
      account: parts[parts.length - 1]!,
    };
  }

  return { label: null, account: destination.trim() };
}

export function formatPayoutDestination(label: string | null, account: string): string {
  if (label) return `${label} · ${account}`;
  return account;
}
