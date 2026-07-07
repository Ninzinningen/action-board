"use client";

import { useEffect, useRef, useState } from "react";
import { loadData, saveData } from "./storage";
import type { Todo } from "./types";

const STORAGE_KEY = "todos";

type TodoStore = { date: string; todos: Todo[] };

function carryOver(store: TodoStore, todayStr: string): Todo[] {
  if (store.date === todayStr) return store.todos;
  // 日付が変わっていた場合、完了済みタスクは消し、未完了タスクだけ持ち越す
  return store.todos.filter((t) => !t.done);
}

export function useTodos(todayStr: string) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const dateRef = useRef(todayStr);

  useEffect(() => {
    // サーバー側ではlocalStorageが無いため、マウント後に読み込んで反映する
    const store = loadData<TodoStore>(STORAGE_KEY, { date: todayStr, todos: [] });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodos(carryOver(store, todayStr));
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // アプリを開いたまま日付をまたいだ場合に、完了済みタスクを消して未完了を持ち越す
    if (dateRef.current !== todayStr) {
      dateRef.current = todayStr;
      setTodos((prev) => prev.filter((t) => !t.done));
    }
  }, [todayStr]);

  useEffect(() => {
    if (loaded) saveData(STORAGE_KEY, { date: todayStr, todos });
  }, [todos, todayStr, loaded]);

  function addTodo(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const todo: Todo = { id: crypto.randomUUID(), text: trimmed, done: false };
    setTodos((prev) => [...prev, todo]);
  }

  function removeTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleDone(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  return { todos, addTodo, removeTodo, toggleDone };
}
