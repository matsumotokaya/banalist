import type { CanvasElement, TextElement } from '../types/template';

interface PropertyPanelProps {
  selectedElement: CanvasElement | null;
  onColorChange: (color: string) => void;
  onFontChange?: (font: string) => void;
  onSizeChange?: (size: number) => void;
  onWeightChange?: (weight: number) => void;
  onOpacityChange?: (opacity: number) => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
}

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  '#F43F5E', '#991B1B', '#92400E', '#78350F', '#713F12', '#365314',
  '#14532D', '#064E3B', '#134E4A', '#164E63', '#0C4A6E', '#1E3A8A',
  '#312E81', '#4C1D95', '#581C87', '#701A75', '#831843', '#881337',
  '#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A',
  '#059669', '#0D9488', '#0891B2', '#0284C7', '#2563EB', '#4F46E5',
  '#7C3AED', '#9333EA', '#C026D3', '#DB2777', '#E11D48',
];

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

export const PropertyPanel = ({ selectedElement, onColorChange, onFontChange, onSizeChange, onWeightChange, onOpacityChange, onBringToFront, onSendToBack }: PropertyPanelProps) => {
  if (!selectedElement) {
    return (
      <aside className="w-60 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">プロパティ</h2>
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-gray-300 text-4xl">select_all</span>
            <p className="text-xs text-gray-500 mt-3">オブジェクトを選択</p>
          </div>
        </div>
      </aside>
    );
  }

  const currentColor = selectedElement.type === 'text' || selectedElement.type === 'shape'
    ? selectedElement.fill
    : '#000000';

  const isTextElement = selectedElement.type === 'text';
  const textElement = isTextElement ? (selectedElement as TextElement) : null;

  return (
    <aside className="w-60 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">プロパティ</h2>

        {/* Object type indicator */}
        <div className="mb-4 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[18px]">
              {selectedElement.type === 'text' ? 'text_fields' : selectedElement.type === 'image' ? 'image' : 'category'}
            </span>
            <span className="text-xs font-medium text-gray-700">
              {selectedElement.type === 'text' ? 'テキスト' : selectedElement.type === 'image' ? '画像' : '図形'}
            </span>
          </div>
        </div>

        {/* Font selector - only for text */}
        {isTextElement && textElement && onFontChange && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              フォント
            </label>
            <div className="relative">
              <select
                value={textElement.fontFamily}
                onChange={(e) => onFontChange(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer hover:bg-gray-100"
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
            <label className="block text-xs font-medium text-gray-700 mb-2">
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
                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-xs font-medium text-gray-700 w-12 text-right">
                {textElement.fontSize}px
              </span>
            </div>
          </div>
        )}

        {/* Font weight slider - only for text */}
        {isTextElement && textElement && onWeightChange && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">
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
                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-xs font-medium text-gray-700 w-20 text-right">
                {getWeightLabel(textElement.fontWeight)}
              </span>
            </div>
          </div>
        )}

        {/* Current color display */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            カラー
          </label>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm flex-shrink-0"
              style={{ backgroundColor: currentColor }}
            />
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={currentColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Color presets */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            カラーパレット
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-7 h-7 rounded border-2 transition-all hover:scale-110 ${
                  currentColor.toLowerCase() === color.toLowerCase()
                    ? 'border-indigo-600 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Opacity slider */}
        {onOpacityChange && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">
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
                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-xs font-medium text-gray-700 w-12 text-right">
                {Math.round((selectedElement.opacity ?? 1) * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Layer controls */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            レイヤー
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onBringToFront}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center justify-center gap-1"
              title="最前面へ"
            >
              <span className="material-symbols-outlined text-[16px]">flip_to_front</span>
              <span>最前面</span>
            </button>
            <button
              onClick={onSendToBack}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center justify-center gap-1"
              title="最背面へ"
            >
              <span className="material-symbols-outlined text-[16px]">flip_to_back</span>
              <span>最背面</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
