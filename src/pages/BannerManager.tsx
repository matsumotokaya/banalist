import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { bannerStorage } from '../utils/bannerStorage';
import { DEFAULT_TEMPLATES } from '../templates/defaultTemplates';
import type { Banner } from '../types/template';

export const BannerManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = () => {
    setBanners(bannerStorage.getAll());
  };

  const handleCreateBanner = () => {
    const newBanner = bannerStorage.create('Untitled Banner', DEFAULT_TEMPLATES[0]);
    navigate(`/banner/${newBanner.id}`);
  };

  const handleDeleteBanner = (id: string) => {
    if (window.confirm('このバナーを削除しますか？')) {
      bannerStorage.delete(id);
      loadBanners();
    }
  };

  const handleDuplicateBanner = (id: string) => {
    const duplicated = bannerStorage.duplicate(id);
    if (duplicated) {
      loadBanners();
    }
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

                <div className="p-4">
                  <h3
                    className="font-medium text-gray-900 mb-1 truncate cursor-pointer hover:text-indigo-600"
                    onClick={() => navigate(`/banner/${banner.id}`)}
                  >
                    {banner.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    更新: {formatDate(banner.updatedAt)}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDuplicateBanner(banner.id)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      title="複製"
                    >
                      複製
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                      title="削除"
                    >
                      削除
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
