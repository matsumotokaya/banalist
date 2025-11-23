import { useState } from 'react';
import { AuthButton } from './AuthButton';

interface HeaderProps {
  onBackToManager?: () => void;
  bannerName?: string;
  bannerId?: string;
  onBannerNameChange?: (newName: string) => void;
}

export const Header = ({ onBackToManager, bannerName, bannerId, onBannerNameChange }: HeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState('');

  const handleStartEdit = () => {
    if (bannerName) {
      setEditingName(bannerName);
      setIsEditing(true);
    }
  };

  const handleSaveName = () => {
    if (editingName.trim() && onBannerNameChange) {
      onBannerNameChange(editingName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingName('');
  };

  return (
    <header className="h-14 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 border-b border-blue-700 flex items-center justify-between px-3 md:px-6">
      <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
        {onBackToManager && (
          <button
            onClick={onBackToManager}
            className="w-8 h-8 md:w-9 md:h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            title="バナーマネージャーに戻る"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <span className="text-xl md:text-2xl">🍌</span>
          <h1 className="text-white text-base md:text-xl font-bold">BANALIST</h1>
        </div>
        {bannerName && (
          <>
            <span className="hidden sm:inline text-white/50">|</span>
            {isEditing ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                onBlur={handleSaveName}
                className="hidden sm:block px-2 py-1 bg-white/90 text-gray-900 rounded border-2 border-white focus:outline-none focus:ring-2 focus:ring-white/50 font-medium text-sm"
                autoFocus
              />
            ) : (
              <div className="hidden sm:flex items-center gap-2 group/title">
                <span className="text-white font-medium text-sm md:text-base truncate max-w-[150px] md:max-w-none">{bannerName}</span>
                {bannerId && onBannerNameChange && (
                  <button
                    onClick={handleStartEdit}
                    className="opacity-0 group-hover/title:opacity-100 p-1 hover:bg-white/20 rounded transition-all flex-shrink-0"
                    title="名前を編集"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <AuthButton />
      </div>
    </header>
  );
};
