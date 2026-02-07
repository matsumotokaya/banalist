import { useTranslation } from 'react-i18next';
import type { CanvasElement, TextElement, ShapeElement } from '../types/template';
import { ColorSelector } from './ColorSelector';
import { FontSelector } from './FontSelector';

interface PropertyPanelProps {
  selectedElement: CanvasElement | null;
  onColorChange: (color: string) => void;
  onFontChange?: (font: string) => void;
  onSizeChange?: (size: number) => void;
  onWeightChange?: (weight: number) => void;
  onLetterSpacingChange?: (letterSpacing: number) => void;
  onLineHeightChange?: (lineHeight: number) => void;
  onOpacityChange?: (opacity: number) => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  isMobile?: boolean;
  onClose?: () => void;

  // Shape-specific handlers
  onFillEnabledChange?: (enabled: boolean) => void;
  onStrokeChange?: (color: string) => void;
  onStrokeWidthChange?: (width: number) => void;
  onStrokeEnabledChange?: (enabled: boolean) => void;

  // Shadow handlers
  onShadowEnabledChange?: (enabled: boolean) => void;
  onShadowColorChange?: (color: string) => void;
  onShadowBlurChange?: (blur: number) => void;
  onShadowOffsetXChange?: (offset: number) => void;
  onShadowOffsetYChange?: (offset: number) => void;
  onShadowOpacityChange?: (opacity: number) => void;
}


