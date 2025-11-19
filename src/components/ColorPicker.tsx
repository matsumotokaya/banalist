const PRESET_COLORS = [
  '#FFFFFF',
  '#000000',
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#A8E6CF',
  '#FFDAC1',
  '#FF8B94',
];

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

export const ColorPicker = ({ selectedColor, onSelect }: ColorPickerProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        背景色
      </label>
      <div className="grid grid-cols-4 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className={`w-full aspect-square rounded-lg border-2 transition-all ${
              selectedColor === color
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{ backgroundColor: color }}
          >
            {selectedColor === color && (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
