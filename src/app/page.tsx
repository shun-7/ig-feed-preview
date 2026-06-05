'use client';

import { useCallback, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { LeftPanel } from '@/components/layout/LeftPanel';
import { RightPanel } from '@/components/layout/RightPanel';
import { Toast } from '@/components/ui/Toast';
import { usePosts } from '@/hooks/usePosts';

export default function Home() {
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
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'info' | 'error' } | null>(null);

  const handleFilesAccepted = useCallback(async (files: File[]) => {
    setIsUploading(true);
    try {
      await addImages(files);
    } finally {
      setIsUploading(false);
    }
  }, [addImages]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <AppHeader />

      <main className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-80 flex-shrink-0 border-r border-slate-100 bg-white overflow-y-auto p-5">
          {isUploading && (
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              画像を処理中...
            </div>
          )}
          <LeftPanel
            posts={posts}
            onFilesAccepted={handleFilesAccepted}
            onRemove={removePost}
            onTypeChange={updatePostType}
            onReorder={reorderPosts}
            onImportedPosts={addImportedPosts}
            onClearImported={clearImported}
            onMessage={setMessage}
          />
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-y-auto p-8">
          <RightPanel posts={posts} onReorder={reorderPosts} />
        </div>
      </main>

      {storageWarning && (
        <Toast
          message="ストレージ容量が不足してきました。不要な画像を削除することをおすすめします。"
          type="warning"
          onDismiss={dismissWarning}
        />
      )}

      {message && (
        <Toast
          message={message.text}
          type={message.type === 'error' ? 'error' : 'info'}
          onDismiss={() => setMessage(null)}
        />
      )}
    </div>
  );
}
