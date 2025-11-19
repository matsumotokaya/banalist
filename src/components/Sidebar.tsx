import type { Template, TextElement } from '../types/template';
import { TemplateSelector } from './TemplateSelector';
import { ColorPicker } from './ColorPicker';
import { FontSelector } from './FontSelector';
import { TextSizeSelector } from './TextSizeSelector';
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
  onAddText: (text: string) => void;
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
  onAddText,
}: SidebarProps) => {
  return (
    <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            デザイン
          </h2>
          <div className="space-y-4">
            <TemplateSelector
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelect={onSelectTemplate}
            />
            <ColorPicker selectedColor={canvasColor} onSelect={onSelectColor} />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            テキスト
          </h2>
          <div className="space-y-4">
            <FontSelector selectedFont={selectedFont} onSelect={onSelectFont} />
            <TextSizeSelector selectedSize={selectedSize} onSelect={onSelectSize} />
            <TextEditor onAddText={onAddText} />
          </div>
        </div>
      </div>
    </aside>
  );
};
