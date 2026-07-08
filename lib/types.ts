export type Habit = {
  id: string;
  name: string;
  createdAt: string; // "YYYY-MM-DD"
  checkins: Record<string, boolean>; // 日付("YYYY-MM-DD") -> 達成したかどうか
};

export type CountdownTarget = {
  label: string;
  targetDate: string; // "YYYY-MM-DD"
};

export type Todo = {
  id: string;
  text: string;
  done: boolean;
};

export type PomodoroPhase = "work" | "break";

export type PomodoroState = {
  workMinutes: number; // 作業時間設定(分)
  breakMinutes: number; // 休憩時間設定(分)
  totalsByDate: Record<string, number>; // 日付("YYYY-MM-DD") -> 実際に作業した秒数の累計
};

export type GoalStage = "year" | "halfYear" | "threeMonths" | "oneMonth";

export type Goal = {
  text: string;
  achieved: boolean;
};

export type Goals = Record<GoalStage, Goal>;
