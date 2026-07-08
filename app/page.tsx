"use client";

import { Countdown } from "@/components/Countdown";
import { HabitTracker } from "@/components/HabitTracker";
import { TodoList } from "@/components/TodoList";
import { WorkTimer } from "@/components/WorkTimer";
import { useToday } from "@/lib/useToday";

export default function Home() {
  const todayStr = useToday();

  return (
    <div className="flex flex-1 justify-center bg-gray-950">
      <main className="w-full max-w-md flex flex-col gap-4 px-4 py-6 sm:py-10">
        <header className="mb-2">
          <h1 className="text-xl font-bold text-gray-100">行動管理ボード</h1>
          <p className="text-sm text-gray-500">{todayStr}</p>
        </header>

        <Countdown todayStr={todayStr} />
        <TodoList todayStr={todayStr} />
        <WorkTimer todayStr={todayStr} />
        <HabitTracker todayStr={todayStr} />
      </main>
    </div>
  );
}
