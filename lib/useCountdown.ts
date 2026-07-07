"use client";

import { useEffect, useState } from "react";
import { loadData, saveData } from "./storage";
import type { CountdownTarget } from "./types";

const STORAGE_KEY = "countdown";

function defaultTarget(todayStr: string): CountdownTarget {
  return { label: "", targetDate: todayStr };
}

export function useCountdown(todayStr: string) {
  const [target, setTarget] = useState<CountdownTarget>(() => defaultTarget(todayStr));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // サーバー側ではlocalStorageが無いため、マウント後に読み込んで反映する
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTarget(loadData<CountdownTarget>(STORAGE_KEY, defaultTarget(todayStr)));
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loaded) saveData(STORAGE_KEY, target);
  }, [target, loaded]);

  function setLabel(label: string) {
    setTarget((prev) => ({ ...prev, label }));
  }

  function setTargetDate(targetDate: string) {
    setTarget((prev) => ({ ...prev, targetDate }));
  }

  return { target, setLabel, setTargetDate };
}
