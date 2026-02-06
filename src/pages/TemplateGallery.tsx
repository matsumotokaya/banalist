import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { GalleryTabs } from '../components/GalleryTabs';
import { UpgradeModal } from '../components/UpgradeModal';
import { EditTemplateModal } from '../components/EditTemplateModal';
import { Footer } from '../components/Footer';
import { SortableGrid } from '../components/SortableGrid';
import { DemoCanvas } from '../components/DemoCanvas';
import { useTemplates, templateKeys } from '../hooks/useTemplates';
import { DEFAULT_TEMPLATES } from '../templates/defaultTemplates';
import type { Template, TemplateRecord } from '../types/template';
import { useAuth } from '../contexts/AuthContext';
import { bannerStorage } from '../utils/bannerStorage';
import { templateStorage } from '../utils/templateStorage';
import { SIZE_CATEGORIES } from './BannerManager';

const MAX_DISPLAY_COUNT = 10;

export const TemplateGallery = () => {
  const { t } = useTranslation(['banner', 'common', 'message', 'auth', 'modal']);
  const [templateImageLoadingStates, setTemplateImageLoadingStates] = useState<Record<string, boolean>>({});
  const [templateActionId, setTemplateActionId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateRecord | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile, signInWithGoogle } = useAuth();
  const isGuest = !user;
  const isAdmin = profile?.role === 'admin';
  const guestTemplateId = 'd9c4fee2-8e9c-4703-a507-57f3bde5d2b3';

  const { data: templates = [], isLoading: templatesLoading } = useTemplates();

  // Handle reorder for templates (used by SortableGrid)
  const handleReorderTemplates = async (reorderedTemplates: TemplateRecord[]) => {
    const orders = reorderedTemplates.map((t, index) => ({
      id: t.id,
      displayOrder: index + 1,
    }));

    try {
      await templateStorage.updateDisplayOrders(orders);
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    } catch (error) {
      console.error('Failed to update display orders:', error);
    }
  };

  // Filter templates by size category
  const filterTemplatesBySize = (targetWidth: number, targetHeight: number) => {
    return templates.filter(
      (template) => template.width === targetWidth && template.height === targetHeight
    );
  };

  // Get aspect ratio class based on template dimensions
  const getAspectClass = (width?: number, height?: number) => {
    if (!width || !height) return 'aspect-[9/16]';
    if (width > height) return 'aspect-[16/9]';
    if (width === height) return 'aspect-square';
    return 'aspect-[9/16]';
  };

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
        setShowUpgradeModal(true);
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

  // Render a single template card
  const renderTemplateCard = (template: TemplateRecord) => {
    const aspectClass = getAspectClass(template.width, template.height);

    return (
      <div
        key={template.id}
        className="group bg-white rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all overflow-hidden"
      >
        <div
          className={`${aspectClass} bg-gray-100 relative overflow-hidden ${
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
                  setTemplateImageLoadingStates((prev) => ({ ...prev, [template.id]: true }));
                }}
                onLoad={() => {
                  setTemplateImageLoadingStates((prev) => ({ ...prev, [template.id]: false }));
                }}
                onError={() => {
                  setTemplateImageLoadingStates((prev) => ({ ...prev, [template.id]: false }));
                }}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <svg
                  className="w-12 h-12 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
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
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/60 text-white h-16 w-16 rounded-full shadow-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[40px]">lock</span>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {isGuest && template.id !== guestTemplateId ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-white text-xs font-semibold">{t('banner:unlockWithLogin')}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    signInWithGoogle();
                  }}
                  className="w-28 py-2 bg-white/95 text-gray-900 text-xs font-semibold rounded shadow-sm"
                >
                  {t('auth:login')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  className="w-28 py-2 bg-white/95 text-gray-900 text-xs font-semibold rounded shadow-sm hover:bg-white"
                  disabled={templateActionId === template.id}
                >
                  {templateActionId === template.id
                    ? t('common:status.creating')
                    : t('banner:open')}
                </button>
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTemplate(template);
                    }}
                    className="w-28 py-2 bg-gray-900 text-white text-xs font-semibold rounded shadow-sm hover:bg-gray-800"
                  >
                    {t('modal:editTemplate.editButton')}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 pt-8">
            <h3 className="font-medium text-white text-sm truncate">{template.name}</h3>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#101010]">
      <Header />

      {/* Hero Section - Guest Only */}
      {isGuest && (
        <section className="pt-20 pb-24 px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Your design is{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                99% done.
              </span>
              <br />
              <span className="text-gray-400 text-4xl md:text-5xl lg:text-6xl font-medium">
                You just finish it.
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed">
              Unleash your creativity with WHATIF's social-ready templates.
              <br className="hidden md:block" />
              Loved by creators. Ready to customize.
            </p>

            {/* Interactive Demo Canvas */}
            <div className="max-w-5xl mx-auto">
              <DemoCanvas scale={0.45} />
            </div>
          </div>
        </section>
      )}

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
          <div className="text-center py-12 text-gray-400">{t('banner:noTemplates')}</div>
        ) : (
          <div className="space-y-10">
            {SIZE_CATEGORIES.map((category) => {
              const filteredTemplates = filterTemplatesBySize(category.width, category.height);
              const displayTemplates = filteredTemplates.slice(0, MAX_DISPLAY_COUNT);
              const hasMore = filteredTemplates.length > MAX_DISPLAY_COUNT;
              const gridCols =
                category.width > category.height
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : category.width === category.height
                  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

              return (
                <section key={category.key}>
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/templates/${category.key}`)}
                      className="hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      {category.label}
                    </button>
                    <span className="text-sm font-normal text-gray-400">
                      ({category.width}×{category.height})
                    </span>
                    <span className="text-sm font-normal text-gray-500">
                      — {filteredTemplates.length}件
                    </span>
                  </h3>

                  {filteredTemplates.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 bg-gray-800/30 rounded-lg border border-gray-700/50">
                      該当するテンプレートはありません
                    </div>
                  ) : (
                    <>
                      <SortableGrid
                        items={displayTemplates}
                        disabled={!isAdmin}
                        gridClassName={`grid ${gridCols} gap-4`}
                        onReorder={handleReorderTemplates}
                        renderItem={renderTemplateCard}
                      />
                      {hasMore && (
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => navigate(`/templates/${category.key}`)}
                            className="px-6 py-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded-lg transition-colors"
                          >
                            もっと見る ({filteredTemplates.length - MAX_DISPLAY_COUNT}件)
                            <span className="ml-1">→</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <EditTemplateModal
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        template={editingTemplate}
        onSave={async (params) => {
          if (!editingTemplate) return;
          await templateStorage.updateTemplate(editingTemplate.id, params);
          queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
        }}
        onDelete={async () => {
          if (!editingTemplate) return;
          await templateStorage.deleteTemplate(editingTemplate.id);
          queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
        }}
      />
      <Footer />
    </div>
  );
};
