export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function today(): string {
  return formatDate(new Date());
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function yesterdayOf(dateStr: string): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

// to - from の日数差（targetDateが未来ならプラス、過去ならマイナス）
export function daysBetween(fromStr: string, toStr: string): number {
  const from = parseDate(fromStr);
  const to = parseDate(toStr);
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}
