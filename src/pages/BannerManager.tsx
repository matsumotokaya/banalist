import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { bannerStorage } from '../utils/bannerStorage';
import { DEFAULT_TEMPLATES } from '../templates/defaultTemplates';
import type { Banner } from '../types/template';

export const BannerManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    const allBanners = await bannerStorage.getAll();
    setBanners(allBanners);
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

        {banners.length === 0 ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="group bg-white rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all overflow-hidden"
              >
                <div
                  className="aspect-video bg-gray-100 cursor-pointer relative overflow-hidden"
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
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
                </div>

                <div className="p-4 relative">
                  {editingId === banner.id ? (
                    <div className="mb-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName(banner.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        onBlur={() => handleSaveName(banner.id)}
                        className="w-full px-2 py-1 text-sm font-medium border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mb-1 group/title">
                      <h3
                        className="font-medium text-gray-900 truncate cursor-pointer hover:text-indigo-600 flex-1"
                        onClick={() => navigate(`/banner/${banner.id}`)}
                      >
                        {banner.name}
                      </h3>
                      <button
                        onClick={() => handleStartEdit(banner.id, banner.name)}
                        className="opacity-0 group-hover/title:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                        title="名前を編集"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    更新: {formatDate(banner.updatedAt)}
                  </p>

                  <div className="absolute bottom-3 right-3 flex gap-1">
                    <button
                      onClick={() => handleDuplicateBanner(banner.id)}
                      className="w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center group/duplicate relative"
                      title="複製"
                    >
                      <span className="material-symbols-outlined text-[20px]">content_copy</span>
                      <span className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/duplicate:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        複製
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center justify-center group/delete relative"
                      title="削除"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
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
              <div className="aspect-video bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                    新規バナー作成
                  </p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-400 mb-1">新しいバナー</h3>
                <p className="text-xs text-gray-400 mb-3">&nbsp;</p>
                <div className="h-[36px]"></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
