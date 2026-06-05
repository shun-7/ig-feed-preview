'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { usePosts } from '@/hooks/usePosts';
import { MobileFeedView } from '@/components/mobile/MobileFeedView';
import { MobileManageView } from '@/components/mobile/MobileManageView';
import { Toast } from '@/components/ui/Toast';

type Tab = 'preview' | 'manage';

export default function MobilePage() {
  const {
    posts,
    addImages,
    addImportedPosts,
    clearImported,
    removePost,
    updatePostType,
    reorderPosts,
    storageWarning,
    dismissWarning,
  } = usePosts();
  const [tab, setTab] = useState<Tab>('preview');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; type: 'info' | 'error' } | null>(null);

  const handleFilesAccepted = useCallback(
    async (files: File[]) => {
      setIsUploading(true);
      setUploadMessage(null);
      try {
        const result = await addImages(files);
        if (result.added > 0) {
          setUploadMessage({ text: `${result.added}枚追加しました`, type: 'info' });
          setTab('preview');
        }
        if (result.failed.length > 0) {
          const first = result.failed[0];
          setUploadMessage({
            text: `${result.failed.length}枚の処理に失敗: ${first.reason.slice(0, 60)}`,
            type: 'error',
          });
        }
        if (result.added === 0 && result.failed.length === 0) {
          setUploadMessage({ text: '画像が選択されませんでした', type: 'error' });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setUploadMessage({ text: `エラー: ${msg.slice(0, 80)}`, type: 'error' });
      } finally {
        setIsUploading(false);
      }
    },
    [addImages]
  );

  return (
    <div className="relative flex flex-col h-[100dvh] bg-white overflow-hidden">
      {/* Compact Header with inline segmented tab control */}
      <header className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100 flex-shrink-0">
        {/* Brand icon (no link to avoid confusion) */}
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-700 to-slate-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>

        {/* iOS-style segmented control — compact, centered */}
        <div className="flex bg-slate-100 rounded-lg p-0.5 flex-1 max-w-[240px]">
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all touch-manipulation select-none ${
              tab === 'preview'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 active:text-slate-700'
            }`}
          >
            プレビュー
          </button>
          <button
            type="button"
            onClick={() => setTab('manage')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all touch-manipulation select-none flex items-center justify-center gap-1 ${
              tab === 'manage'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 active:text-slate-700'
            }`}
          >
            管理
            {posts.length > 0 && (
              <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full leading-none font-bold min-w-[18px] text-center">
                {posts.length}
              </span>
            )}
          </button>
        </div>

        {/* Explicit PC version link */}
        <Link
          href="/"
          prefetch={false}
          className="flex-shrink-0 text-[11px] font-medium text-slate-500 active:text-slate-800 px-2 py-1.5 rounded touch-manipulation"
          aria-label="PC版を開く"
        >
          PC版
        </Link>
      </header>

      {/* Upload progress indicator */}
      {isUploading && (
        <div className="flex items-center justify-center gap-2 py-2 bg-slate-50 text-xs text-slate-600 border-b border-slate-100 flex-shrink-0">
          <svg className="w-3.5 h-3.5 animate-spin text-slate-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          画像を処理中...
        </div>
      )}

      {/* Content area */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        {tab === 'preview' ? (
          <MobileFeedView posts={posts} onReorder={reorderPosts} />
        ) : (
          <MobileManageView
            posts={posts}
            onFilesAccepted={handleFilesAccepted}
            onRemove={removePost}
            onTypeChange={updatePostType}
            onReorder={reorderPosts}
            onImportedPosts={addImportedPosts}
            onClearImported={clearImported}
            onMessage={setUploadMessage}
          />
        )}
      </main>

      {storageWarning && (
        <Toast
          message="ストレージ容量が不足しています"
          type="warning"
          onDismiss={dismissWarning}
        />
      )}

      {uploadMessage && (
        <Toast
          message={uploadMessage.text}
          type={uploadMessage.type === 'error' ? 'error' : 'info'}
          onDismiss={() => setUploadMessage(null)}
        />
      )}
    </div>
  );
}
