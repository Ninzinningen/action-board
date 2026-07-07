"use client";

import { useEffect, useState } from "react";
import { loadData, saveData } from "./storage";
import { yesterdayOf } from "./date";
import type { Habit } from "./types";

const STORAGE_KEY = "habits";

// 今日を含めて何日連続でチェックが続いているかを計算する
export function calcStreak(checkins: Record<string, boolean>, todayStr: string): number {
  let cursor = todayStr;
  if (!checkins[cursor]) {
    // 今日はまだチェックしていない場合、昨日までの連続記録を表示する
    // （日付が変わった直後にストリークが0に見えて達成感が消えるのを防ぐため）
    cursor = yesterdayOf(cursor);
  }

  let streak = 0;
  while (checkins[cursor]) {
    streak += 1;
    cursor = yesterdayOf(cursor);
  }
  return streak;
}

export function useHabits(todayStr: string) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // サーバー側ではlocalStorageが無いため、マウント後に読み込んで反映する
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHabits(loadData<Habit[]>(STORAGE_KEY, []));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveData(STORAGE_KEY, habits);
  }, [habits, loaded]);

  function addHabit(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: trimmed,
      createdAt: todayStr,
      checkins: {},
    };
    setHabits((prev) => [...prev, habit]);
  }

  function removeHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  function toggleToday(id: string) {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              checkins: { ...h.checkins, [todayStr]: !h.checkins[todayStr] },
            }
          : h
      )
    );
  }

  return {
    habits,
    addHabit,
    removeHabit,
    toggleToday,
    streakOf: (h: Habit) => calcStreak(h.checkins, todayStr),
  };
}
