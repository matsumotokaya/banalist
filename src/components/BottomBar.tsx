import { useTranslation } from 'react-i18next';

interface BottomBarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onExport: () => void;
  saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error';
  lastSaveError?: string | null;
  onRetry?: () => void;
}

export const BottomBar = ({
  zoom,
  onZoomChange,
  onExport,
  saveStatus = 'saved',
  lastSaveError,
  onRetry
}: BottomBarProps) => {
  const { t } = useTranslation(['editor', 'common']);
  return (
    <div className="h-14 md:h-16 bg-white border-t border-gray-200 overflow-x-auto overflow-y-hidden">
      <div className="flex items-center justify-between px-3 md:px-6 h-full min-w-max">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => onZoomChange(Math.max(25, zoom - 10))}
              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            >
              <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            <input
              type="range"
              min="25"
              max="200"
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="w-24 md:w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />

            <button
              onClick={() => onZoomChange(Math.min(200, zoom + 10))}
              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            >
              <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <span className="text-xs md:text-sm text-gray-600 font-medium min-w-[2.5rem] md:min-w-[3rem] text-center">
              {zoom}%
            </span>
          </div>

        </div>

        {/* Save status indicator in the center */}
        <div className="flex-1 flex justify-center items-center">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">{t('editor:save.saving')}</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">{t('editor:save.saved')}</span>
            </div>
          )}
          {saveStatus === 'unsaved' && (
            <div className="flex items-center gap-2 text-orange-500">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="2" />
              </svg>
              <span className="text-sm">{t('editor:save.unsaved')}</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm">{t('editor:save.error')}</span>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-xs underline hover:no-underline ml-2"
                >
                  {t('editor:save.retry')}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Download button */}
          <button
            onClick={onExport}
            className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold text-xs md:text-sm shadow-md hover:shadow-lg flex items-center gap-1.5 md:gap-2 flex-shrink-0"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">{t('editor:download')}</span>
            <span className="sm:hidden">DL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
