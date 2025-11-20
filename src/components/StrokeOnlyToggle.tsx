interface StrokeOnlyToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const StrokeOnlyToggle = ({ enabled, onToggle }: StrokeOnlyToggleProps) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="stroke-only"
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
      />
      <label
        htmlFor="stroke-only"
        className="text-sm font-medium text-gray-700 cursor-pointer"
      >
        輪郭のみ表示
      </label>
    </div>
  );
};
