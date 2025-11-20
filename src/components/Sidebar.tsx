import type { Template, TextElement } from '../types/template';
import { TemplateSelector } from './TemplateSelector';
import { ColorPicker } from './ColorPicker';
import { FontSelector } from './FontSelector';
import { TextSizeSelector } from './TextSizeSelector';
import { FontWeightSelector } from './FontWeightSelector';
import { TextColorPicker } from './TextColorPicker';
import { StrokeOnlyToggle } from './StrokeOnlyToggle';
import { TextEditor } from './TextEditor';

interface SidebarProps {
  templates: Template[];
  selectedTemplate: Template;
  onSelectTemplate: (template: Template) => void;
  canvasColor: string;
  onSelectColor: (color: string) => void;
  selectedFont: string;
  onSelectFont: (font: string) => void;
  selectedSize: number;
  onSelectSize: (size: number) => void;
  selectedWeight: number;
  onSelectWeight: (weight: number) => void;
  selectedTextColor: string;
  onSelectTextColor: (color: string) => void;
  strokeOnly: boolean;
  onStrokeOnlyToggle: (enabled: boolean) => void;
  onAddText: (text: string) => void;
  onAddRectangle: () => void;
}

export const Sidebar = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  canvasColor,
  onSelectColor,
  selectedFont,
  onSelectFont,
  selectedSize,
  onSelectSize,
  selectedWeight,
  onSelectWeight,
  selectedTextColor,
  onSelectTextColor,
  strokeOnly,
  onStrokeOnlyToggle,
  onAddText,
  onAddRectangle,
}: SidebarProps) => {
  return (
    <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-6">
        <div className="pb-6 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            テキスト
          </h2>
          <div className="space-y-4">
            <FontSelector selectedFont={selectedFont} onSelect={onSelectFont} />
            <TextColorPicker selectedColor={selectedTextColor} onSelect={onSelectTextColor} />
            <TextSizeSelector selectedSize={selectedSize} onSelect={onSelectSize} />
            <FontWeightSelector selectedWeight={selectedWeight} onSelect={onSelectWeight} />
            <StrokeOnlyToggle enabled={strokeOnly} onToggle={onStrokeOnlyToggle} />
            <TextEditor onAddText={onAddText} />
          </div>
        </div>

        <div className="pb-6 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            図形
          </h2>
          <div className="space-y-4">
            <button
              onClick={onAddRectangle}
              className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              四角形を追加
            </button>
          </div>
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
