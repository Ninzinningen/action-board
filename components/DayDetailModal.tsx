"use client";

import { useEffect } from "react";
import type { DayHistoryEntry } from "@/lib/useHistory";
import { formatDuration } from "@/lib/duration";

function monthDay(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export function DayDetailModal({ entry, onClose }: { entry: DayHistoryEntry; onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const tagEntries = Object.entries(entry.tagBreakdown)
    .filter(([, seconds]) => seconds > 0)
    .sort(([, a], [, b]) => b - a);
  const maxTagSeconds = Math.max(1, ...tagEntries.map(([, seconds]) => seconds));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm max-h-[80vh] overflow-y-auto rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">{monthDay(entry.date)}の記録</h3>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-1">合計作業時間</p>
        <p className="text-2xl font-bold text-gray-100 mb-5">{formatDuration(entry.workSeconds)}</p>

        <p className="text-sm text-gray-400 mb-2">タグ別内訳</p>
        {tagEntries.length === 0 ? (
          <p className="text-sm text-gray-500 mb-5">記録がありません</p>
        ) : (
          <div className="flex flex-col gap-2 mb-5">
            {tagEntries.map(([tag, seconds]) => (
              <div key={tag} className="flex items-center gap-2">
                <span className="w-16 shrink-0 truncate text-sm text-gray-300">{tag}</span>
                <div className="h-3 flex-1 rounded bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded bg-emerald-500"
                    style={{ width: `${Math.max(4, (seconds / maxTagSeconds) * 100)}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right text-sm text-gray-400">
                  {formatDuration(seconds)}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-400 mb-2">達成した習慣</p>
        {entry.habitNames.length === 0 ? (
          <p className="text-sm text-gray-500">達成した習慣はありません</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {entry.habitNames.map((name) => (
              <li key={name} className="flex items-center gap-2 text-sm text-gray-200">
                <span className="text-emerald-400">✓</span>
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
