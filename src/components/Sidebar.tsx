import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColorSelector } from './ColorSelector';
import { TextEditor } from './TextEditor';
import { ImageUploader } from './ImageUploader';
import { CanvasSizeSelector } from './CanvasSizeSelector';
import type { CanvasElement } from '../types/template';

interface SidebarProps {
  canvasColor: string;
  canvasWidth: number;
  canvasHeight: number;
  onSelectColor: (color: string) => void;
  onCanvasSizeChange: (width: number, height: number) => void;
  onAddText: (text: string) => void;
  onAddShape: (shapeType: 'rectangle' | 'triangle' | 'star' | 'circle' | 'heart') => void;
  onAddImage: (src: string, width: number, height: number) => void;
  elements?: CanvasElement[];
  selectedElementIds?: string[];
  onSelectElement?: (ids: string[]) => void;
  onReorderElements?: (newOrder: CanvasElement[]) => void;
  onToggleLock?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  isMobile?: boolean;
}

type TabType = 'page' | 'object' | 'layer';

// Get layer name for display (will be called from component with t function)
const getLayerName = (element: CanvasElement, t: (key: string) => string): string => {
  if (element.type === 'text') {
    return element.text.length > 20 ? element.text.substring(0, 20) + '...' : element.text;
  } else if (element.type === 'image') {
    // Extract filename from URL
    try {
      const url = new URL(element.src);
      const pathParts = url.pathname.split('/');
      const filename = pathParts[pathParts.length - 1];
      return filename.length > 20 ? filename.substring(0, 20) + '...' : filename;
    } catch {
      return t('editor:object.image');
    }
  } else if (element.type === 'shape') {
    return t(`editor:shapes.${element.shapeType}`);
  }
  return t('editor:properties.layer');
};

// Get icon for layer type
const getLayerIcon = (element: CanvasElement): string => {
  if (element.type === 'text') return 'text_fields';
  if (element.type === 'image') return 'image';
  if (element.type === 'shape') {
    const iconMap: Record<string, string> = {
      rectangle: 'rectangle',
      circle: 'circle',
      triangle: 'change_history',
      star: 'star',
      heart: 'favorite',
    };
    return iconMap[element.shapeType] || 'category';
  }
  return 'layers';
};

// Sortable layer item component
interface SortableLayerItemProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (shiftKey: boolean) => void;
  onToggleLock: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  t: (key: string) => string;
}

