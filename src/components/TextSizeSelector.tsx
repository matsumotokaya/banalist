const FONT_SIZES = [
  { label: '小', value: 40 },
  { label: '中', value: 80 },
  { label: '大', value: 120 },
  { label: '特大', value: 160 },
];

interface TextSizeSelectorProps {
  selectedSize: number;
  onSelect: (size: number) => void;
}

export const TextSizeSelector = ({ selectedSize, onSelect }: TextSizeSelectorProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">テキストサイズ</h3>
      <div className="grid grid-cols-4 gap-2">
        {FONT_SIZES.map((size) => (
          <button
            key={size.value}
            onClick={() => onSelect(size.value)}
            className={`py-2 px-3 rounded-lg border-2 transition-all ${
              selectedSize === size.value
                ? 'border-blue-500 bg-blue-50 font-bold'
                : 'border-gray-300 bg-white hover:border-blue-300'
            }`}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );
};
