interface ColorSelectorProps {
  label?: string;
  selectedColor: string;
  onColorChange: (color: string) => void;
  showInput?: boolean;
}

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
];

export const ColorSelector = ({
  label,
  selectedColor,
  onColorChange,
  showInput = true,
}: ColorSelectorProps) => {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      {showInput && (
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm flex-shrink-0"
            style={{ backgroundColor: selectedColor }}
          />
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}
      <div className="grid grid-cols-6 gap-1.5">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`w-6 h-6 rounded border transition-all hover:scale-110 ${
              selectedColor.toLowerCase() === color.toLowerCase()
                ? 'border-2 border-indigo-600'
                : 'border border-gray-200'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};
