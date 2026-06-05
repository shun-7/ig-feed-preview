interface ProfileHeaderProps {
  postCount: number;
}

export function ProfileHeader({ postCount }: ProfileHeaderProps) {
  return (
    <div className="px-4 pt-4 pb-3">
      {/* Top row: avatar + stats */}
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex-shrink-0 flex items-center justify-center overflow-hidden">
          <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>

        {/* Stats */}
        <div className="flex gap-5 text-center">
          {[
            { label: '投稿', value: postCount },
            { label: 'フォロワー', value: '—' },
            { label: 'フォロー中', value: '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Account name & bio */}
      <div className="mt-3">
        <p className="text-sm font-semibold text-slate-800">your_account</p>
        <p className="text-xs text-slate-400 mt-0.5">フィードプレビュー中</p>
      </div>

      {/* Fake follow button */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg py-1.5 cursor-default">
          プロフィール編集
        </button>
        <button className="text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg py-1.5 cursor-default">
          シェア
        </button>
      </div>
    </div>
  );
}
