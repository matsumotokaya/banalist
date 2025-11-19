import type { Template } from '../types/template';

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: Template;
  onSelect: (template: Template) => void;
}

export const TemplateSelector = ({
  templates,
  selectedTemplate,
  onSelect,
}: TemplateSelectorProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">テンプレート選択</h3>
      <div className="grid grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedTemplate.id === template.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-300 bg-white hover:border-blue-300'
            }`}
          >
            <div
              className="w-full h-16 rounded mb-2"
              style={{ backgroundColor: template.backgroundColor }}
            />
            <p className="text-sm font-medium text-gray-700">{template.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
