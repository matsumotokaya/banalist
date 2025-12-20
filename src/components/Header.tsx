import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthButton } from './AuthButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onBackToManager?: () => void;
  bannerName?: string;
  bannerId?: string;
  onBannerNameChange?: (newName: string) => void;
  isPremium?: boolean;
  onPremiumChange?: (isPremium: boolean) => void;
  isPublic?: boolean;
  onPublicChange?: (isPublic: boolean) => void;
}

export const Header = ({ onBackToManager, bannerName, bannerId, onBannerNameChange, isPremium = false, onPremiumChange, isPublic = false, onPublicChange }: HeaderProps) => {
  const { t } = useTranslation(['banner', 'common', 'auth']);
  const { profile } = useAuth();
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
          <h1 className="text-white text-sm md:text-lg" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            <span className="mr-1">🧪</span>
            <span className="font-bold">WHATHIF</span>
            <span className="font-light"> EXPERIMENT</span>
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
              </div>
            )}
          </>
        )}
        {/* Settings (Premium checkbox + Public/Private radio) */}
        {bannerId && (
          <div className="hidden md:flex items-center gap-4 ml-4">
            {/* Premium checkbox - only visible to admins */}
            {profile?.role === 'admin' && onPremiumChange && (
              <label className="flex items-center gap-2 cursor-pointer group/premium">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => onPremiumChange(e.target.checked)}
                  className="w-4 h-4 text-yellow-500 bg-white/20 border-white/50 rounded focus:ring-yellow-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-white/90 text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                  </svg>
                  {t('common:label.premium')}
                </span>
              </label>
            )}

            {/* Public/Private radio buttons */}
            {onPublicChange && (
              <div className="flex items-center gap-3 px-3 py-1 bg-white/10 rounded-lg">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!isPublic}
                    onChange={() => onPublicChange(false)}
                    className="w-3.5 h-3.5 text-white bg-white/20 border-white/50 focus:ring-white focus:ring-2 cursor-pointer"
                  />
                  <span className="text-white/90 text-sm font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                    </svg>
                    {t('common:label.private')}
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={isPublic}
                    onChange={() => onPublicChange(true)}
                    className="w-3.5 h-3.5 text-white bg-white/20 border-white/50 focus:ring-white focus:ring-2 cursor-pointer"
                  />
                  <span className="text-white/90 text-sm font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    {t('common:label.public')}
                  </span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <LanguageSwitcher />
        <AuthButton />
      </div>
    </header>
  );
};
