interface FontWeightSelectorProps {
  selectedWeight: number;
  onSelect: (weight: number) => void;
}

export const FontWeightSelector = ({ selectedWeight, onSelect }: FontWeightSelectorProps) => {
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

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        フォントウェイト
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="100"
          max="900"
          step="100"
          value={selectedWeight}
          onChange={(e) => onSelect(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-sm font-medium text-gray-700 w-24 text-right">
          {getWeightLabel(selectedWeight)}
        </span>
      </div>
    </div>
  );
};
