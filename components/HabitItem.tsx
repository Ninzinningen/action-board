import type { Habit } from "@/lib/types";

export function HabitItem({
  habit,
  checkedToday,
  streak,
  onToggle,
  onRemove,
}: {
  habit: Habit;
  checkedToday: boolean;
  streak: number;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-start gap-3 rounded-xl bg-gray-800/60 px-3 py-3">
      <input
        type="checkbox"
        checked={checkedToday}
        onChange={onToggle}
        className="h-6 w-6 shrink-0 mt-0.5 accent-emerald-500"
        aria-label={`${habit.name} を今日達成した`}
      />
      <span className="flex-1 min-w-0 break-words text-gray-100">{habit.name}</span>
      <span className="shrink-0 text-sm text-orange-400 whitespace-nowrap mt-0.5">
        🔥 {streak}日
      </span>
      <button
        onClick={onRemove}
        aria-label={`${habit.name} を削除`}
        className="shrink-0 text-gray-500 hover:text-red-400 px-2 py-1"
      >
        ✕
      </button>
    </li>
  );
}