const SortableLayerItem = ({ element, isSelected, onSelect, onToggleLock, onToggleVisibility, t }: SortableLayerItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });
  const isVisible = element.visible ?? true;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-1">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="p-2 hover:bg-[#444444] rounded cursor-grab active:cursor-grabbing flex-shrink-0"
          title={t('editor:dragToReorder')}
        >
          <span className="material-symbols-outlined text-[18px] text-gray-400">
            drag_indicator
          </span>
        </div>

        {/* Layer info - clickable for selection */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(e.shiftKey);
          }}
          className={`flex-1 min-w-0 flex items-center gap-2 px-3 py-2 rounded text-left transition-colors ${
            isSelected
              ? 'bg-indigo-100 text-indigo-900'
              : 'hover:bg-[#333333] text-gray-300'
          } ${isVisible ? '' : 'opacity-60'}`}
        >
          <span className="material-symbols-outlined text-[18px] flex-shrink-0">
            {getLayerIcon(element)}
          </span>
          <span className="flex-1 min-w-0 text-sm truncate">
            {getLayerName(element, t)}
          </span>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {element.type === 'text' ? 'T' : element.type === 'image' ? 'I' : 'S'}
          </span>
        </button>

        {/* Visibility button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(element.id);
          }}
          className="p-2 hover:bg-[#444444] rounded transition-colors flex-shrink-0"
          title={isVisible ? t('layerVisibility.hide') : t('layerVisibility.show')}
        >
          <span className="material-symbols-outlined text-[18px] text-gray-400">
            {isVisible ? 'visibility' : 'visibility_off'}
          </span>
        </button>

        {/* Lock button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock(element.id);
          }}
          className="p-2 hover:bg-[#444444] rounded transition-colors flex-shrink-0"
          title={element.locked ? t('editor:unlock') : t('editor:lock')}
        >
          <span className="material-symbols-outlined text-[18px] text-gray-400">
            {element.locked ? 'lock' : 'lock_open'}
          </span>
        </button>
      </div>
    </div>
  );
};

export const Sidebar = ({
  canvasColor,
  canvasWidth,
  canvasHeight,
  onSelectColor,
  onCanvasSizeChange,
  onAddText,
  onAddShape,
  onAddImage,
  elements = [],
  selectedElementIds = [],
  onSelectElement,
  onReorderElements,
  onToggleLock,
  onToggleVisibility,
  isMobile = false,
}: SidebarProps) => {
  const { t } = useTranslation('editor');
  const [activeTab, setActiveTab] = useState<TabType>('object');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const reversedElements = [...elements].reverse();
      const oldIndex = reversedElements.findIndex((el) => el.id === active.id);
      const newIndex = reversedElements.findIndex((el) => el.id === over.id);

      const reordered = arrayMove(reversedElements, oldIndex, newIndex);
      // Reverse back to original order (bottom to top)
      const finalOrder = reordered.reverse();
      onReorderElements?.(finalOrder);
    }
  };
  if (isMobile) {
    return (
      <aside className="bg-[#1a1a1a] border-t border-[#2b2b2b] overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 p-4 min-w-max">
          {/* Text section */}
          <div className="flex flex-col items-center gap-2 min-w-[80px]">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase">{t('object.text')}</h3>
            <TextEditor onAddText={onAddText} />
          </div>

          {/* Shape section */}
          <div className="flex flex-col items-center gap-2 min-w-[200px]">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase">{t('object.shapes')}</h3>
            <div className="flex gap-2">
              <button onClick={() => onAddShape('rectangle')} className="p-2 hover:bg-[#333333] rounded" title={t('shapes.rectangle')}>
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <rect x="4" y="6" width="16" height="12" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300" />
                </svg>
              </button>
              <button onClick={() => onAddShape('circle')} className="p-2 hover:bg-[#333333] rounded" title={t('shapes.circle')}>
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300" />
                </svg>
              </button>
              <button onClick={() => onAddShape('triangle')} className="p-2 hover:bg-[#333333] rounded" title={t('shapes.triangle')}>
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M 12 4 L 20 20 L 4 20 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300" />
                </svg>
              </button>
              <button onClick={() => onAddShape('star')} className="p-2 hover:bg-[#333333] rounded" title={t('shapes.star')}>
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M 12 2 L 14 9 L 21 9 L 15 14 L 17 21 L 12 16 L 7 21 L 9 14 L 3 9 L 10 9 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300" />
                </svg>
              </button>
              <button onClick={() => onAddShape('heart')} className="p-2 hover:bg-[#333333] rounded" title={t('shapes.heart')}>
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M 12 21 C 12 21 3 14 3 8 C 3 5 5 3 7.5 3 C 9 3 10.5 4 12 6 C 13.5 4 15 3 16.5 3 C 19 3 21 5 21 8 C 21 14 12 21 12 21 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300" />
                </svg>
              </button>
            </div>
          </div>

          {/* Image section */}
          <div className="flex flex-col items-center gap-2 min-w-[80px]">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase">{t('object.image')}</h3>
            <ImageUploader onAddImage={onAddImage} />
          </div>

          {/* Background section */}
          <div className="flex flex-col items-center gap-2 min-w-[240px] max-w-[240px] px-3">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase">{t('page.backgroundColor')}</h3>
            <ColorSelector selectedColor={canvasColor} onColorChange={onSelectColor} showInput={true} />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-60 bg-[#1a1a1a] border-r border-[#2b2b2b] flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-[#2b2b2b]">
        <button
          onClick={() => setActiveTab('page')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'page'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
              : 'text-gray-400 hover:text-gray-100 hover:bg-[#2b2b2b]'
          }`}
        >
          {t('tabs.page')}
        </button>
        <button
          onClick={() => setActiveTab('object')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'object'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
              : 'text-gray-400 hover:text-gray-100 hover:bg-[#2b2b2b]'
          }`}
        >
          {t('tabs.object')}
        </button>
        <button
          onClick={() => setActiveTab('layer')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'layer'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
              : 'text-gray-400 hover:text-gray-100 hover:bg-[#2b2b2b]'
          }`}
        >
          {t('tabs.layer')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'page' && (
          <div className="p-4 space-y-6">
            <div className="pb-6 border-b border-[#2b2b2b]">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {t('page.canvasSize')}
              </h2>
              <CanvasSizeSelector
                width={canvasWidth}
                height={canvasHeight}
                onSizeChange={onCanvasSizeChange}
              />
            </div>

            <div className="pb-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {t('page.backgroundColor')}
              </h2>
              <ColorSelector selectedColor={canvasColor} onColorChange={onSelectColor} showInput={true} />
            </div>
          </div>
        )}

        {activeTab === 'object' && (
          <div className="p-4 space-y-6">
            <div className="pb-6 border-b border-[#2b2b2b]">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {t('object.text')}
              </h2>
              <TextEditor onAddText={onAddText} />
            </div>

            <div className="pb-6 border-b border-[#2b2b2b]">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {t('object.shapes')}
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onAddShape('rectangle')}
                  className="p-2 hover:bg-[#333333] rounded transition-colors"
                  title={t('shapes.rectangle')}
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <rect x="4" y="6" width="16" height="12" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300" />
                  </svg>
                </button>
                <button
                  onClick={() => onAddShape('circle')}
                  className="p-2 hover:bg-[#333333] rounded transition-colors"
                  title={t('shapes.circle')}
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300" />
                  </svg>
                </button>
                <button
                  onClick={() => onAddShape('triangle')}
                  className="p-2 hover:bg-[#333333] rounded transition-colors"
                  title={t('shapes.triangle')}
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path d="M 12 4 L 20 20 L 4 20 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300" />
                  </svg>
                </button>
                <button
                  onClick={() => onAddShape('star')}
                  className="p-2 hover:bg-[#333333] rounded transition-colors"
                  title={t('shapes.star')}
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path d="M 12 2 L 14 9 L 21 9 L 15 14 L 17 21 L 12 16 L 7 21 L 9 14 L 3 9 L 10 9 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300" />
                  </svg>
                </button>
                <button
                  onClick={() => onAddShape('heart')}
                  className="p-2 hover:bg-[#333333] rounded transition-colors"
                  title={t('shapes.heart')}
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path d="M 12 21 C 12 21 3 14 3 8 C 3 5 5 3 7.5 3 C 9 3 10.5 4 12 6 C 13.5 4 15 3 16.5 3 C 19 3 21 5 21 8 C 21 14 12 21 12 21 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="pb-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {t('object.image')}
              </h2>
              <ImageUploader onAddImage={onAddImage} />
            </div>
          </div>
        )}

        {activeTab === 'layer' && (
          <div className="p-2">
            {elements.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <span className="material-symbols-outlined text-5xl mb-2">layers</span>
                <p className="text-sm">{t('page.noLayers')}</p>
                <p className="text-xs mt-2">{t('page.addObjects')}</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={[...elements].reverse().map((el) => el.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {/* Display layers in reverse order (top layer first) */}
                    {[...elements].reverse().map((element) => {
                      const isSelected = selectedElementIds.includes(element.id);
                      return (
                        <SortableLayerItem
                          key={element.id}
                          element={element}
                          isSelected={isSelected}
                          onSelect={(shiftKey) => {
                            if (shiftKey) {
                              // Shift + Click: Toggle selection
                              if (isSelected) {
                                // Remove from selection
                                onSelectElement?.(selectedElementIds.filter(id => id !== element.id));
                              } else {
                                // Add to selection
                                onSelectElement?.([...selectedElementIds, element.id]);
                              }
                            } else {
                              // Regular click: Select only this element
                              onSelectElement?.([element.id]);
                            }
                          }}
                          onToggleLock={(id) => onToggleLock?.(id)}
                          onToggleVisibility={(id) => onToggleVisibility?.(id)}
                          t={t}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
