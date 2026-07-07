"use client";

import { useState } from "react";
import { Card } from "./Card";
import { HabitItem } from "./HabitItem";
import { useHabits } from "@/lib/useHabits";

export function HabitTracker({ todayStr }: { todayStr: string }) {
  const { habits, addHabit, removeHabit, toggleToday, streakOf } = useHabits(todayStr);
  const [name, setName] = useState("");

  function handleAdd() {
    addHabit(name);
    setName("");
  }

  return (
    <Card title="習慣チェックリスト">
      <div className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="新しい習慣を入力"
          className="flex-1 min-w-0 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={handleAdd}
          className="shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-medium"
        >
          追加
        </button>
      </div>

      {habits.length === 0 ? (
        <p className="text-gray-500 text-sm">まだ習慣がありません。上から追加してください。</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              checkedToday={!!habit.checkins[todayStr]}
              streak={streakOf(habit)}
              onToggle={() => toggleToday(habit.id)}
              onRemove={() => {
                if (window.confirm(`「${habit.name}」を削除しますか？`)) {
                  removeHabit(habit.id);
                }
              }}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}
