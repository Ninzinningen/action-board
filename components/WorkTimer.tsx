"use client";

import { useState } from "react";
import { Card } from "./Card";
import { usePomodoro } from "@/lib/usePomodoro";
import { formatCountdown, formatDuration } from "@/lib/duration";

const phaseLabel = {
  idle: "準備完了",
  paused: "一時停止中",
  work: "作業中",
  break: "休憩中",
  longBreak: "長休憩中",
} as const;

export function WorkTimer({ todayStr }: { todayStr: string }) {
  const {
    phase,
    status,
    remainingSeconds,
    workMinutes,
    breakMinutes,
    longBreakMinutes,
    longBreakEnabled,
    longBreakInterval,
    totalSets,
    allSetsFinished,
    todayTotalSeconds,
    todayCompletedSets,
    tags,
    activeTag,
    start,
    pause,
    reset,
    setWorkMinutes,
    setBreakMinutes,
    setLongBreakMinutes,
    setLongBreakEnabled,
    setLongBreakInterval,
    setTotalSets,
    addTag,
    removeTag,
    setActiveTag,
  } = usePomodoro(todayStr);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  const label =
    status === "idle"
      ? allSetsFinished
        ? "全セット完了"
        : phaseLabel.idle
      : status === "paused"
        ? phaseLabel.paused
        : phaseLabel[phase];
  const editable = status === "idle";
  const infinite = totalSets === 0;

  return (
    <Card
      title="作業タイマー"
      action={
        <button
          onClick={() => setSettingsOpen((open) => !open)}
          aria-label="設定"
          aria-expanded={settingsOpen}
          className="rounded-lg p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
        >
          ⚙
        </button>
      }
    >
      {settingsOpen && (
        <>
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

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              セット数
              <input
                type="number"
                min={1}
                value={infinite ? "" : totalSets}
                placeholder="∞"
                disabled={!editable || infinite}
                onChange={(e) => setTotalSets(Math.max(1, Number(e.target.value)))}
                className="w-16 rounded-lg bg-gray-800 border border-gray-700 px-2 py-1 text-gray-100 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={infinite}
                disabled={!editable}
                onChange={(e) => setTotalSets(e.target.checked ? 0 : 4)}
                className="accent-emerald-600"
              />
              無限に繰り返す
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={longBreakEnabled}
                disabled={!editable}
                onChange={(e) => setLongBreakEnabled(e.target.checked)}
                className="accent-emerald-600"
              />
              長休憩を入れる
            </label>
            {longBreakEnabled && (
              <>
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="number"
                    min={1}
                    value={longBreakInterval}
                    disabled={!editable}
                    onChange={(e) => setLongBreakInterval(Math.max(1, Number(e.target.value)))}
                    className="w-14 rounded-lg bg-gray-800 border border-gray-700 px-2 py-1 text-gray-100 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
                  />
                  セットごと
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  長休憩(分)
                  <input
                    type="number"
                    min={1}
                    value={longBreakMinutes}
                    disabled={!editable}
                    onChange={(e) => setLongBreakMinutes(Math.max(1, Number(e.target.value)))}
                    className="w-16 rounded-lg bg-gray-800 border border-gray-700 px-2 py-1 text-gray-100 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
                  />
                </label>
              </>
            )}
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">タグを管理</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-gray-800 border border-gray-700 pl-3 pr-1 py-1 text-xs text-gray-300"
                >
                  {tag}
                  {tags.length > 1 && (
                    <button
                      onClick={() => removeTag(tag)}
                      disabled={!editable}
                      aria-label={`${tag}を削除`}
                      className="rounded-full px-1.5 text-gray-500 hover:text-red-400 disabled:opacity-40"
                    >
                      ✕
                    </button>
                  )}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newTag}
                disabled={!editable}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTag(newTag);
                    setNewTag("");
                  }
                }}
                placeholder="新しいタグを入力"
                className="flex-1 min-w-0 rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
              />
              <button
                onClick={() => {
                  addTag(newTag);
                  setNewTag("");
                }}
                disabled={!editable}
                className="shrink-0 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 px-3 py-1.5 text-sm font-medium"
              >
                追加
              </button>
            </div>
          </div>
        </>
      )}

      <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        タグ
        <select
          value={activeTag}
          disabled={!editable}
          onChange={(e) => setActiveTag(e.target.value)}
          className="rounded-lg bg-gray-800 border border-gray-700 px-2 py-1 text-gray-100 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
        >
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-100 tabular-nums">
            {formatCountdown(remainingSeconds)}
          </p>
          <p className="text-sm text-gray-500 mt-1">今日の合計 {formatDuration(todayTotalSeconds)}</p>
          <p className="text-sm text-gray-500">今日の完了セット数 {todayCompletedSets}</p>
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
