'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Post, PostType } from '@/types/post';

const TYPE_LABELS: Record<PostType, string> = {
  photo: '通常',
  carousel: 'カルーセル',
  reel: 'リール',
};

interface ImageListItemProps {
  post: Post;
  onRemove: (id: string) => void;
  onTypeChange: (id: string, type: PostType) => void;
}

export function ImageListItem({ post, onRemove, onTypeChange }: ImageListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-100 hover:border-slate-200 group"
    >
      {/* Drag handle (larger tap target on mobile) */}
      <button
        {...attributes}
        {...listeners}
        className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none flex-shrink-0 p-1.5 -m-1.5 md:p-0 md:m-0"
        aria-label="並び替え"
      >
        <svg className="w-5 h-5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 5a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2zM9 11a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2zM9 17a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
      </button>

      {/* Thumbnail */}
      <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.imageDataUrl}
          alt={post.fileName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 truncate">{post.fileName}</p>
        <select
          value={post.type}
          onChange={(e) => onTypeChange(post.id, e.target.value as PostType)}
          className="mt-1 text-xs border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
        >
          {(Object.keys(TYPE_LABELS) as PostType[]).map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Delete (always visible on mobile, hover-only on desktop) */}
      <button
        onClick={() => onRemove(post.id)}
        className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0 p-1.5 -m-1.5 md:p-0 md:m-0 md:text-slate-300 opacity-100 md:opacity-0 md:group-hover:opacity-100"
        aria-label="削除"
      >
        <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
