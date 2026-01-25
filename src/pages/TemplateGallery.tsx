import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import { GalleryTabs } from '../components/GalleryTabs';
import { useTemplates } from '../hooks/useTemplates';
import { DEFAULT_TEMPLATES } from '../templates/defaultTemplates';
import type { Template, TemplateRecord } from '../types/template';
import { useAuth } from '../contexts/AuthContext';
import { bannerStorage } from '../utils/bannerStorage';
import { templateStorage } from '../utils/templateStorage';

export const TemplateGallery = () => {
  const { t } = useTranslation(['banner', 'common', 'message']);
  const [templateImageLoadingStates, setTemplateImageLoadingStates] = useState<Record<string, boolean>>({});
  const [templateActionId, setTemplateActionId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, profile, signInWithGoogle } = useAuth();
  const isGuest = !user;
  const guestTemplateId = 'd9c4fee2-8e9c-4703-a507-57f3bde5d2b3';

  const { data: templates = [], isLoading: templatesLoading } = useTemplates();

  const buildEditorTemplate = (template: TemplateRecord): Template => {
    const fallbackTemplate = DEFAULT_TEMPLATES[0];
    return {
      id: template.id,
      name: template.name,
      width: template.width ?? fallbackTemplate.width,
      height: template.height ?? fallbackTemplate.height,
      backgroundColor: template.canvasColor,
      thumbnail: template.thumbnailUrl,
      planType: template.planType,
    };
  };

  const handleTemplateClick = async (template: TemplateRecord) => {
    const isGuestAllowed = isGuest && template.id === guestTemplateId;
    if (isGuest && !isGuestAllowed) {
      return;
    }
    const resolvedTemplate = template.elements
      ? template
      : await templateStorage.getById(template.id);
    if (!resolvedTemplate?.elements) {
      alert('テンプレートの読み込みに失敗しました');
      return;
    }

    if (!isGuestAllowed && resolvedTemplate.planType === 'premium') {
      if (!user || !profile || profile.subscriptionTier === 'free') {
        alert('プレミアムテンプレートを使うにはアップグレードが必要です。');
        return;
      }
    }

    const editorTemplate = buildEditorTemplate(resolvedTemplate);
    const templateElements = JSON.parse(JSON.stringify(resolvedTemplate.elements || []));

    if (!user) {
      navigate('/banner', {
        state: {
          template: editorTemplate,
          elements: templateElements,
          canvasColor: resolvedTemplate.canvasColor,
          name: resolvedTemplate.name,
          templateId: resolvedTemplate.id,
        },
      });
      return;
    }

    setTemplateActionId(template.id);
    try {
      const existing = await bannerStorage.getByTemplateId(resolvedTemplate.id);
      if (existing) {
        navigate(`/banner/${existing.id}`);
        return;
      }

      const created = await bannerStorage.createFromTemplate(resolvedTemplate, editorTemplate);
      if (created) {
        navigate(`/banner/${created.id}`);
      }
    } finally {
      setTemplateActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#212526]">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <GalleryTabs />

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-100">
            {t('banner:templatesTitle')} ({templates.length})
          </h2>
        </div>

        {templatesLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="mt-3 text-gray-600">{t('common:status.loading')}</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {t('banner:noTemplates')}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group bg-white rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all overflow-hidden"
              >
                <div
                  className={`aspect-[9/16] bg-gray-100 relative overflow-hidden ${
                    isGuest ? 'cursor-default' : 'cursor-pointer'
                  }`}
                  onClick={() => handleTemplateClick(template)}
                >
                  {template.thumbnailUrl ? (
                    <>
                      {templateImageLoadingStates[template.id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <span className="text-xs text-gray-500">読み込み中...</span>
                          </div>
                        </div>
                      )}
                      <img
                        src={template.thumbnailUrl}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        onLoadStart={() => {
                          setTemplateImageLoadingStates(prev => ({ ...prev, [template.id]: true }));
                        }}
                        onLoad={() => {
                          setTemplateImageLoadingStates(prev => ({ ...prev, [template.id]: false }));
                        }}
                        onError={() => {
                          setTemplateImageLoadingStates(prev => ({ ...prev, [template.id]: false }));
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

                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <div
                      className={`h-6 px-2 rounded-md shadow text-white inline-flex items-center ${
                        template.planType === 'premium'
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                          : 'bg-emerald-500/90'
                      }`}
                    >
                      <span className="text-xs font-bold">
                        {template.planType === 'premium' ? 'PREMIUM' : 'FREE'}
                      </span>
                    </div>
                  </div>
                  {isGuest && template.id !== guestTemplateId && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/70 text-white h-6 w-6 rounded-md shadow flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isGuest && template.id !== guestTemplateId ? (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <p className="text-white text-xs font-semibold">
                          アンロックするにはログインしてください
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            signInWithGoogle();
                          }}
                          className="px-4 py-2 bg-white/95 text-gray-900 text-xs font-semibold rounded shadow-sm"
                        >
                          ログイン
                        </button>
                      </div>
                    ) : (
                      <button
                        className="px-4 py-2 bg-white/95 text-gray-900 text-xs font-semibold rounded shadow-sm"
                        disabled={templateActionId === template.id}
                      >
                        {templateActionId === template.id ? t('common:status.creating') : t('banner:createFromTemplate')}
                      </button>
                    )}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 pt-8">
                    <h3 className="font-medium text-white text-sm truncate">
                      {template.name}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
