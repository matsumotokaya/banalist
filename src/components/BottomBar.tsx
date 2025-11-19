interface BottomBarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onExport: () => void;
}

export const BottomBar = ({ zoom, onZoomChange, onExport }: BottomBarProps) => {
  return (
    <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onZoomChange(Math.max(25, zoom - 10))}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <input
            type="range"
            min="25"
            max="200"
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />

          <button
            onClick={() => onZoomChange(Math.min(200, zoom + 10))}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <span className="text-sm text-gray-600 font-medium min-w-[3rem] text-center">
            {zoom}%
          </span>
        </div>
      </div>

      <button
        onClick={onExport}
        className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold text-sm shadow-md hover:shadow-lg flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        ダウンロード
      </button>
    </div>
  );
};
