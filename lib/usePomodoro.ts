"use client";

import { useEffect, useState } from "react";
import { loadData, saveData } from "./storage";
import type { PomodoroPhase, PomodoroState } from "./types";

const STORAGE_KEY = "workTimer";

const defaultState: PomodoroState = { workMinutes: 25, breakMinutes: 5, totalsByDate: {} };

type Status = "idle" | "running" | "paused";

type WorkSegment = { baseline: number; startedAt: number };

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
  const [totalsByDate, setTotalsByDate] = useState<Record<string, number>>({});
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

  useEffect(() => {
    // サーバー側ではlocalStorageが無いため、マウント後に読み込んで反映する
    // 旧ストップウォッチ形式のデータ(workMinutes/breakMinutesが無い)が残っていてもデフォルト値で補う
    const raw = loadData<Partial<PomodoroState>>(STORAGE_KEY, defaultState);
    const workMinutesLoaded = raw.workMinutes ?? defaultState.workMinutes;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWorkMinutesState(workMinutesLoaded);
    setBreakMinutesState(raw.breakMinutes ?? defaultState.breakMinutes);
    setTotalsByDate(raw.totalsByDate ?? {});
    setPausedRemaining(workMinutesLoaded * 60);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveData(STORAGE_KEY, { workMinutes, breakMinutes, totalsByDate });
  }, [workMinutes, breakMinutes, totalsByDate, loaded]);

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

  // 作業フェーズ実行中: 実際に経過した秒数をリアルタイムで今日の合計に反映する
  useEffect(() => {
    if (status !== "running" || phase !== "work" || !workSegment || now === null) return;
    const elapsed = Math.max(0, Math.round((now - workSegment.startedAt) / 1000));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotalsByDate((prev) => ({ ...prev, [todayStr]: workSegment.baseline + elapsed }));
  }, [now, status, phase, workSegment, todayStr]);

  // フェーズ完了検知: 残り時間が0になったら音を鳴らして次のフェーズへ
  useEffect(() => {
    if (status !== "running" || remainingSeconds > 0) return;
    playBeep();
    if (phase === "work") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("break");
      setEndAt(Date.now() + breakMinutes * 60 * 1000);
      setWorkSegment(null);
    } else {
      setPhase("work");
      setStatus("idle");
      setEndAt(null);
      setPausedRemaining(workMinutes * 60);
    }
  }, [remainingSeconds, status, phase, breakMinutes, workMinutes]);

  function start() {
    setEndAt(Date.now() + pausedRemaining * 1000);
    if (phase === "work") {
      setWorkSegment({ baseline: totalsByDate[todayStr] ?? 0, startedAt: Date.now() });
    }
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
  }

  function setWorkMinutes(minutes: number) {
    setWorkMinutesState(minutes);
    if (status === "idle" && phase === "work") setPausedRemaining(minutes * 60);
  }

  function setBreakMinutes(minutes: number) {
    setBreakMinutesState(minutes);
  }

  const todayTotalSeconds = totalsByDate[todayStr] ?? 0;

  return {
    phase,
    status,
    remainingSeconds,
    workMinutes,
    breakMinutes,
    todayTotalSeconds,
    start,
    pause,
    reset,
    setWorkMinutes,
    setBreakMinutes,
  };
}
