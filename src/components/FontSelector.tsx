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

interface FontSelectorProps {
  selectedFont: string;
  onSelect: (font: string) => void;
}

export const FontSelector = ({ selectedFont, onSelect }: FontSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        フォント
      </label>
      <div className="relative">
        <select
          value={selectedFont}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full appearance-none px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:bg-gray-100"
        >
          {AVAILABLE_FONTS.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};
