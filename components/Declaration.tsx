"use client";

import { useState } from "react";
import { Card } from "./Card";
import { useDeclaration } from "@/lib/useDeclaration";

export function Declaration({ todayStr }: { todayStr: string }) {
  const { text, setText, hashtag, setHashtag } = useDeclaration(todayStr);
  const [open, setOpen] = useState(false);

  function handlePost() {
    const tweetText = [text.trim(), hashtag.trim()].filter(Boolean).join(" ");
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!open) {
    return (
      <div className="flex justify-center">
        <button
          onClick={() => setOpen(true)}
          className="rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-emerald-500 hover:text-gray-100"
        >
          今日の宣言をXでシェア
        </button>
      </div>
    );
  }

  return (
    <Card
      title="今日の宣言"
      action={
        <button
          onClick={() => setOpen(false)}
          aria-label="閉じる"
          className="rounded-lg p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
        >
          ✕
        </button>
      }
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="今日はこれをやる"
        className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 mb-2"
      />
      <div className="flex gap-2">
        <input
          value={hashtag}
          onChange={(e) => setHashtag(e.target.value)}
          placeholder="#ハッシュタグ"
          className="flex-1 min-w-0 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={handlePost}
          disabled={!text.trim()}
          className="shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 px-4 py-2 font-medium"
        >
          Xに投稿
        </button>
      </div>
    </Card>
  );
}
