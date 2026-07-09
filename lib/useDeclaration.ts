"use client";

import { useEffect, useRef, useState } from "react";
import { loadData, saveData } from "./storage";

const STORAGE_KEY = "declaration";
const DEFAULT_HASHTAG = "#今日の宣言";

type DeclarationStore = { date: string; text: string; hashtag: string };

export function useDeclaration(todayStr: string) {
  const [text, setText] = useState("");
  const [hashtag, setHashtag] = useState(DEFAULT_HASHTAG);
  const [loaded, setLoaded] = useState(false);
  const dateRef = useRef(todayStr);

  useEffect(() => {
    // サーバー側ではlocalStorageが無いため、マウント後に読み込んで反映する
    const store = loadData<DeclarationStore>(STORAGE_KEY, {
      date: todayStr,
      text: "",
      hashtag: DEFAULT_HASHTAG,
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(store.date === todayStr ? store.text : "");
    setHashtag(store.hashtag || DEFAULT_HASHTAG);
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 日付が変わったら宣言文だけリセットする(ハッシュタグは編集済みの内容を維持)
    if (dateRef.current !== todayStr) {
      dateRef.current = todayStr;
      setText("");
    }
  }, [todayStr]);

  useEffect(() => {
    if (loaded) saveData(STORAGE_KEY, { date: todayStr, text, hashtag });
  }, [text, hashtag, todayStr, loaded]);

  return { text, setText, hashtag, setHashtag };
}
