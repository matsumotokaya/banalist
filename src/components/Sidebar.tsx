import { ColorPicker } from './ColorPicker';
import { TextEditor } from './TextEditor';
import { ImageUploader } from './ImageUploader';

interface SidebarProps {
  canvasColor: string;
  onSelectColor: (color: string) => void;
  onAddText: (text: string) => void;
  onAddShape: (shapeType: 'rectangle' | 'triangle' | 'star') => void;
  onAddImage: (src: string, width: number, height: number) => void;
}

export const Sidebar = ({
  canvasColor,
  onSelectColor,
  onAddText,
  onAddShape,
  onAddImage,
}: SidebarProps) => {
  return (
    <aside className="w-60 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-6">
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
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onAddShape('rectangle')}
              className="aspect-square flex items-center justify-center border-2 border-blue-500 hover:bg-blue-50 rounded-lg transition-colors group"
              title="四角形"
            >
              <svg viewBox="0 0 40 40" className="w-8 h-8">
                <rect x="5" y="10" width="30" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
              </svg>
            </button>
            <button
              onClick={() => onAddShape('triangle')}
              className="aspect-square flex items-center justify-center border-2 border-blue-500 hover:bg-blue-50 rounded-lg transition-colors group"
              title="三角形"
            >
              <svg viewBox="0 0 40 40" className="w-8 h-8">
                <path d="M 20 8 L 35 32 L 5 32 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
              </svg>
            </button>
            <button
              onClick={() => onAddShape('star')}
              className="aspect-square flex items-center justify-center border-2 border-blue-500 hover:bg-blue-50 rounded-lg transition-colors group"
              title="星"
            >
              <svg viewBox="0 0 40 40" className="w-8 h-8">
                <path d="M 20 5 L 23 15 L 33 15 L 25 21 L 28 31 L 20 25 L 12 31 L 15 21 L 7 15 L 17 15 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
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
            <ColorPicker selectedColor={canvasColor} onSelect={onSelectColor} />
          </div>
        </div>
      </div>
    </aside>
  );
};
