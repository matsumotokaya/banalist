const FONT_SIZES = [
  { label: 'S', value: 40 },
  { label: 'M', value: 80 },
  { label: 'L', value: 120 },
  { label: 'XL', value: 160 },
];

interface TextSizeSelectorProps {
  selectedSize: number;
  onSelect: (size: number) => void;
}

export const TextSizeSelector = ({ selectedSize, onSelect }: TextSizeSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        テキストサイズ
      </label>
      <div className="grid grid-cols-4 gap-2">
        {FONT_SIZES.map((size) => (
          <button
            key={size.value}
            onClick={() => onSelect(size.value)}
            className={`relative py-2.5 rounded-lg text-sm font-medium transition-all ${
              selectedSize === size.value
                ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );
};
