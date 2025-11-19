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
    <div>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`group relative overflow-hidden rounded-xl transition-all duration-200 ${
              selectedTemplate.id === template.id
                ? 'ring-2 ring-blue-500 ring-offset-2'
                : 'hover:scale-[1.02] hover:shadow-md'
            }`}
          >
            <div
              className="aspect-video w-full rounded-lg"
              style={{ backgroundColor: template.backgroundColor }}
            />
            {selectedTemplate.id === template.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <p className="text-xs font-medium text-gray-600 mt-2 text-center">{template.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

