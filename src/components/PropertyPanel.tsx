import type { CanvasElement, TextElement, ShapeElement } from '../types/template';
import { ColorSelector } from './ColorSelector';

interface PropertyPanelProps {
  selectedElement: CanvasElement | null;
  onColorChange: (color: string) => void;
  onFontChange?: (font: string) => void;
  onSizeChange?: (size: number) => void;
  onWeightChange?: (weight: number) => void;
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
}

const AVAILABLE_FONTS = [
  { name: 'Arial', value: 'Arial' },
  { name: 'Noto Sans JP', value: '"Noto Sans JP", sans-serif' },
  { name: 'Noto Serif JP', value: '"Noto Serif JP", serif' },
  { name: '游ゴシック', value: '"Yu Gothic", "游ゴシック", YuGothic, sans-serif' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Times New Roman', value: 'Times New Roman' },
  { name: 'Courier New', value: 'Courier New' },
  { name: 'Verdana', value: 'Verdana' },
];

const getWeightLabel = (weight: number): string => {
  if (weight <= 100) return 'Thin';
  if (weight <= 200) return 'Extra Light';
  if (weight <= 300) return 'Light';
  if (weight <= 400) return 'Regular';
  if (weight <= 500) return 'Medium';
  if (weight <= 600) return 'Semi Bold';
  if (weight <= 700) return 'Bold';
  if (weight <= 800) return 'Extra Bold';
  return 'Black';
};

export const PropertyPanel = ({ selectedElement, onColorChange, onFontChange, onSizeChange, onWeightChange, onOpacityChange, onBringToFront, onSendToBack, isMobile = false, onClose, onFillEnabledChange, onStrokeChange, onStrokeWidthChange, onStrokeEnabledChange }: PropertyPanelProps) => {
  if (!selectedElement) {
    if (isMobile) {
      return null;
    }
    return (
      <aside className="w-60 bg-[#1a1a1a] border-l border-[#2b2b2b] overflow-y-auto">
        <div className="p-4">
          <h2 className="text-base font-semibold text-gray-100 mb-3">プロパティ</h2>
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-gray-300 text-4xl">select_all</span>
            <p className="text-xs text-gray-400 mt-3">オブジェクトを選択</p>
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
        <h2 className="text-base font-semibold text-gray-100">プロパティ</h2>
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
            {selectedElement.type === 'text' ? 'テキスト' : selectedElement.type === 'image' ? '画像' : '図形'}
          </span>
        </div>
      </div>

      {/* Font selector - only for text */}
      {isTextElement && textElement && onFontChange && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-2">
            フォント
          </label>
          <div className="relative">
            <select
              value={textElement.fontFamily}
              onChange={(e) => onFontChange(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 bg-[#2b2b2b] border border-[#444444] rounded-lg text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer hover:bg-[#333333]"
            >
              {AVAILABLE_FONTS.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Font size slider - only for text */}
      {isTextElement && textElement && onSizeChange && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-2">
            テキストサイズ
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="12"
              max="200"
              step="1"
              value={textElement.fontSize}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="flex-1 h-1.5 bg-[#444444] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-xs font-medium text-gray-300 w-12 text-right">
              {textElement.fontSize}px
            </span>
          </div>
        </div>
      )}

      {/* Font weight slider - only for text */}
      {isTextElement && textElement && onWeightChange && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-2">
            フォントウェイト
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

      {/* Shape-specific: Fill controls */}
      {isShapeElement && shapeElement && (
        <div className="mb-4 p-3 bg-[#2b2b2b] rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-gray-300">塗り</label>
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
            <label className="text-xs font-semibold text-gray-300">線</label>
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
                  <label className="block text-xs font-medium text-gray-300 mb-2">線の太さ</label>
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
              <label className="text-xs font-semibold text-gray-300">塗り</label>
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
              <label className="text-xs font-semibold text-gray-300">線</label>
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
                    <label className="block text-xs font-medium text-gray-300 mb-2">線の太さ</label>
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

      {/* Opacity slider */}
      {onOpacityChange && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-300 mb-2">
            透明度
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
          レイヤー
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onBringToFront}
            className="px-3 py-2 text-xs font-medium text-gray-300 bg-[#333333] hover:bg-[#444444] rounded transition-colors flex items-center justify-center gap-1"
            title="最前面へ"
          >
            <span className="material-symbols-outlined text-[16px]">flip_to_front</span>
            <span>最前面</span>
          </button>
          <button
            onClick={onSendToBack}
            className="px-3 py-2 text-xs font-medium text-gray-300 bg-[#333333] hover:bg-[#444444] rounded transition-colors flex items-center justify-center gap-1"
            title="最背面へ"
          >
            <span className="material-symbols-outlined text-[16px]">flip_to_back</span>
            <span>最背面</span>
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
