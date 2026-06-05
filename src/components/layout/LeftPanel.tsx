'use client';

import type { Post, PostType } from '@/types/post';
import { DropZone } from '@/components/upload/DropZone';
import { ImageList } from '@/components/upload/ImageList';
import { InstagramImport } from '@/components/upload/InstagramImport';

interface LeftPanelProps {
  posts: Post[];
  onFilesAccepted: (files: File[]) => void;
  onRemove: (id: string) => void;
  onTypeChange: (id: string, type: PostType) => void;
  onReorder: (activeId: string, overId: string) => void;
  onImportedPosts: (posts: Post[]) => void;
  onClearImported: () => void;
  onMessage: (msg: { text: string; type: 'info' | 'error' }) => void;
}

export function LeftPanel({
  posts,
  onFilesAccepted,
  onRemove,
  onTypeChange,
  onReorder,
  onImportedPosts,
  onClearImported,
  onMessage,
}: LeftPanelProps) {
  const importedCount = posts.filter((p) => p.source === 'imported').length;

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          画像を追加
        </h2>
        <DropZone onFilesAccepted={onFilesAccepted} />
      </div>

      <InstagramImport
        importedCount={importedCount}
        onImported={onImportedPosts}
        onClear={onClearImported}
        onMessage={onMessage}
      />

      {posts.length > 0 && (
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              投稿順 ({posts.length}件)
            </h2>
            <span className="text-xs text-slate-400">ドラッグで並び替え</span>
          </div>
          <ImageList
            posts={posts}
            onRemove={onRemove}
            onTypeChange={onTypeChange}
            onReorder={onReorder}
          />
        </div>
      )}
    </div>
  );
}
