"use client";

import { Card } from "./Card";
import { useHistory } from "@/lib/useHistory";
import { formatDuration } from "@/lib/duration";

const BAR_AREA_HEIGHT = 80;

function monthDay(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export function History({ todayStr }: { todayStr: string }) {
  const entries = useHistory(todayStr);
  const maxSeconds = Math.max(1, ...entries.map((e) => e.workSeconds));

  return (
    <Card title="振り返り">
      <div className="overflow-x-auto">
        <div className="flex min-w-max items-end gap-2">
          {entries.map((entry) => {
            const pct = entry.workSeconds > 0 ? Math.max(4, (entry.workSeconds / maxSeconds) * 100) : 0;
            return (
              <div key={entry.date} className="group relative flex w-14 shrink-0 flex-col items-center gap-1">
                <span className="h-3 whitespace-nowrap text-[9px] text-gray-300">
                  {entry.workSeconds > 0 ? formatDuration(entry.workSeconds) : ""}
                </span>
                <div
                  className="relative w-6 rounded-t bg-gray-800/40"
                  style={{ height: BAR_AREA_HEIGHT }}
                >
                  {entry.habitsCompleted > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-gray-700 px-1 text-[8px] leading-tight text-gray-300">
                      {entry.habitsCompleted}
                    </span>
                  )}
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-t bg-emerald-600"
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500">{monthDay(entry.date)}</span>

                <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100 group-hover:block">
                  {monthDay(entry.date)}: {formatDuration(entry.workSeconds)} ・ 習慣{entry.habitsCompleted}件
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
