import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextEditor } from './TextEditor';
import { ShapeSelector } from './ShapeSelector';
import { ImageUploader } from './ImageUploader';
import { ImageLibraryModal } from './ImageLibraryModal';
import { UpgradeModal } from './UpgradeModal';
import { ColorSelector } from './ColorSelector';
import { useAuth } from '../contexts/AuthContext';
import type { CanvasElement } from '../types/template';
import { arrayMove } from '@dnd-kit/sortable';

interface MobileToolbarProps {
  canvasColor: string;
  onSelectColor: (color: string) => void;
  onAddText: () => void;
  onAddShape: (shapeType: 'rectangle' | 'triangle' | 'star' | 'circle' | 'heart') => void;
  onAddImage: (src: string, width: number, height: number) => void;
  textPlacementMode?: boolean;
  elements?: CanvasElement[];
  selectedElementIds?: string[];
  onSelectElement?: (ids: string[]) => void;
  onReorderElements?: (newOrder: CanvasElement[]) => void;
  onToggleLock?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  panMode?: boolean;
  onPanModeChange?: (mode: boolean) => void;
}

type DrawerType = 'tool' | 'layer' | null;

export const MobileToolbar = ({
  canvasColor,
  onSelectColor,
  onAddText,
  onAddShape,
  onAddImage,
  textPlacementMode = false,
  elements = [],
  selectedElementIds = [],
  onSelectElement,
  onReorderElements,
  onToggleLock,
  onToggleVisibility,
  panMode = false,
  onPanModeChange,
}: MobileToolbarProps) => {
  const { t } = useTranslation('editor');
  const { profile, loading } = useAuth();
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isPremium = !!profile && profile.subscriptionTier !== 'free';

  const handleImageLibraryClick = () => {
    if (loading) return;
    if (!profile || profile.subscriptionTier === 'free') {
      setShowUpgradeModal(true);
    } else {
      setShowImageLibrary(true);
    }
  };

  const handleMoveLayer = (elementId: string, direction: 'up' | 'down') => {
    const reversedElements = [...elements].reverse();
    const index = reversedElements.findIndex((el) => el.id === elementId);
    if (index < 0) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reversedElements.length) return;

    const reordered = arrayMove(reversedElements, index, targetIndex);
    onReorderElements?.(reordered.reverse());
  };

  const getLayerName = (element: CanvasElement): string => {
    if (element.type === 'text') {
      return element.text.length > 20 ? element.text.substring(0, 20) + '...' : element.text;
    } else if (element.type === 'image') {
      try {
        const url = new URL(element.src);
        const pathParts = url.pathname.split('/');
        const filename = pathParts[pathParts.length - 1];
        return filename.length > 20 ? filename.substring(0, 20) + '...' : filename;
      } catch {
        return 'Image';
      }
    } else if (element.type === 'shape') {
      const shapeType = element.shapeType || 'shape';
      return t(`object.${shapeType}`);
    }
    return 'Unknown';
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center gap-3 px-4">
        <button
          onClick={() => setActiveDrawer(activeDrawer === 'tool' ? null : 'tool')}
          className={`px-6 py-3 rounded-full font-medium text-sm shadow-lg transition-all flex items-center gap-2 ${
            activeDrawer === 'tool'
              ? 'bg-indigo-600 text-white'
              : 'bg-[#1a1a1a] text-gray-300 border border-[#2b2b2b]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">construction</span>
          {t('tabs.tool')}
        </button>
        <button
          onClick={() => setActiveDrawer(activeDrawer === 'layer' ? null : 'layer')}
          className={`px-6 py-3 rounded-full font-medium text-sm shadow-lg transition-all flex items-center gap-2 ${
            activeDrawer === 'layer'
              ? 'bg-indigo-600 text-white'
              : 'bg-[#1a1a1a] text-gray-300 border border-[#2b2b2b]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">layers</span>
          {t('tabs.layer')}
        </button>
      </div>

      {/* Drawer */}
      {activeDrawer && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/80 backdrop-blur-sm border-t border-[#2b2b2b] rounded-t-2xl shadow-2xl z-50 max-h-[50vh] overflow-y-auto">
          <div className="p-5">
            {/* Tool Drawer */}
            {activeDrawer === 'tool' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-300">{t('tabs.tool')}</h3>
                  <button onClick={() => setActiveDrawer(null)} className="p-1 hover:bg-[#333333] rounded">
                    <span className="material-symbols-outlined text-gray-400 text-xl">close</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex bg-[#222222] rounded p-0.5">
                    <button
                      onClick={() => onPanModeChange?.(false)}
                      className={`flex-1 py-2 text-xs rounded flex items-center justify-center gap-1 transition-colors ${
                        !panMode ? 'bg-[#444444] text-white' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_selector_tool</span>
                      {t('tabs.selectTool')}
                    </button>
                    <button
                      onClick={() => onPanModeChange?.(true)}
                      className={`flex-1 py-2 text-xs rounded flex items-center justify-center gap-1 transition-colors ${
                        panMode ? 'bg-[#444444] text-white' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">pan_tool</span>
                      {t('tabs.handTool')}
                    </button>
                  </div>
                  <TextEditor onAddText={onAddText} isActive={textPlacementMode} />
                  <ShapeSelector onAddShape={onAddShape} />
                  <ImageUploader onAddImage={onAddImage} />

                  <button
                    onClick={handleImageLibraryClick}
                    className={`w-full px-3 py-2 text-xs font-medium text-gray-300 bg-[#333333] hover:bg-[#444444] rounded transition-colors flex items-center justify-center gap-1 relative ${!isPremium ? 'opacity-60' : ''}`}
                    title={isPremium ? t('imageUploader.chooseFromLibrary') : 'Premium members only'}
                  >
                    <span className="material-symbols-outlined text-[16px]">photo_library</span>
                    <span>{t('imageUploader.chooseFromLibrary')}</span>
                    {!isPremium && (
                      <span className="material-symbols-outlined text-[14px] text-yellow-400 ml-1">lock</span>
                    )}
                  </button>

                  <div className="pt-3 border-t border-[#2b2b2b]">
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      {t('page.backgroundColor')}
                    </label>
                    <ColorSelector selectedColor={canvasColor} onColorChange={onSelectColor} showInput={true} />
                  </div>
                </div>
              </div>
            )}

            {/* Layer Drawer */}
            {activeDrawer === 'layer' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-300">{t('tabs.layer')}</h3>
                  <button onClick={() => setActiveDrawer(null)} className="p-1 hover:bg-[#333333] rounded">
                    <span className="material-symbols-outlined text-gray-400 text-xl">close</span>
                  </button>
                </div>

                {elements.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-gray-500 text-4xl">layers_clear</span>
                    <p className="text-xs text-gray-400 mt-2">{t('layer.empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...elements].reverse().map((element, index, arr) => {
                      const isSelected = selectedElementIds.includes(element.id);
                      return (
                        <div
                          key={element.id}
                          onClick={() => {
                            onSelectElement?.([element.id]);
                            setActiveDrawer(null);
                          }}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-900/30 border-indigo-600'
                              : 'bg-[#2b2b2b] border-[#444444] hover:border-[#555555]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400 text-[20px]">
                              {element.type === 'text' ? 'text_fields' : element.type === 'image' ? 'image' : 'category'}
                            </span>
                            <span className="flex-1 text-sm text-gray-300 truncate">{getLayerName(element)}</span>
                            <div className="flex items-center gap-0.5">
                              {/* Move up (higher in layer order) */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveLayer(element.id, 'up');
                                }}
                                disabled={index === 0}
                                className="p-1 hover:bg-[#444444] rounded disabled:opacity-30"
                              >
                                <span className="material-symbols-outlined text-[16px] text-gray-400">arrow_upward</span>
                              </button>
                              {/* Move down (lower in layer order) */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveLayer(element.id, 'down');
                                }}
                                disabled={index === arr.length - 1}
                                className="p-1 hover:bg-[#444444] rounded disabled:opacity-30"
                              >
                                <span className="material-symbols-outlined text-[16px] text-gray-400">arrow_downward</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleVisibility?.(element.id);
                                }}
                                className="p-1 hover:bg-[#444444] rounded"
                              >
                                <span className="material-symbols-outlined text-[16px] text-gray-400">
                                  {element.visible ? 'visibility' : 'visibility_off'}
                                </span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleLock?.(element.id);
                                }}
                                className="p-1 hover:bg-[#444444] rounded"
                              >
                                <span className="material-symbols-outlined text-[16px] text-gray-400">
                                  {element.locked ? 'lock' : 'lock_open'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <ImageLibraryModal
        isOpen={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        onSelectImage={onAddImage}
        initialTab="user"
      />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
};
