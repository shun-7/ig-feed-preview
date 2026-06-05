import type { Post } from '@/types/post';
import { ProfileHeader } from './ProfileHeader';
import { StoryHighlights } from './StoryHighlights';
import { FeedGrid } from './FeedGrid';

interface InstagramProfileBodyProps {
  posts: Post[];
  onReorder?: (activeId: string, overId: string) => void;
}

/**
 * Shared Instagram-like profile UI body.
 * Used both inside PhoneMockup (PC) and directly on mobile.
 */
export function InstagramProfileBody({ posts, onReorder }: InstagramProfileBodyProps) {
  return (
    <>
      {/* App nav bar */}
      <div className="bg-white border-b border-slate-100 flex items-center justify-between px-4 py-2.5">
        <span className="text-base font-bold text-slate-800 tracking-tight">your_account</span>
        <div className="flex items-center gap-4 text-slate-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
          </svg>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
      </div>

      <ProfileHeader postCount={posts.length} />
      <StoryHighlights />

      {/* Grid / Reels tab bar */}
      <div className="flex border-b border-slate-100">
        <button className="flex-1 py-2.5 flex justify-center border-b-2 border-slate-800">
          <svg className="w-5 h-5 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" />
          </svg>
        </button>
        <button className="flex-1 py-2.5 flex justify-center text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        </button>
        <button className="flex-1 py-2.5 flex justify-center text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>

      <FeedGrid posts={posts} onReorder={onReorder} />
    </>
  );
}
