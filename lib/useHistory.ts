"use client";

import { useEffect, useState } from "react";
import { loadData } from "./storage";
import type { Habit } from "./types";

const POLL_INTERVAL_MS = 3000;

export type DayHistoryEntry = {
  date: string; // "YYYY-MM-DD"
  workSeconds: number;
  habitsCompleted: number;
};

export function useHistoryData() {
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

  function getEntry(date: string): DayHistoryEntry {
    return {
      date,
      workSeconds: workTotals[date] ?? 0,
      habitsCompleted: habits.filter((h) => h.checkins[date]).length,
    };
  }

  const maxWorkSeconds = Math.max(0, ...Object.values(workTotals));

  return { getEntry, maxWorkSeconds };
}
