"use client";

import { useState } from "react";
import { Card } from "./Card";
import { useTodos } from "@/lib/useTodos";

export function TodoList({ todayStr }: { todayStr: string }) {
  const { todos, addTodo, removeTodo, toggleDone } = useTodos(todayStr);
  const [text, setText] = useState("");

  function handleAdd() {
    addTodo(text);
    setText("");
  }

  return (
    <Card title="今日のToDo">
      <div className="flex gap-2 mb-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="今日やることを入力"
          className="flex-1 min-w-0 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={handleAdd}
          className="shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-medium"
        >
          追加
        </button>
      </div>

      {todos.length === 0 ? (
        <p className="text-gray-500 text-sm">タスクがありません。上から追加してください。</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-start gap-3 rounded-xl bg-gray-800/60 px-3 py-3"
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleDone(todo.id)}
                className="h-6 w-6 shrink-0 mt-0.5 accent-emerald-500"
                aria-label={`${todo.text} を完了にする`}
              />
              <span
                className={`flex-1 min-w-0 break-words ${
                  todo.done ? "line-through text-gray-500" : "text-gray-100"
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => removeTodo(todo.id)}
                aria-label={`${todo.text} を削除`}
                className="shrink-0 text-gray-500 hover:text-red-400 px-2 py-1"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
