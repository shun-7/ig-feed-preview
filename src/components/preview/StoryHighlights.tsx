const HIGHLIGHTS = ['旅行', '料理', 'Work', 'Daily', '+'];

export function StoryHighlights() {
  return (
    <div className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-none">
      {/* New highlight button */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-[10px] text-slate-400">新規</span>
      </div>

      {HIGHLIGHTS.map((label) => (
        <div key={label} className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-200" />
          <span className="text-[10px] text-slate-500 truncate max-w-[56px] text-center">{label}</span>
        </div>
      ))}
    </div>
  );
}
