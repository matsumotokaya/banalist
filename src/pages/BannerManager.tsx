import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { bannerStorage } from '../utils/bannerStorage';
import { DEFAULT_TEMPLATES } from '../templates/defaultTemplates';
import type { Banner } from '../types/template';

export const BannerManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadBanners();
  }, []);

  // Reload banners when page becomes visible (to refresh thumbnails)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadBanners();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadBanners = async () => {
    setIsLoading(true);
    const allBanners = await bannerStorage.getAll();
    setBanners(allBanners);
    setIsLoading(false);
  };

  const handleCreateBanner = async () => {
    const newBanner = await bannerStorage.create('Untitled Banner', DEFAULT_TEMPLATES[0]);
    if (newBanner) {
      navigate(`/banner/${newBanner.id}`);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (window.confirm('このバナーを削除しますか？')) {
      await bannerStorage.delete(id);
      await loadBanners();
    }
  };

  const handleDuplicateBanner = async (id: string) => {
    const duplicated = await bannerStorage.duplicate(id);
    if (duplicated) {
      await loadBanners();
    }
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveName = async (id: string) => {
    if (editingName.trim()) {
      await bannerStorage.update(id, { name: editingName.trim() });
      await loadBanners();
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
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            マイバナー ({banners.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">バナーがありません</h3>
            <p className="text-gray-500 mb-6">新しいバナーを作成して始めましょう</p>
            <button
              onClick={handleCreateBanner}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              最初のバナーを作成
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="group bg-white rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all overflow-hidden"
              >
                <div
                  className="aspect-[9/16] bg-gray-100 cursor-pointer relative overflow-hidden"
                  onClick={() => navigate(`/banner/${banner.id}`)}
                >
                  {banner.thumbnailDataURL ? (
                    <img
                      src={banner.thumbnailDataURL}
                      alt={banner.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Premium lock badge (top left) */}
                  {banner.planType === 'premium' && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                      </svg>
                      <span className="text-xs font-bold">PREMIUM</span>
                    </div>
                  )}

                  {/* Semi-transparent overlay with banner info */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 pt-8">
                    {editingId === banner.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName(banner.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        onBlur={() => handleSaveName(banner.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 text-sm font-medium bg-white/90 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-1 mb-1">
                        <h3 className="font-medium text-white text-sm truncate flex-1">
                          {banner.name}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(banner.id, banner.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-all"
                          title="名前を編集"
                        >
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-white/80">
                      {formatDate(banner.updatedAt)}
                    </p>
                  </div>

                  {/* Action buttons overlay (top right) */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateBanner(banner.id);
                      }}
                      className="w-7 h-7 bg-white/90 hover:bg-white text-gray-700 rounded-md transition-colors flex items-center justify-center group/duplicate relative shadow-sm"
                      title="複製"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      <span className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/duplicate:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        複製
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBanner(banner.id);
                      }}
                      className="w-7 h-7 bg-white/90 hover:bg-white text-red-600 rounded-md transition-colors flex items-center justify-center group/delete relative shadow-sm"
                      title="削除"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      <span className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/delete:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        削除
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new banner card */}
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
                    新規バナー作成
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
