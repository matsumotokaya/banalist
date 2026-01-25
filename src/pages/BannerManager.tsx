import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import { UpgradeModal } from '../components/UpgradeModal';
import { GalleryTabs } from '../components/GalleryTabs';
import {
  useBanners,
  useCreateBanner,
  useDeleteBanner,
  useDuplicateBanner,
  useUpdateBannerName,
} from '../hooks/useBanners';
import { DEFAULT_TEMPLATES } from '../templates/defaultTemplates';
import type { BannerListItem, CanvasElement, Template } from '../types/template';
import { useAuth } from '../contexts/AuthContext';

export const BannerManager = () => {
  const { t, i18n } = useTranslation(['banner', 'common', 'message']);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = !user;
  const guestStorageKey = 'banalist_guest_banner';
  const [guestBanner, setGuestBanner] = useState<BannerListItem | null>(null);

  // React Query hooks
  const { data: banners = [], isLoading, refetch } = useBanners();
  const createBanner = useCreateBanner();
  const deleteBanner = useDeleteBanner();
  const duplicateBanner = useDuplicateBanner();
  const updateName = useUpdateBannerName(editingId || '');

  useEffect(() => {
    if (!isGuest) {
      setGuestBanner(null);
      return;
    }
    try {
      const stored = localStorage.getItem(guestStorageKey);
      if (!stored) {
        setGuestBanner(null);
        return;
      }
      const parsed = JSON.parse(stored) as {
        name: string;
        template: { name: string };
        updatedAt?: string;
        createdAt?: string;
        thumbnailUrl?: string;
      };
      setGuestBanner({
        id: 'guest',
        name: parsed.name || parsed.template?.name || 'Guest Banner',
        updatedAt: parsed.updatedAt || parsed.createdAt || new Date().toISOString(),
        thumbnailUrl: parsed.thumbnailUrl,
      });
    } catch (error) {
      console.warn('[BannerManager] Failed to load guest banner from localStorage:', error);
      setGuestBanner(null);
    }
  }, [isGuest]);

  // Reload banners when page becomes visible (to refresh thumbnails)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[BannerManager] 👁️  Page became visible, forcing refetch...');
        // Force refetch even if cache is fresh
        refetch({ cancelRefetch: false });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetch]);

  const handleCreateBanner = async () => {
    if (isGuest) {
      navigate('/templates');
      return;
    }
    const result = await createBanner.mutateAsync({
      name: t('message:placeholder.untitledBanner'),
      template: DEFAULT_TEMPLATES[0],
    });
    if (result) {
      navigate(`/banner/${result.id}`);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (window.confirm(t('message:confirm.deleteBanner'))) {
      await deleteBanner.mutateAsync(id);
    }
  };

  const handleDuplicateBanner = async (id: string) => {
    await duplicateBanner.mutateAsync(id);
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveName = async () => {
    if (editingName.trim()) {
      await updateName.mutateAsync(editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleBannerClick = (banner: BannerListItem) => {
    if (isGuest && banner.id === 'guest') {
      try {
        const stored = localStorage.getItem(guestStorageKey);
        if (!stored) return;
        const parsed = JSON.parse(stored) as {
          name: string;
          template: Template;
          elements: CanvasElement[];
          canvasColor: string;
        };
        navigate('/banner', {
          state: {
            template: parsed.template,
            elements: parsed.elements,
            canvasColor: parsed.canvasColor,
            name: parsed.name,
            templateId: parsed.template.id,
          },
        });
      } catch (error) {
        console.warn('[BannerManager] Failed to open guest banner:', error);
      }
      return;
    }
    navigate(`/banner/${banner.id}`);
  };

  const displayedBanners = isGuest ? (guestBanner ? [guestBanner] : []) : banners;

  return (
    <div className="min-h-screen bg-[#212526]">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <GalleryTabs />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">
            {t('banner:title')} ({displayedBanners.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">{t('common:status.loading')}</p>
          </div>
        ) : displayedBanners.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('banner:noBanners')}</h3>
            <p className="text-gray-500 mb-6">{t('banner:createFirst')}</p>
            <button
              onClick={handleCreateBanner}
              disabled={createBanner.isPending}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {createBanner.isPending ? t('common:status.creating') : t('banner:createFirst')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedBanners.map((banner) => {
              const isGuestBanner = isGuest && banner.id === 'guest';
              return (
              <div
                key={banner.id}
                className="group bg-white rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all overflow-hidden"
              >
                <div
                  className="aspect-[9/16] bg-gray-100 cursor-pointer relative overflow-hidden"
                  onClick={() => handleBannerClick(banner)}
                >
                  {banner.thumbnailUrl ? (
                    <>
                      {imageLoadingStates[banner.id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <span className="text-xs text-gray-500">読み込み中...</span>
                          </div>
                        </div>
                      )}
                      <img
                        src={banner.thumbnailUrl}
                        alt={banner.name}
                        className="w-full h-full object-cover"
                        onLoadStart={() => {
                          setImageLoadingStates(prev => ({ ...prev, [banner.id]: true }));
                        }}
                        onLoad={() => {
                          setImageLoadingStates(prev => ({ ...prev, [banner.id]: false }));
                        }}
                        onError={() => {
                          setImageLoadingStates(prev => ({ ...prev, [banner.id]: false }));
                        }}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-400">サムネイルなし</span>
                      </div>
                    </div>
                  )}

                  {/* Badges (top left) */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                  </div>

                  {/* Semi-transparent overlay with banner info */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 pt-8">
                    {editingId === banner.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        onBlur={() => handleSaveName()}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 text-sm font-medium bg-white/90 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-1 mb-1">
                        <h3 className="font-medium text-white text-sm truncate flex-1">
                          {banner.name}
                        </h3>
                        {!isGuestBanner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(banner.id, banner.name);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-all"
                            title={t('banner:editName')}
                          >
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-white/80">
                      {formatDate(banner.updatedAt)}
                    </p>
                  </div>

                  {/* Action buttons overlay (top right) */}
                  {!isGuest && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateBanner(banner.id);
                        }}
                        disabled={duplicateBanner.isPending}
                        className="w-7 h-7 bg-white/90 hover:bg-white text-gray-700 rounded-md transition-colors flex items-center justify-center group/duplicate relative shadow-sm disabled:opacity-50"
                        title={t('banner:duplicate')}
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        <span className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/duplicate:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {t('banner:duplicate')}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBanner(banner.id);
                        }}
                        disabled={deleteBanner.isPending}
                        className="w-7 h-7 bg-white/90 hover:bg-white text-red-600 rounded-md transition-colors flex items-center justify-center group/delete relative shadow-sm disabled:opacity-50"
                        title={t('banner:delete')}
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/delete:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {t('banner:delete')}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
            })}

            {/* Add new banner card */}
            {!isGuest && (
              <div
                onClick={handleCreateBanner}
                className="group bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
              >
                <div className="aspect-[9/16] bg-gray-50 flex items-center justify-center">
                  <div className="text-center px-4">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                      {t('banner:newBanner')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
};
