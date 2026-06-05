import type { Post } from '@/types/post';
import { PhoneMockup } from '@/components/preview/PhoneMockup';

interface RightPanelProps {
  posts: Post[];
  onReorder?: (activeId: string, overId: string) => void;
}

export function RightPanel({ posts, onReorder }: RightPanelProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[393px]">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          フィードプレビュー
        </h2>
        {posts.length > 0 && (
          <span className="text-xs text-slate-400">
            ドラッグで並び替え可
          </span>
        )}
      </div>
      <PhoneMockup posts={posts} onReorder={onReorder} />
    </div>
  );
}
