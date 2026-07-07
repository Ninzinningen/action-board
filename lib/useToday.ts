"use client";

import { useEffect, useState } from "react";
import { today } from "./date";

// 「今日の日付」を保持し、日付が変わったら（開きっぱなしのタブでも）自動で更新する
export function useToday(): string {
  const [value, setValue] = useState(today());

  useEffect(() => {
    const interval = setInterval(() => {
      const current = today();
      setValue((prev) => (prev === current ? prev : current));
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return value;
}
