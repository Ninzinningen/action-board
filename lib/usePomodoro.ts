"use client";

import { useEffect, useState } from "react";
import { loadData, saveData } from "./storage";
import type { PomodoroPhase, PomodoroState } from "./types";

const STORAGE_KEY = "workTimer";

const DEFAULT_TAG = "未分類";

const defaultState: PomodoroState = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEnabled: true,
  longBreakInterval: 4,
  totalSets: 0, // 無限に繰り返す
  totalsByDate: {},
  completedSetsByDate: {},
  tags: [DEFAULT_TAG],
  activeTag: DEFAULT_TAG,
  tagTotalsByDate: {},
};

type Status = "idle" | "running" | "paused";

type WorkSegment = { baseline: number; tag: string; tagBaseline: number; startedAt: number };

function playBeep() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 880;
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
  osc.onended = () => ctx.close();
}

export function usePomodoro(todayStr: string) {
  const [workMinutes, setWorkMinutesState] = useState(defaultState.workMinutes);
  const [breakMinutes, setBreakMinutesState] = useState(defaultState.breakMinutes);
  const [longBreakMinutes, setLongBreakMinutesState] = useState(defaultState.longBreakMinutes);
  const [longBreakEnabled, setLongBreakEnabledState] = useState(defaultState.longBreakEnabled);
  const [longBreakInterval, setLongBreakIntervalState] = useState(defaultState.longBreakInterval);
  const [totalSets, setTotalSetsState] = useState(defaultState.totalSets);
  const [totalsByDate, setTotalsByDate] = useState<Record<string, number>>({});
  const [completedSetsByDate, setCompletedSetsByDate] = useState<Record<string, number>>({});
  const [tags, setTags] = useState<string[]>(defaultState.tags);
  const [activeTag, setActiveTagState] = useState(defaultState.activeTag);
  const [tagTotalsByDate, setTagTotalsByDate] = useState<Record<string, Record<string, number>>>({});
  const [loaded, setLoaded] = useState(false);

  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [status, setStatus] = useState<Status>("idle");
  // 待機中/一時停止中の残り秒数のスナップショット
  const [pausedRemaining, setPausedRemaining] = useState(defaultState.workMinutes * 60);
  // 実行中: このタイムスタンプ(ms)でフェーズが終わる予定
  const [endAt, setEndAt] = useState<number | null>(null);
  // 実行中のみ1秒ごとに更新される現在時刻。endAtとの差分から残り秒数を毎回計算し直すので、
  // タブが非アクティブになってintervalの発火が遅れても次のtickで正しい値に自己補正される
  const [now, setNow] = useState<number | null>(null);
  // 作業フェーズの現在の実行区間が始まった時点の today 合計と、その開始時刻
  const [workSegment, setWorkSegment] = useState<WorkSegment | null>(null);
  // 今回のラウンドで完了した作業セット数(リロードでリセットされる。永続化はcompletedSetsByDate側)
  const [sessionSetCount, setSessionSetCount] = useState(0);
  // 目標セット数に到達して自動停止した直後かどうか
  const [allSetsFinished, setAllSetsFinished] = useState(false);

  useEffect(() => {
    // サーバー側ではlocalStorageが無いため、マウント後に読み込んで反映する
    // 旧ストップウォッチ形式のデータ(workMinutes/breakMinutesが無い)が残っていてもデフォルト値で補う
    const raw = loadData<Partial<PomodoroState>>(STORAGE_KEY, defaultState);
    const workMinutesLoaded = raw.workMinutes ?? defaultState.workMinutes;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWorkMinutesState(workMinutesLoaded);
    setBreakMinutesState(raw.breakMinutes ?? defaultState.breakMinutes);
    setLongBreakMinutesState(raw.longBreakMinutes ?? defaultState.longBreakMinutes);
    setLongBreakEnabledState(raw.longBreakEnabled ?? defaultState.longBreakEnabled);
    setLongBreakIntervalState(raw.longBreakInterval ?? defaultState.longBreakInterval);
    setTotalSetsState(raw.totalSets ?? defaultState.totalSets);
    setTotalsByDate(raw.totalsByDate ?? {});
    setCompletedSetsByDate(raw.completedSetsByDate ?? {});
    const tagsLoaded = raw.tags && raw.tags.length > 0 ? raw.tags : defaultState.tags;
    setTags(tagsLoaded);
    setActiveTagState(raw.activeTag && tagsLoaded.includes(raw.activeTag) ? raw.activeTag : tagsLoaded[0]);
    setTagTotalsByDate(raw.tagTotalsByDate ?? {});
    setPausedRemaining(workMinutesLoaded * 60);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded)
      saveData(STORAGE_KEY, {
        workMinutes,
        breakMinutes,
        longBreakMinutes,
        longBreakEnabled,
        longBreakInterval,
        totalSets,
        totalsByDate,
        completedSetsByDate,
        tags,
        activeTag,
        tagTotalsByDate,
      });
  }, [
    workMinutes,
    breakMinutes,
    longBreakMinutes,
    longBreakEnabled,
    longBreakInterval,
    totalSets,
    totalsByDate,
    completedSetsByDate,
    tags,
    activeTag,
    tagTotalsByDate,
    loaded,
  ]);

  useEffect(() => {
    if (status !== "running") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNow(null);
      return;
    }
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const remainingSeconds =
    status === "running" && endAt !== null && now !== null
      ? Math.max(0, Math.ceil((endAt - now) / 1000))
      : pausedRemaining;

  // 作業フェーズ実行中: 実際に経過した秒数をリアルタイムで今日の合計・タグ別合計に反映する
  useEffect(() => {
    if (status !== "running" || phase !== "work" || !workSegment || now === null) return;
    const elapsed = Math.max(0, Math.round((now - workSegment.startedAt) / 1000));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotalsByDate((prev) => ({ ...prev, [todayStr]: workSegment.baseline + elapsed }));
    setTagTotalsByDate((prev) => ({
      ...prev,
      [todayStr]: { ...prev[todayStr], [workSegment.tag]: workSegment.tagBaseline + elapsed },
    }));
  }, [now, status, phase, workSegment, todayStr]);

  // フェーズ完了検知: 残り時間が0になったら音を鳴らして次のフェーズへ。休憩明けは自動的に次の作業サイクルへループする
  useEffect(() => {
    if (status !== "running" || remainingSeconds > 0) return;
    playBeep();
    if (phase === "work") {
      const nextSetCount = sessionSetCount + 1;
      const useLongBreak = longBreakEnabled && nextSetCount % longBreakInterval === 0;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessionSetCount(nextSetCount);
      setCompletedSetsByDate((prev) => ({ ...prev, [todayStr]: (prev[todayStr] ?? 0) + 1 }));
      setPhase(useLongBreak ? "longBreak" : "break");
      setEndAt(Date.now() + (useLongBreak ? longBreakMinutes : breakMinutes) * 60 * 1000);
      setWorkSegment(null);
    } else {
      const reachedLimit = totalSets > 0 && sessionSetCount >= totalSets;
      setPhase("work");
      setEndAt(null);
      setPausedRemaining(workMinutes * 60);
      if (reachedLimit) {
        setStatus("idle");
        setSessionSetCount(0);
        setAllSetsFinished(true);
      } else {
        // 休憩終了、手動操作なしで次の作業サイクルへ継続する
        setEndAt(Date.now() + workMinutes * 60 * 1000);
        setWorkSegment({
          baseline: totalsByDate[todayStr] ?? 0,
          tag: activeTag,
          tagBaseline: tagTotalsByDate[todayStr]?.[activeTag] ?? 0,
          startedAt: Date.now(),
        });
      }
    }
  }, [
    remainingSeconds,
    status,
    phase,
    breakMinutes,
    workMinutes,
    longBreakEnabled,
    longBreakInterval,
    longBreakMinutes,
    totalSets,
    sessionSetCount,
    todayStr,
    totalsByDate,
    activeTag,
    tagTotalsByDate,
  ]);

  function start() {
    setEndAt(Date.now() + pausedRemaining * 1000);
    if (phase === "work") {
      setWorkSegment({
        baseline: totalsByDate[todayStr] ?? 0,
        tag: activeTag,
        tagBaseline: tagTotalsByDate[todayStr]?.[activeTag] ?? 0,
        startedAt: Date.now(),
      });
    }
    setAllSetsFinished(false);
    setStatus("running");
  }

  function pause() {
    setPausedRemaining(remainingSeconds);
    setEndAt(null);
    setWorkSegment(null);
    setStatus("paused");
  }

  function reset() {
    setStatus("idle");
    setPhase("work");
    setEndAt(null);
    setWorkSegment(null);
    setPausedRemaining(workMinutes * 60);
    setSessionSetCount(0);
    setAllSetsFinished(false);
  }

  function setWorkMinutes(minutes: number) {
    setWorkMinutesState(minutes);
    if (status === "idle" && phase === "work") setPausedRemaining(minutes * 60);
  }

  function setBreakMinutes(minutes: number) {
    setBreakMinutesState(minutes);
  }

  function setLongBreakMinutes(minutes: number) {
    setLongBreakMinutesState(minutes);
  }

  function setLongBreakEnabled(enabled: boolean) {
    setLongBreakEnabledState(enabled);
  }

  function setLongBreakInterval(sets: number) {
    setLongBreakIntervalState(sets);
  }

  function setTotalSets(sets: number) {
    setTotalSetsState(sets);
  }

  function addTag(name: string) {
    const trimmed = name.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
  }

  function removeTag(name: string) {
    if (tags.length <= 1) return;
    setTags((prev) => prev.filter((t) => t !== name));
    if (activeTag === name) {
      setActiveTagState(tags.find((t) => t !== name) ?? DEFAULT_TAG);
    }
  }

  function setActiveTag(name: string) {
    setActiveTagState(name);
  }

  const todayTotalSeconds = totalsByDate[todayStr] ?? 0;
  const todayCompletedSets = completedSetsByDate[todayStr] ?? 0;

  return {
    phase,
    status,
    remainingSeconds,
    workMinutes,
    breakMinutes,
    longBreakMinutes,
    longBreakEnabled,
    longBreakInterval,
    totalSets,
    sessionSetCount,
    allSetsFinished,
    todayTotalSeconds,
    todayCompletedSets,
    tags,
    activeTag,
    start,
    pause,
    reset,
    setWorkMinutes,
    setBreakMinutes,
    setLongBreakMinutes,
    setLongBreakEnabled,
    setLongBreakInterval,
    setTotalSets,
    addTag,
    removeTag,
    setActiveTag,
  };
}
