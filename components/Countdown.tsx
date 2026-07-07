"use client";

import { Card } from "./Card";
import { useCountdown } from "@/lib/useCountdown";
import { daysBetween } from "@/lib/date";

export function Countdown({ todayStr }: { todayStr: string }) {
  const { target, setLabel, setTargetDate } = useCountdown(todayStr);
  const remaining = daysBetween(todayStr, target.targetDate);

  let bigText: string;
  let sub: string;
  if (remaining > 0) {
    bigText = `${remaining}`;
    sub = "日";
  } else if (remaining === 0) {
    bigText = "本日";
    sub = "が目標日です";
  } else {
    bigText = `${Math.abs(remaining)}`;
    sub = "日経過しました";
  }

  return (
    <Card title="目標日カウントダウン">
      <div className="flex flex-col items-center text-center py-4">
        {target.label && <p className="text-gray-300 mb-1">{target.label}</p>}
        <p className="leading-none">
          <span className="text-6xl sm:text-7xl font-bold text-emerald-400 tabular-nums">
            {bigText}
          </span>
          <span className="ml-2 text-xl text-gray-300">{sub}</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <input
          value={target.label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="目標の名前（任意）"
          className="flex-1 min-w-0 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
        <input
          type="date"
          value={target.targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100 focus:outline-none focus:border-emerald-500"
        />
      </div>
    </Card>
  );
}
