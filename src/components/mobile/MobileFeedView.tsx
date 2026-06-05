import type { Post } from '@/types/post';
import { InstagramProfileBody } from '@/components/preview/InstagramProfileBody';

interface MobileFeedViewProps {
  posts: Post[];
  onReorder?: (activeId: string, overId: string) => void;
}

/**
 * Full-screen Instagram-style feed for mobile.
 * No phone frame — the actual device IS the preview.
 */
export function MobileFeedView({ posts, onReorder }: MobileFeedViewProps) {
  return (
    <div className="bg-white">
      <InstagramProfileBody posts={posts} onReorder={onReorder} />
    </div>
  );
}
