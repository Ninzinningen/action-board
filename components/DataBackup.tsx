"use client";

import { useRef } from "react";
import { exportAllData, importAllData, type BackupFile } from "@/lib/storage";
import { today } from "@/lib/date";

export function DataBackup() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const backup = exportAllData();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `action-board-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    let parsed: BackupFile;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      window.alert("ファイルの読み込みに失敗しました。正しいバックアップファイルを選択してください。");
      return;
    }
    if (parsed.app !== "action-board" || typeof parsed.data !== "object" || parsed.data === null) {
      window.alert("このファイルは行動管理ボードのバックアップ形式ではありません。");
      return;
    }
    if (!window.confirm("現在のデータを上書きしてインポートしますか?この操作は元に戻せません。")) return;

    importAllData(parsed.data);
    window.location.reload();
  }

  return (
    <div className="flex justify-center gap-4 pt-2">
      <button
        onClick={handleExport}
        className="text-xs text-gray-600 hover:text-gray-400"
      >
        データをエクスポート
      </button>
      <button
        onClick={handleImportClick}
        className="text-xs text-gray-600 hover:text-gray-400"
      >
        データをインポート
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
