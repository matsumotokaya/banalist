interface TextSizeSelectorProps {
  selectedSize: number;
  onSelect: (size: number) => void;
}

export const TextSizeSelector = ({ selectedSize, onSelect }: TextSizeSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        テキストサイズ
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="12"
          max="200"
          step="1"
          value={selectedSize}
          onChange={(e) => onSelect(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-sm font-medium text-gray-700 w-12 text-right">
          {selectedSize}px
        </span>
      </div>
    </div>
  );
};
