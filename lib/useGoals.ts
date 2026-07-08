"use client";

import { useEffect, useState } from "react";
import { loadData, saveData } from "./storage";
import type { GoalStage, Goals } from "./types";

const STORAGE_KEY = "goals";

const emptyGoal = () => ({ text: "", achieved: false });

const defaultGoals: Goals = {
  year: emptyGoal(),
  halfYear: emptyGoal(),
  threeMonths: emptyGoal(),
  oneMonth: emptyGoal(),
};

export function useGoals() {
  const [goals, setGoals] = useState<Goals>(defaultGoals);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // サーバー側ではlocalStorageが無いため、マウント後に読み込んで反映する
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGoals(loadData<Goals>(STORAGE_KEY, defaultGoals));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveData(STORAGE_KEY, goals);
  }, [goals, loaded]);

  function setText(stage: GoalStage, text: string) {
    setGoals((prev) => ({ ...prev, [stage]: { ...prev[stage], text } }));
  }

  function toggleAchieved(stage: GoalStage) {
    setGoals((prev) => ({
      ...prev,
      [stage]: { ...prev[stage], achieved: !prev[stage].achieved },
    }));
  }

  return { goals, setText, toggleAchieved };
}
