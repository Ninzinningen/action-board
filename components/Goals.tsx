"use client";

import { Card } from "./Card";
import { useGoals } from "@/lib/useGoals";
import type { GoalStage } from "@/lib/types";

const STAGES: { key: GoalStage; label: string }[] = [
  { key: "year", label: "1年後" },
  { key: "halfYear", label: "半年後" },
  { key: "threeMonths", label: "3ヶ月後" },
  { key: "oneMonth", label: "1ヶ月後" },
];

export function Goals() {
  const { goals, setText, toggleAchieved } = useGoals();

  return (
    <Card title="目標設定">
      <ul className="flex flex-col gap-2">
        {STAGES.map(({ key, label }) => {
          const goal = goals[key];
          const filled = goal.text.trim().length > 0;
          return (
            <li
              key={key}
              className={
                filled
                  ? "flex items-start gap-3 rounded-xl border border-gray-700 bg-gray-800/60 px-3 py-3"
                  : "flex items-start gap-3 rounded-xl border border-dashed border-gray-800 px-3 py-3"
              }
            >
              <input
                type="checkbox"
                checked={goal.achieved}
                disabled={!filled}
                onChange={() => toggleAchieved(key)}
                className="h-5 w-5 shrink-0 mt-0.5 accent-emerald-500 disabled:opacity-30"
                aria-label={`${label}の目標を達成した`}
              />
              <div className="flex-1 min-w-0">
                <p className={filled ? "text-xs text-gray-400" : "text-xs text-gray-600"}>{label}</p>
                <input
                  value={goal.text}
                  onChange={(e) => setText(key, e.target.value)}
                  placeholder="目標を入力(任意)"
                  className={
                    goal.achieved
                      ? "w-full bg-transparent text-gray-500 line-through placeholder-gray-600 focus:outline-none"
                      : "w-full bg-transparent text-gray-100 placeholder-gray-600 focus:outline-none"
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
