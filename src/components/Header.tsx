import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthButton } from './AuthButton';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  onBackToManager?: () => void;
  bannerName?: string;
  bannerId?: string;
  onBannerNameChange?: (newName: string) => void;
  onSaveAsTemplate?: () => void;
  isAdmin?: boolean;
}

export const Header = ({ onBackToManager, bannerName, bannerId, onBannerNameChange, onSaveAsTemplate, isAdmin }: HeaderProps) => {
  const { t } = useTranslation(['banner', 'common', 'auth']);
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
    <header className="h-14 md:h-16 bg-[#1a1a1a] border-b border-[#2b2b2b] flex items-center justify-between px-3 md:px-6">
      <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
        {onBackToManager && (
          <button
            onClick={onBackToManager}
            className="w-8 h-8 md:w-9 md:h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            title={t('banner:backToManager')}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <h1 className="text-white text-lg whitespace-nowrap" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            <span className="font-bold">IMAGINE;</span>
            <span className="hidden sm:inline font-normal text-white/70 ml-1">Anime Aesthetic Design with WHATIF</span>
          </h1>
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
                    title={t('banner:editName')}
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
                {isAdmin && bannerId && onSaveAsTemplate && (
                  <button
                    onClick={onSaveAsTemplate}
                    className="ml-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
                    title="テンプレートに登録"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="hidden md:inline">テンプレート登録</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <LanguageSwitcher />
        <AuthButton />
      </div>
    </header>
  );
};
