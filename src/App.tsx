import { useState, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { Canvas, type CanvasRef } from './components/Canvas';
import { DEFAULT_TEMPLATES } from './templates/defaultTemplates';
import type { Template, TextElement } from './types/template';

function App() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(DEFAULT_TEMPLATES[0]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [canvasColor, setCanvasColor] = useState<string>('#FFFFFF');
  const [selectedFont, setSelectedFont] = useState<string>('Arial');
  const [selectedSize, setSelectedSize] = useState<number>(80);
  const [zoom, setZoom] = useState<number>(50);
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
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          templates={DEFAULT_TEMPLATES}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
          canvasColor={canvasColor}
          onSelectColor={setCanvasColor}
          selectedFont={selectedFont}
          onSelectFont={setSelectedFont}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          onAddText={handleAddText}
        />

        <main className="flex-1 overflow-auto bg-gray-100 p-8 flex items-center justify-center">
          <Canvas
            ref={canvasRef}
            template={selectedTemplate}
            textElements={textElements}
            scale={zoom / 100}
            canvasColor={canvasColor}
          />
        </main>
      </div>

      <BottomBar zoom={zoom} onZoomChange={setZoom} onExport={handleExport} />
    </div>
  );
}

export default App;
