import type { Post } from '@/types/post';
import { InstagramProfileBody } from './InstagramProfileBody';

interface PhoneMockupProps {
  posts: Post[];
  onReorder?: (activeId: string, overId: string) => void;
}

export function PhoneMockup({ posts, onReorder }: PhoneMockupProps) {
  return (
    <div className="relative mx-auto" style={{ width: 393 }}>
      {/* Phone frame — iPhone 16 proportions (393×852 logical px) */}
      <div className="rounded-[3rem] border-[9px] border-slate-800 shadow-2xl overflow-hidden bg-white">
        {/* Status bar with Dynamic Island */}
        <div className="bg-white relative flex items-center justify-between px-5 pt-3 pb-1">
          <span className="text-[11px] font-semibold text-slate-800">9:41</span>
          {/* Dynamic Island */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-[88px] h-[26px] bg-slate-900 rounded-full" />
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-slate-800" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M1.5 8.5a13 13 0 0121 0M5 12a10 10 0 0114 0M8.5 15.5a6 6 0 017 0M12 19h.01" />
            </svg>
            <svg className="w-3.5 h-3 text-slate-800" viewBox="0 0 25 12" fill="currentColor">
              <rect x="0" y="1" width="22" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="1.5" y="2.5" width="16" height="7" rx="1" fill="currentColor"/>
              <path d="M23 4.5v3a1.5 1.5 0 000-3z"/>
            </svg>
          </div>
        </div>

        {/* Scrollable content (status bar already above) */}
        <div className="overflow-y-auto overscroll-contain" style={{ height: 740 }}>
          <InstagramProfileBody posts={posts} onReorder={onReorder} />
        </div>
      </div>
    </div>
  );
}
