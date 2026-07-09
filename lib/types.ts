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

export type PomodoroPhase = "work" | "break" | "longBreak";

export type PomodoroState = {
  workMinutes: number; // 作業時間設定(分)
  breakMinutes: number; // 休憩時間設定(分)
  longBreakMinutes: number; // 長休憩の時間設定(分)
  longBreakEnabled: boolean; // 長休憩を入れるかどうか
  longBreakInterval: number; // 何セットごとに長休憩を入れるか
  totalSets: number; // 目標セット数(0 = 無限に繰り返す)
  totalsByDate: Record<string, number>; // 日付("YYYY-MM-DD") -> 実際に作業した秒数の累計
  completedSetsByDate: Record<string, number>; // 日付("YYYY-MM-DD") -> 完了した作業セット数
};

export type GoalStage = "year" | "halfYear" | "threeMonths" | "oneMonth";

export type Goal = {
  text: string;
  achieved: boolean;
};

export type Goals = Record<GoalStage, Goal>;
