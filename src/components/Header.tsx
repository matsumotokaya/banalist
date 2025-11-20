interface HeaderProps {
  onBackToManager?: () => void;
  bannerName?: string;
}

export const Header = ({ onBackToManager, bannerName }: HeaderProps) => {
  return (
    <header className="h-16 bg-gradient-to-r from-blue-500 to-purple-600 border-b border-blue-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {onBackToManager && (
          <button
            onClick={onBackToManager}
            className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            title="バナーマネージャーに戻る"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍌</span>
          <h1 className="text-white text-xl font-bold">BANALIST</h1>
        </div>
        {bannerName && (
          <>
            <span className="text-white/50">|</span>
            <span className="text-white font-medium">{bannerName}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors">
          共有
        </button>
        <div className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center cursor-pointer transition-colors">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </header>
  );
};
