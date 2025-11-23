import { ColorSelector } from './ColorSelector';
import { TextEditor } from './TextEditor';
import { ImageUploader } from './ImageUploader';
import { CanvasSizeSelector } from './CanvasSizeSelector';

interface SidebarProps {
  canvasColor: string;
  canvasWidth: number;
  canvasHeight: number;
  onSelectColor: (color: string) => void;
  onCanvasSizeChange: (width: number, height: number) => void;
  onAddText: (text: string) => void;
  onAddShape: (shapeType: 'rectangle' | 'triangle' | 'star' | 'circle' | 'heart') => void;
  onAddImage: (src: string, width: number, height: number) => void;
  isMobile?: boolean;
}

export const Sidebar = ({
  canvasColor,
  canvasWidth,
  canvasHeight,
  onSelectColor,
  onCanvasSizeChange,
  onAddText,
  onAddShape,
  onAddImage,
  isMobile = false,
}: SidebarProps) => {
  if (isMobile) {
    return (
      <aside className="bg-white border-t border-gray-200 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 p-4 min-w-max">
          {/* Text section */}
          <div className="flex flex-col items-center gap-2 min-w-[80px]">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase">テキスト</h3>
            <TextEditor onAddText={onAddText} />
          </div>

          {/* Shape section */}
          <div className="flex flex-col items-center gap-2 min-w-[200px]">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase">図形</h3>
            <div className="flex gap-2">
              <button onClick={() => onAddShape('rectangle')} className="p-2 hover:bg-gray-100 rounded" title="四角形">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <rect x="4" y="6" width="16" height="12" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700" />
                </svg>
              </button>
              <button onClick={() => onAddShape('circle')} className="p-2 hover:bg-gray-100 rounded" title="円形">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700" />
                </svg>
              </button>
              <button onClick={() => onAddShape('triangle')} className="p-2 hover:bg-gray-100 rounded" title="三角形">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M 12 4 L 20 20 L 4 20 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700" />
                </svg>
              </button>
              <button onClick={() => onAddShape('star')} className="p-2 hover:bg-gray-100 rounded" title="星">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M 12 2 L 14 9 L 21 9 L 15 14 L 17 21 L 12 16 L 7 21 L 9 14 L 3 9 L 10 9 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700" />
                </svg>
              </button>
              <button onClick={() => onAddShape('heart')} className="p-2 hover:bg-gray-100 rounded" title="ハート">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M 12 21 C 12 21 3 14 3 8 C 3 5 5 3 7.5 3 C 9 3 10.5 4 12 6 C 13.5 4 15 3 16.5 3 C 19 3 21 5 21 8 C 21 14 12 21 12 21 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700" />
                </svg>
              </button>
            </div>
          </div>

          {/* Image section */}
          <div className="flex flex-col items-center gap-2 min-w-[80px]">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase">画像</h3>
            <ImageUploader onAddImage={onAddImage} />
          </div>

          {/* Background section */}
          <div className="flex flex-col items-center gap-2 min-w-[200px]">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase">背景</h3>
            <ColorSelector selectedColor={canvasColor} onColorChange={onSelectColor} showInput={true} />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-60 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-6">
        <div className="pb-6 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            キャンバスサイズ
          </h2>
          <CanvasSizeSelector
            width={canvasWidth}
            height={canvasHeight}
            onSizeChange={onCanvasSizeChange}
          />
        </div>

        <div className="pb-6 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            テキスト
          </h2>
          <TextEditor onAddText={onAddText} />
        </div>

        <div className="pb-6 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            図形
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onAddShape('rectangle')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="四角形"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <rect x="4" y="6" width="16" height="12" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700" />
              </svg>
            </button>
            <button
              onClick={() => onAddShape('circle')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="円形"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700" />
              </svg>
            </button>
            <button
              onClick={() => onAddShape('triangle')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="三角形"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M 12 4 L 20 20 L 4 20 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700" />
              </svg>
            </button>
            <button
              onClick={() => onAddShape('star')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="星"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M 12 2 L 14 9 L 21 9 L 15 14 L 17 21 L 12 16 L 7 21 L 9 14 L 3 9 L 10 9 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700" />
              </svg>
            </button>
            <button
              onClick={() => onAddShape('heart')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="ハート"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M 12 21 C 12 21 3 14 3 8 C 3 5 5 3 7.5 3 C 9 3 10.5 4 12 6 C 13.5 4 15 3 16.5 3 C 19 3 21 5 21 8 C 21 14 12 21 12 21 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700" />
              </svg>
            </button>
          </div>
        </div>

        <div className="pb-6 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            画像
          </h2>
          <ImageUploader onAddImage={onAddImage} />
        </div>

        <div className="pb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            背景
          </h2>
          <div className="space-y-4">
            <ColorSelector selectedColor={canvasColor} onColorChange={onSelectColor} showInput={true} />
          </div>
        </div>
      </div>
    </aside>
  );
};
