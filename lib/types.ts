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
