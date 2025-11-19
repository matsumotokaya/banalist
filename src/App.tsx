import { useState, useRef } from 'react';
import { Canvas, type CanvasRef } from './components/Canvas';
import { TemplateSelector } from './components/TemplateSelector';
import { TextEditor } from './components/TextEditor';
import { FontSelector } from './components/FontSelector';
import { TextSizeSelector } from './components/TextSizeSelector';
import { ExportButton } from './components/ExportButton';
import { DEFAULT_TEMPLATES } from './templates/defaultTemplates';
import type { Template, TextElement } from './types/template';

function App() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(DEFAULT_TEMPLATES[0]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedFont, setSelectedFont] = useState<string>('Arial');
  const [selectedSize, setSelectedSize] = useState<number>(80);
  const canvasRef = useRef<CanvasRef>(null);

  const handleAddText = (text: string) => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text,
      x: selectedTemplate.width / 2 - 100,
      y: selectedTemplate.height / 2 - 40,
      fontSize: selectedSize,
      fontFamily: selectedFont,
      fill: '#000000',
    };
    setTextElements([...textElements, newElement]);
  };

  const handleExport = () => {
    if (!canvasRef.current) return;
    const dataURL = canvasRef.current.exportImage();
    const link = document.createElement('a');
    link.download = 'banalist-banner.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🧾 バナリスト</h1>
          <p className="text-gray-600">簡単にバナーを作成・ダウンロード</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <TemplateSelector
                templates={DEFAULT_TEMPLATES}
                selectedTemplate={selectedTemplate}
                onSelect={setSelectedTemplate}
              />
              <FontSelector selectedFont={selectedFont} onSelect={setSelectedFont} />
              <TextSizeSelector selectedSize={selectedSize} onSelect={setSelectedSize} />
              <TextEditor onAddText={handleAddText} />
              <ExportButton onExport={handleExport} />
            </div>
          </div>

          {/* Right Panel - Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <Canvas ref={canvasRef} template={selectedTemplate} textElements={textElements} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
