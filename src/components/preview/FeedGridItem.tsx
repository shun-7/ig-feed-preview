import type { Post } from '@/types/post';

interface FeedGridItemProps {
  post: Post;
  isNewest?: boolean;
}

function TypeIcon({ type }: { type: Post['type'] }) {
  if (type === 'carousel') {
    return (
      <svg className="w-4 h-4 drop-shadow" fill="white" viewBox="0 0 24 24">
        <rect x="2" y="6" width="13" height="13" rx="2" opacity="0.7" />
        <rect x="6" y="2" width="13" height="13" rx="2" />
      </svg>
    );
  }
  if (type === 'reel') {
    return (
      <svg className="w-4 h-4 drop-shadow" fill="white" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  }
  return null;
}

export function FeedGridItem({ post, isNewest }: FeedGridItemProps) {
  const isDraft = post.source === 'new';
  return (
    <div
      className={`aspect-[4/5] relative overflow-hidden bg-slate-100 ${
        isDraft ? 'ring-2 ring-inset ring-blue-400' : ''
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.imageDataUrl}
        alt={post.fileName}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full object-cover pointer-events-none select-none"
        style={{
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          WebkitUserDrag: 'none',
        } as React.CSSProperties}
      />
      {post.type !== 'photo' && (
        <div className="absolute top-1.5 right-1.5">
          <TypeIcon type={post.type} />
        </div>
      )}
      {isDraft && (
        <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-tight">
          {isNewest ? 'NEW' : '新規'}
        </div>
      )}
    </div>
  );
}
