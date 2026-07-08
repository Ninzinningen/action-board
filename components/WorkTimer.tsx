"use client";

import { Card } from "./Card";
import { usePomodoro } from "@/lib/usePomodoro";
import { formatCountdown, formatDuration } from "@/lib/duration";

const phaseLabel = {
  idle: "準備完了",
  paused: "一時停止中",
  work: "作業中",
  break: "休憩中",
} as const;

export function WorkTimer({ todayStr }: { todayStr: string }) {
  const {
    phase,
    status,
    remainingSeconds,
    workMinutes,
    breakMinutes,
    todayTotalSeconds,
    start,
    pause,
    reset,
    setWorkMinutes,
    setBreakMinutes,
  } = usePomodoro(todayStr);

  const label = status === "idle" ? phaseLabel.idle : status === "paused" ? phaseLabel.paused : phaseLabel[phase];
  const editable = status === "idle";

  return (
    <Card title="作業タイマー">
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-400">
          作業(分)
          <input
            type="number"
            min={1}
            value={workMinutes}
            disabled={!editable}
            onChange={(e) => setWorkMinutes(Math.max(1, Number(e.target.value)))}
            className="w-16 rounded-lg bg-gray-800 border border-gray-700 px-2 py-1 text-gray-100 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-400">
          休憩(分)
          <input
            type="number"
            min={1}
            value={breakMinutes}
            disabled={!editable}
            onChange={(e) => setBreakMinutes(Math.max(1, Number(e.target.value)))}
            className="w-16 rounded-lg bg-gray-800 border border-gray-700 px-2 py-1 text-gray-100 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-100 tabular-nums">
            {formatCountdown(remainingSeconds)}
          </p>
          <p className="text-sm text-gray-500 mt-1">今日の合計 {formatDuration(todayTotalSeconds)}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            onClick={status === "running" ? pause : start}
            className={
              status === "running"
                ? "rounded-lg bg-gray-700 hover:bg-gray-600 px-4 py-2 font-medium"
                : "rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-medium"
            }
          >
            {status === "running" ? "一時停止" : status === "paused" ? "再開" : "スタート"}
          </button>
          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-gray-300 px-2 py-1"
          >
            リセット
          </button>
        </div>
      </div>
    </Card>
  );
}
