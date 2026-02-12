import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_SIZES } from '../utils/sizeCategories';
import { SizePresetModal } from './SizePresetModal';

interface CanvasSizeSelectorProps {
  width: number;
  height: number;
  onSizeChange: (width: number, height: number) => void;
}

export const CanvasSizeSelector = ({ width, height, onSizeChange }: CanvasSizeSelectorProps) => {
  const { t } = useTranslation('editor');
  const [showCustom, setShowCustom] = useState(false);
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [localWidth, setLocalWidth] = useState(width);
  const [localHeight, setLocalHeight] = useState(height);

  const handlePresetClick = (preset: { width: number; height: number }) => {
    onSizeChange(preset.width, preset.height);
    setLocalWidth(preset.width);
    setLocalHeight(preset.height);
    setShowCustom(false);
  };

  const handleModalSelect = (w: number, h: number) => {
    onSizeChange(w, h);
    setLocalWidth(w);
    setLocalHeight(h);
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    if (localWidth > 0 && localHeight > 0) {
      onSizeChange(localWidth, localHeight);
    }
  };

  return (
    <div className="space-y-3">
      {/* Current size display */}
      <div className="text-xs text-gray-500">
        {t('canvasSizeSelector.currentSize')}: {width} × {height}px
      </div>

      {/* Default preset buttons */}
      <div className="flex flex-col gap-1.5">
        {DEFAULT_SIZES.map((category) => (
          <button
            key={category.key}
            onClick={() => handlePresetClick(category)}
            className={`w-full px-3 py-2 text-xs font-medium rounded transition-colors text-left ${
              width === category.width && height === category.height
                ? 'bg-indigo-600 text-white'
                : 'bg-[#333333] text-gray-300 hover:bg-[#444444]'
            }`}
          >
            <span className="font-mono">{category.width}×{category.height}</span>
            <span className="mx-2 opacity-40">|</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* All sizes button */}
      <button
        onClick={() => setShowAllSizes(true)}
        className="w-full px-3 py-2 text-xs font-medium text-indigo-400 bg-[#333333] rounded hover:bg-[#444444] transition-colors flex items-center justify-center gap-1"
      >
        <span className="material-symbols-outlined text-[14px]">apps</span>
        {t('canvasSizeSelector.allSizes')}
      </button>

      {/* Custom size toggle button */}
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="w-full px-3 py-2 text-xs font-medium text-gray-300 bg-[#333333] rounded hover:bg-[#444444] transition-colors"
      >
        {showCustom ? t('canvasSizeSelector.closeCustomSize') : t('canvasSizeSelector.customSize')}
      </button>

      {/* Custom size inputs */}
      {showCustom && (
        <div className="space-y-3 pt-2 border-t border-[#2b2b2b]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-300">{t('canvasSizeSelector.width')}</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={localWidth}
              onChange={(e) => setLocalWidth(Number(e.target.value))}
              className="w-24 px-2 py-1 text-sm border border-[#444444] bg-[#2b2b2b] text-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-300">{t('canvasSizeSelector.height')}</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={localHeight}
              onChange={(e) => setLocalHeight(Number(e.target.value))}
              className="w-24 px-2 py-1 text-sm border border-[#444444] bg-[#2b2b2b] text-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleCustomApply}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
          >
            {t('canvasSizeSelector.apply')}
          </button>
        </div>
      )}

      {/* All sizes modal */}
      <SizePresetModal
        isOpen={showAllSizes}
        onClose={() => setShowAllSizes(false)}
        onSelect={handleModalSelect}
        currentWidth={width}
        currentHeight={height}
      />
    </div>
  );
};
