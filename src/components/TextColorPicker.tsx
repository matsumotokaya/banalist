const COLORS = [
  '#FFFFFF',
  '#000000',
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#A8E6CF',
  '#FFDAC1',
  '#FF8B94',
];

interface TextColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

export const TextColorPicker = ({ selectedColor, onSelect }: TextColorPickerProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        テキストカラー
      </label>
      <div className="grid grid-cols-8 gap-1.5">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className={`w-8 h-8 rounded-md border-2 transition-all ${
              selectedColor === color
                ? 'border-blue-500 scale-110'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};
