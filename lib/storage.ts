const PREFIX = "actionboard:";

export function loadData<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(PREFIX + key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveData<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export type BackupFile = {
  app: "action-board";
  exportedAt: string;
  data: Record<string, unknown>;
};

export function exportAllData(): BackupFile {
  const data: Record<string, unknown> = {};
  if (typeof window !== "undefined") {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(PREFIX)) continue;
      try {
        data[key.slice(PREFIX.length)] = JSON.parse(window.localStorage.getItem(key)!);
      } catch {
        // 破損したエントリはスキップ
      }
    }
  }
  return { app: "action-board", exportedAt: new Date().toISOString(), data };
}

export function importAllData(data: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  for (const [key, value] of Object.entries(data)) {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  }
}
