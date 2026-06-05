'use client';

import type { Post, PostType } from '@/types/post';
import { DropZone } from '@/components/upload/DropZone';
import { ImageList } from '@/components/upload/ImageList';
import { InstagramImport } from '@/components/upload/InstagramImport';

interface MobileManageViewProps {
  posts: Post[];
  onFilesAccepted: (files: File[]) => void;
  onRemove: (id: string) => void;
  onTypeChange: (id: string, type: PostType) => void;
  onReorder: (activeId: string, overId: string) => void;
  onImportedPosts: (posts: Post[]) => void;
  onClearImported: () => void;
  onMessage: (msg: { text: string; type: 'info' | 'error' }) => void;
}

export function MobileManageView({
  posts,
  onFilesAccepted,
  onRemove,
  onTypeChange,
  onReorder,
  onImportedPosts,
  onClearImported,
  onMessage,
}: MobileManageViewProps) {
  const importedCount = posts.filter((p) => p.source === 'imported').length;

  return (
    <div className="p-4 space-y-5 bg-slate-50 min-h-full">
      <DropZone onFilesAccepted={onFilesAccepted} />

      <InstagramImport
        importedCount={importedCount}
        onImported={onImportedPosts}
        onClear={onClearImported}
        onMessage={onMessage}
      />

      {posts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              投稿順 ({posts.length}件)
            </h2>
            <span className="text-[10px] text-slate-400">⋮を長押しで並び替え</span>
          </div>
          <ImageList
            posts={posts}
            onRemove={onRemove}
            onTypeChange={onTypeChange}
            onReorder={onReorder}
          />
        </div>
      )}

      {posts.length === 0 && (
        <p className="text-center text-xs text-slate-400 pt-6">
          上のエリアから画像を追加してください
        </p>
      )}
    </div>
  );
}
