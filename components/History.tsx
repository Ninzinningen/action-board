"use client";

import { useMemo, useState } from "react";
import { Card } from "./Card";
import { useHistoryData } from "@/lib/useHistory";
import { formatDuration } from "@/lib/duration";
import { addMonths, daysInMonth, firstWeekdayOfMonth, parseDate, type YearMonth } from "@/lib/date";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function monthDay(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function dateOf({ year, month }: YearMonth, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function styleForSeconds(seconds: number, maxSeconds: number): { bg: string; text: string } {
  if (seconds <= 0) return { bg: "bg-gray-800/40", text: "text-gray-500" };
  const ratio = maxSeconds > 0 ? seconds / maxSeconds : 0;
  if (ratio <= 0.25) return { bg: "bg-emerald-950", text: "text-gray-300" };
  if (ratio <= 0.5) return { bg: "bg-emerald-800", text: "text-gray-100" };
  if (ratio <= 0.75) return { bg: "bg-emerald-600", text: "text-gray-950" };
  return { bg: "bg-emerald-400", text: "text-gray-950" };
}

export function History({ todayStr }: { todayStr: string }) {
  const { getEntry, maxWorkSeconds } = useHistoryData();

  const currentYearMonth = useMemo<YearMonth>(() => {
    const d = parseDate(todayStr);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }, [todayStr]);

  const [visible, setVisible] = useState<YearMonth>(currentYearMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const isCurrentMonth = visible.year === currentYearMonth.year && visible.month === currentYearMonth.month;
  const numDays = daysInMonth(visible);
  const leadingBlanks = firstWeekdayOfMonth(visible);

  const cells: (string | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: numDays }, (_, i) => dateOf(visible, i + 1)),
  ];

  const selectedEntry = selectedDate ? getEntry(selectedDate) : null;

  return (
    <Card title="振り返り">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setVisible((v) => addMonths(v, -1))}
          aria-label="前の月"
          className="rounded-lg px-2 py-1 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
        >
          ←
        </button>
        <p className="text-sm font-medium text-gray-300">
          {visible.year}年{visible.month}月
        </p>
        <button
          onClick={() => setVisible((v) => addMonths(v, 1))}
          disabled={isCurrentMonth}
          aria-label="次の月"
          className="rounded-lg px-2 py-1 text-gray-400 hover:text-gray-100 hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="text-center text-[10px] text-gray-500">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;
          const entry = getEntry(date);
          const dayNum = Number(date.slice(-2));
          const { bg, text } = styleForSeconds(entry.workSeconds, maxWorkSeconds);
          const isToday = date === todayStr;
          const isSelected = date === selectedDate;

          return (
            <button
              key={date}
              onClick={() => setSelectedDate((prev) => (prev === date ? null : date))}
              className={`group relative aspect-square rounded-md text-[10px] flex items-center justify-center transition hover:ring-1 hover:ring-gray-400 ${bg} ${text} ${
                isToday ? "ring-1 ring-emerald-400" : ""
              } ${isSelected ? "ring-2 ring-gray-100" : ""}`}
            >
              {dayNum}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100 group-hover:block">
                {monthDay(date)}: {formatDuration(entry.workSeconds)} ・ 習慣{entry.habitsCompleted}件
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 min-h-[1.25rem] text-sm text-gray-400">
        {selectedEntry
          ? `${monthDay(selectedEntry.date)}: ${formatDuration(selectedEntry.workSeconds)} ・ 習慣${selectedEntry.habitsCompleted}件`
          : "日付をタップすると詳細が表示されます"}
      </p>
    </Card>
  );
}
