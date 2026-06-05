'use client';

import { useState, useRef } from 'react';
import { parseInstagramZip, MAX_IMPORTED_POSTS } from '@/utils/instagramImport';
import type { Post } from '@/types/post';

interface InstagramImportProps {
  importedCount: number;
  onImported: (posts: Post[]) => void;
  onClear: () => void;
  onMessage: (msg: { text: string; type: 'info' | 'error' }) => void;
}

export function InstagramImport({ importedCount, onImported, onClear, onMessage }: InstagramImportProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!/\.zip$/i.test(file.name)) {
      onMessage({ text: 'ZIPファイルを選択してください', type: 'error' });
      return;
    }

    setIsImporting(true);
    try {
      const result = await parseInstagramZip(file);
      if (result.posts.length === 0) {
        onMessage({ text: '取り込めた投稿がありませんでした', type: 'error' });
      } else {
        onImported(result.posts);
        const skipNote = result.totalFound > result.posts.length
          ? `（全${result.totalFound}件中、最新${result.posts.length}件）`
          : '';
        onMessage({
          text: `${result.posts.length}件の既存投稿を取り込みました${skipNote}`,
          type: 'info',
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      onMessage({ text: `取り込み失敗: ${msg.slice(0, 100)}`, type: 'error' });
    } finally {
      setIsImporting(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
            Instagramデータを取り込み
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            既存投稿を一括取り込み（最大{MAX_IMPORTED_POSTS}件）
          </p>
        </div>
        {importedCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] text-slate-400 hover:text-red-500 px-2 py-1 rounded touch-manipulation"
          >
            クリア
          </button>
        )}
      </div>

      {importedCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {importedCount}件の既存投稿を取り込み済み
        </div>
      )}

      <div className="flex gap-2">
        <label
          htmlFor="instagram-zip-input"
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium touch-manipulation select-none cursor-pointer transition-colors ${
            isImporting
              ? 'border-slate-200 bg-slate-50 text-slate-400'
              : 'border-slate-300 bg-white text-slate-700 active:bg-slate-100 hover:border-slate-400'
          }`}
        >
          <input
            ref={inputRef}
            id="instagram-zip-input"
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={isImporting}
            className="sr-only"
          />
          {isImporting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              取り込み中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ZIPを選択
            </>
          )}
        </label>
        <button
          type="button"
          onClick={() => setShowHelp((s) => !s)}
          className="px-3 py-2.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-medium touch-manipulation active:bg-slate-100"
        >
          {showHelp ? '閉じる' : '手順'}
        </button>
      </div>

      {showHelp && (
        <div className="text-[11px] text-slate-600 space-y-2 bg-slate-50 rounded-lg p-3">
          <p className="font-semibold text-slate-700">Instagramデータのダウンロード手順</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Instagramアプリ → メニュー → <strong>アカウントセンター</strong></li>
            <li>「個人情報・許可」→「個人情報のダウンロード」</li>
            <li>アカウントを選択 → 「<strong>情報の一部をダウンロード</strong>」</li>
            <li>「投稿」だけにチェック → 次へ</li>
            <li><strong>形式: JSON</strong>、メディア画質: 中 を選択</li>
            <li>申請後、メールで届くZIP（数時間〜48時間）をここに選択</li>
          </ol>
          <p className="text-slate-500 pt-1 border-t border-slate-200">
            ※ JSON形式でないと取り込めません。HTMLを選ばないように注意
          </p>
        </div>
      )}
    </div>
  );
}
