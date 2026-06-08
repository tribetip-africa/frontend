export function maskAccountNumber(value: string | undefined | null): string {
  if (!value?.trim()) {
    return "•••• •••• •••• ••••";
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) {
    return "•••• •••• •••• ••••";
  }

  if (digits.length <= 4) {
    return `•••• ${digits}`;
  }

  return `•••• •••• •••• ${digits.slice(-4)}`;
}
