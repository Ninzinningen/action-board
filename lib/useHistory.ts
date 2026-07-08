"use client";

import { useEffect, useState } from "react";
import { loadData } from "./storage";
import { yesterdayOf } from "./date";
import type { Habit } from "./types";

const DAYS = 14;
const POLL_INTERVAL_MS = 3000;

export type DayHistoryEntry = {
  date: string; // "YYYY-MM-DD"
  workSeconds: number;
  habitsCompleted: number;
};

export function useHistory(todayStr: string): DayHistoryEntry[] {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [workTotals, setWorkTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    function load() {
      setHabits(loadData<Habit[]>("habits", []));
      const workData = loadData<{ totalsByDate?: Record<string, number> }>("workTimer", {});
      setWorkTotals(workData.totalsByDate ?? {});
    }
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const entries: DayHistoryEntry[] = [];
  let cursor = todayStr;
  for (let i = 0; i < DAYS; i++) {
    entries.unshift({
      date: cursor,
      workSeconds: workTotals[cursor] ?? 0,
      habitsCompleted: habits.filter((h) => h.checkins[cursor]).length,
    });
    cursor = yesterdayOf(cursor);
  }
  return entries;
}
