import { useState } from 'react';

interface CanvasSizeSelectorProps {
  width: number;
  height: number;
  onSizeChange: (width: number, height: number) => void;
}

interface SizePreset {
  name: string;
  width: number;
  height: number;
}

const SIZE_PRESETS: SizePreset[] = [
  { name: 'HD 横', width: 1920, height: 1080 },
  { name: 'HD 縦', width: 1080, height: 1920 },
  { name: 'YouTube', width: 1280, height: 720 },
  { name: 'OGP Image', width: 1200, height: 630 },
  { name: 'note', width: 1280, height: 670 },
  { name: 'Instagram 正方形', width: 1080, height: 1080 },
  { name: 'Instagram フィード', width: 1080, height: 1350 },
  { name: 'Twitter ヘッダー', width: 1500, height: 500 },
];

export const CanvasSizeSelector = ({ width, height, onSizeChange }: CanvasSizeSelectorProps) => {
  const [showCustom, setShowCustom] = useState(false);
  const [localWidth, setLocalWidth] = useState(width);
  const [localHeight, setLocalHeight] = useState(height);

  const handlePresetClick = (preset: SizePreset) => {
    onSizeChange(preset.width, preset.height);
    setLocalWidth(preset.width);
    setLocalHeight(preset.height);
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    if (localWidth > 0 && localHeight > 0) {
      onSizeChange(localWidth, localHeight);
    }
  };

  return (
    <div className="space-y-3">
      {/* Preset buttons */}
      <div className="grid grid-cols-2 gap-2">
        {SIZE_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handlePresetClick(preset)}
            className={`px-2 py-1.5 text-xs font-medium rounded transition-colors ${
              width === preset.width && height === preset.height
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={`${preset.width} × ${preset.height}px`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Custom size toggle button */}
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
      >
        {showCustom ? 'カスタムサイズを閉じる' : 'カスタムサイズ'}
      </button>

      {/* Custom size inputs */}
      {showCustom && (
        <div className="space-y-3 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">幅</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={localWidth}
              onChange={(e) => setLocalWidth(Number(e.target.value))}
              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">高さ</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={localHeight}
              onChange={(e) => setLocalHeight(Number(e.target.value))}
              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleCustomApply}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
          >
            適用
          </button>
        </div>
      )}

      {/* Current size display */}
      <div className="text-xs text-gray-500 text-center pt-1">
        現在: {width} × {height}px
      </div>
    </div>
  );
};