export const PropertyPanel = ({ selectedElement, onColorChange, onFontChange, onSizeChange, onWeightChange, onLetterSpacingChange, onLineHeightChange, onOpacityChange, onBringToFront, onSendToBack, isMobile = false, onClose, onFillEnabledChange, onStrokeChange, onStrokeWidthChange, onStrokeEnabledChange, onShadowEnabledChange, onShadowColorChange, onShadowBlurChange, onShadowOffsetXChange, onShadowOffsetYChange, onShadowOpacityChange }: PropertyPanelProps) => {
  const { t } = useTranslation('editor');
  const getWeightLabel = (weight: number): string => {
    if (weight <= 100) return t('properties.fontWeights.thin');
    if (weight <= 200) return t('properties.fontWeights.extraLight');
    if (weight <= 300) return t('properties.fontWeights.light');
    if (weight <= 400) return t('properties.fontWeights.regular');
    if (weight <= 500) return t('properties.fontWeights.medium');
    if (weight <= 600) return t('properties.fontWeights.semiBold');
    if (weight <= 700) return t('properties.fontWeights.bold');
    if (weight <= 800) return t('properties.fontWeights.extraBold');
    return t('properties.fontWeights.black');
  };

  if (!selectedElement) {
    if (isMobile) {
      return null;
    }
    return (
      <aside className="w-60 bg-[#1a1a1a] border-l border-[#2b2b2b] overflow-y-auto">
        <div className="p-4">
          <h2 className="text-base font-semibold text-gray-100 mb-3">{t('properties.title')}</h2>
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-gray-300 text-4xl">select_all</span>
            <p className="text-xs text-gray-400 mt-3">{t('properties.selectObject')}</p>
          </div>
        </div>
      </aside>
    );
  }

  const isTextElement = selectedElement.type === 'text';
  const textElement = isTextElement ? (selectedElement as TextElement) : null;

  const isShapeElement = selectedElement.type === 'shape';
  const shapeElement = isShapeElement ? (selectedElement as ShapeElement) : null;

  const panelContent = (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-100">{t('properties.title')}</h2>
        {isMobile && onClose && (
          <button onClick={onClose} className="p-1 hover:bg-[#333333] rounded">
            <span className="material-symbols-outlined text-gray-400 text-xl">close</span>
          </button>
        )}
      </div>

      {/* Object type indicator */}
      <div className="mb-4 p-2 bg-[#2b2b2b] rounded-lg">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600 text-[18px]">
            {selectedElement.type === 'text' ? 'text_fields' : selectedElement.type === 'image' ? 'image' : 'category'}
          </span>
          <span className="text-xs font-medium text-gray-300">
            {selectedElement.type === 'text' ? t('object.text') : selectedElement.type === 'image' ? t('object.image') : t('object.shapes')}
          </span>
        </div>
      </div>

      {/* Font selector - only for text */}
      {isTextElement && textElement && onFontChange && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-2">
            {t('properties.font')}
          </label>
          <FontSelector
            selectedFont={textElement.fontFamily}
            onFontChange={onFontChange}
          />
        </div>
      )}

      {/* Font size slider - only for text */}
      {isTextElement && textElement && onSizeChange && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-2">
            {t('properties.textSize')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="12"
              max="2000"
              step="1"
              value={textElement.fontSize}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="flex-1 h-1.5 bg-[#444444] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-xs font-medium text-gray-300 w-14 text-right">
              {textElement.fontSize}px
            </span>
          </div>
        </div>
      )}

      {/* Font weight slider - only for text */}
      {isTextElement && textElement && onWeightChange && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-2">
            {t('properties.fontWeight')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="100"
              max="900"
              step="100"
              value={textElement.fontWeight}
              onChange={(e) => onWeightChange(Number(e.target.value))}
              className="flex-1 h-1.5 bg-[#444444] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-xs font-medium text-gray-300 w-20 text-right">
              {getWeightLabel(textElement.fontWeight)}
            </span>
          </div>
        </div>
      )}

      {/* Letter spacing slider - only for text */}
      {isTextElement && textElement && onLetterSpacingChange && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-2">
            {t('properties.letterSpacing')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={textElement.letterSpacing ?? 0}
              onChange={(e) => onLetterSpacingChange(Number(e.target.value))}
              className="flex-1 h-1.5 bg-[#444444] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-xs font-medium text-gray-300 w-12 text-right">
              {(textElement.letterSpacing ?? 0)}px
            </span>
          </div>
        </div>
      )}

      {/* Line height slider - only for text */}
      {isTextElement && textElement && onLineHeightChange && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-2">
            {t('properties.lineHeight')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={textElement.lineHeight ?? 1}
              onChange={(e) => onLineHeightChange(Number(e.target.value))}
              className="flex-1 h-1.5 bg-[#444444] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-xs font-medium text-gray-300 w-12 text-right">
              {((textElement.lineHeight ?? 1) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* Shape-specific: Fill controls */}
      {isShapeElement && shapeElement && (
        <div className="mb-4 p-3 bg-[#2b2b2b] rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-gray-300">{t('properties.fill')}</label>
            {onFillEnabledChange && (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shapeElement.fillEnabled}
                  onChange={(e) => onFillEnabledChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#444444] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            )}
          </div>
          {shapeElement.fillEnabled && (
            <ColorSelector
              selectedColor={shapeElement.fill}
              onColorChange={onColorChange}
              showInput={true}
            />
          )}
        </div>
      )}

      {/* Shape-specific: Stroke controls */}
      {isShapeElement && shapeElement && (
        <div className="mb-4 p-3 bg-[#2b2b2b] rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-gray-300">{t('properties.stroke')}</label>
            {onStrokeEnabledChange && (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shapeElement.strokeEnabled}
                  onChange={(e) => onStrokeEnabledChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#444444] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            )}
          </div>
          {shapeElement.strokeEnabled && (
            <>
              <ColorSelector
                selectedColor={shapeElement.stroke}
                onColorChange={(color) => onStrokeChange && onStrokeChange(color)}
                showInput={true}
              />
              {onStrokeWidthChange && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-300 mb-2">{t('properties.strokeWidth')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={shapeElement.strokeWidth}
                      onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-[#444444] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-xs font-medium text-gray-300 w-10 text-right">
                      {shapeElement.strokeWidth}px
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Text-specific: Fill and Stroke controls */}
      {isTextElement && textElement && (
        <>
          {/* Fill controls */}
          <div className="mb-4 p-3 bg-[#2b2b2b] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-300">{t('properties.fill')}</label>
              {onFillEnabledChange && (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={textElement.fillEnabled}
                    onChange={(e) => onFillEnabledChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#444444] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              )}
            </div>
            {textElement.fillEnabled && (
              <ColorSelector
                selectedColor={textElement.fill}
                onColorChange={onColorChange}
                showInput={true}
              />
            )}
          </div>

          {/* Stroke controls */}
          <div className="mb-4 p-3 bg-[#2b2b2b] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-300">{t('properties.stroke')}</label>
              {onStrokeEnabledChange && (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={textElement.strokeEnabled}
                    onChange={(e) => onStrokeEnabledChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#444444] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              )}
            </div>
            {textElement.strokeEnabled && (
              <>
                <ColorSelector
                  selectedColor={textElement.stroke}
                  onColorChange={(color) => onStrokeChange && onStrokeChange(color)}
                  showInput={true}
                />
                {onStrokeWidthChange && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-300 mb-2">{t('properties.strokeWidth')}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={textElement.strokeWidth}
                        onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
                        className="flex-1 h-1.5 bg-[#444444] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <span className="text-xs font-medium text-gray-300 w-10 text-right">
                        {textElement.strokeWidth}px
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Shadow controls - all element types */}
      <div className="mb-4 p-3 bg-[#2b2b2b] rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-gray-300">{t('properties.shadow')}</label>
          {onShadowEnabledChange && (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedElement.shadowEnabled ?? false}
                onChange={(e) => onShadowEnabledChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#444444] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          )}
        </div>
        {(selectedElement.shadowEnabled ?? false) && (
          <>
            {onShadowColorChange && (
              <ColorSelector
                selectedColor={selectedElement.shadowColor ?? '#000000'}
                onColorChange={onShadowColorChange}
                showInput={true}
              />
            )}
            {onShadowBlurChange && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-300 mb-2">{t('properties.shadowBlur')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={selectedElement.shadowBlur ?? 4}
                    onChange={(e) => onShadowBlurChange(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-[#444444] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-xs font-medium text-gray-300 w-10 text-right">
                    {selectedElement.shadowBlur ?? 4}px
                  </span>
                </div>
              </div>
            )}
            {onShadowOffsetXChange && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-300 mb-2">{t('properties.shadowOffsetX')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={selectedElement.shadowOffsetX ?? 2}
                    onChange={(e) => onShadowOffsetXChange(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-[#444444] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-xs font-medium text-gray-300 w-10 text-right">
                    {selectedElement.shadowOffsetX ?? 2}px
                  </span>
                </div>
              </div>
            )}
            {onShadowOffsetYChange && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-300 mb-2">{t('properties.shadowOffsetY')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={selectedElement.shadowOffsetY ?? 2}
                    onChange={(e) => onShadowOffsetYChange(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-[#444444] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-xs font-medium text-gray-300 w-10 text-right">
                    {selectedElement.shadowOffsetY ?? 2}px
                  </span>
                </div>
              </div>
            )}
            {onShadowOpacityChange && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-300 mb-2">{t('properties.shadowOpacity')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={(selectedElement.shadowOpacity ?? 0.5) * 100}
                    onChange={(e) => onShadowOpacityChange(Number(e.target.value) / 100)}
                    className="flex-1 h-1.5 bg-[#444444] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-xs font-medium text-gray-300 w-12 text-right">
                    {Math.round((selectedElement.shadowOpacity ?? 0.5) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Opacity slider */}
      {onOpacityChange && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-300 mb-2">
            {t('properties.opacity')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={(selectedElement.opacity ?? 1) * 100}
              onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
              className="flex-1 h-1.5 bg-[#444444] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-xs font-medium text-gray-300 w-12 text-right">
              {Math.round((selectedElement.opacity ?? 1) * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Layer controls */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">
          {t('properties.layer')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onBringToFront}
            className="px-3 py-2 text-xs font-medium text-gray-300 bg-[#333333] hover:bg-[#444444] rounded transition-colors flex items-center justify-center gap-1"
            title={t('properties.bringToFront')}
          >
            <span className="material-symbols-outlined text-[16px]">flip_to_front</span>
            <span>{t('properties.bringToFront')}</span>
          </button>
          <button
            onClick={onSendToBack}
            className="px-3 py-2 text-xs font-medium text-gray-300 bg-[#333333] hover:bg-[#444444] rounded transition-colors flex items-center justify-center gap-1"
            title={t('properties.sendToBack')}
          >
            <span className="material-symbols-outlined text-[16px]">flip_to_back</span>
            <span>{t('properties.sendToBack')}</span>
          </button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

        {/* Modal */}
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
          <div className="p-4">
            {panelContent}
          </div>
        </div>
      </>
    );
  }

  return (
    <aside className="w-60 bg-[#1a1a1a] border-l border-[#2b2b2b] overflow-y-auto">
      <div className="p-4">
        {panelContent}
      </div>
    </aside>
  );
};
