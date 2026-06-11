const STORAGE_KEY = "tribetip_toast_notification_ids";

function readIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, 100)));
}

export function hasSeenNotificationToast(id: string): boolean {
  return readIds().includes(id);
}

export function markNotificationToastSeen(id: string) {
  const ids = readIds();
  if (ids.includes(id)) return;
  writeIds([id, ...ids]);
}
