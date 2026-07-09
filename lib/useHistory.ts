"use client";

import { useEffect, useState } from "react";
import { loadData } from "./storage";
import type { Habit } from "./types";

const POLL_INTERVAL_MS = 3000;

export type DayHistoryEntry = {
  date: string; // "YYYY-MM-DD"
  workSeconds: number;
  habitsCompleted: number;
  habitNames: string[]; // 達成した習慣の名前一覧
  tagBreakdown: Record<string, number>; // タグ -> 作業秒数
};

export function useHistoryData() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [workTotals, setWorkTotals] = useState<Record<string, number>>({});
  const [tagTotals, setTagTotals] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    function load() {
      setHabits(loadData<Habit[]>("habits", []));
      const workData = loadData<{
        totalsByDate?: Record<string, number>;
        tagTotalsByDate?: Record<string, Record<string, number>>;
      }>("workTimer", {});
      setWorkTotals(workData.totalsByDate ?? {});
      setTagTotals(workData.tagTotalsByDate ?? {});
    }
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  function getEntry(date: string): DayHistoryEntry {
    const habitNames = habits.filter((h) => h.checkins[date]).map((h) => h.name);
    return {
      date,
      workSeconds: workTotals[date] ?? 0,
      habitsCompleted: habitNames.length,
      habitNames,
      tagBreakdown: tagTotals[date] ?? {},
    };
  }

  const maxWorkSeconds = Math.max(0, ...Object.values(workTotals));

  return { getEntry, maxWorkSeconds };
}
