import { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { Canvas, type CanvasRef } from './components/Canvas';
import { DEFAULT_TEMPLATES } from './templates/defaultTemplates';
import type { Template, TextElement, RectangleElement } from './types/template';

function App() {
  const [selectedTemplate] = useState<Template>(DEFAULT_TEMPLATES[0]);
  const [textElements, setTextElements] = useState<TextElement[]>([
    {
      id: 'default-text',
      text: 'BANALISTでバナーをつくろう。',
      x: DEFAULT_TEMPLATES[0].width / 2 - 550,
      y: DEFAULT_TEMPLATES[0].height / 2 - 40,
      fontSize: 80,
      fontFamily: 'Arial',
      fill: '#000000',
      fontWeight: 400,
      strokeOnly: false,
    }
  ]);
  const [canvasColor, setCanvasColor] = useState<string>('#FFFFFF');
  const [selectedFont, setSelectedFont] = useState<string>('Arial');
  const [selectedSize, setSelectedSize] = useState<number>(80);
  const [selectedWeight, setSelectedWeight] = useState<number>(400);
  const [selectedTextColor, setSelectedTextColor] = useState<string>('#000000');
  const [strokeOnly, setStrokeOnly] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(50);
  const [selectedElementId, setSelectedElementId] = useState<string | null>('default-text');
  const [rectangleElements, setRectangleElements] = useState<RectangleElement[]>([]);
  const [history, setHistory] = useState<TextElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copiedElement, setCopiedElement] = useState<TextElement | null>(null);
  const canvasRef = useRef<CanvasRef>(null);

  // Save to history (max 50 entries)
  const saveToHistory = (elements: TextElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(elements)));
    // Keep only last 50 entries
    const limitedHistory = newHistory.slice(-50);
    setHistory(limitedHistory);
    setHistoryIndex(limitedHistory.length - 1);
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTextElements(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTextElements(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  // Copy
  const handleCopy = () => {
    if (selectedElementId) {
      const element = textElements.find((el) => el.id === selectedElementId);
      if (element) {
        setCopiedElement(JSON.parse(JSON.stringify(element)));
      }
    }
  };

  // Paste
  const handlePaste = () => {
    if (copiedElement) {
      const newElement: TextElement = {
        ...copiedElement,
        id: `text-${Date.now()}`,
        x: copiedElement.x + 20,
        y: copiedElement.y + 20,
      };
      const newElements = [...textElements, newElement];
      setTextElements(newElements);
      saveToHistory(newElements);
    }
  };

  // Delete
  const handleDelete = () => {
    if (selectedElementId) {
      const newElements = textElements.filter((el) => el.id !== selectedElementId);
      setTextElements(newElements);
      saveToHistory(newElements);
      setSelectedElementId(null);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts when typing in textarea
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, selectedElementId, textElements, copiedElement]);

  // Update font, size, weight, color and stroke when an element is selected
  const handleSelectElement = (id: string | null) => {
    setSelectedElementId(id);
    if (id) {
      const element = textElements.find((el) => el.id === id);
      if (element) {
        setSelectedFont(element.fontFamily);
        setSelectedSize(element.fontSize);
        setSelectedWeight(element.fontWeight);
        setSelectedTextColor(element.fill);
        setStrokeOnly(element.strokeOnly);
      }
    }
  };

  const handleAddText = (text: string) => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text,
      x: 50,
      y: 50,
      fontSize: selectedSize,
      fontFamily: selectedFont,
      fill: selectedTextColor,
      fontWeight: selectedWeight,
      strokeOnly: strokeOnly,
    };
    const newElements = [...textElements, newElement];
    setTextElements(newElements);
    saveToHistory(newElements);
  };

  const handleAddRectangle = () => {
    const newRectangle: RectangleElement = {
      id: `rect-${Date.now()}`,
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      fill: '#000000',
    };
    setRectangleElements([...rectangleElements, newRectangle]);
  };

  const handleTextChange = (id: string, newText: string) => {
    const newElements = textElements.map((el) =>
      el.id === id ? { ...el, text: newText } : el
    );
    setTextElements(newElements);
    saveToHistory(newElements);
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    if (selectedElementId) {
      const newElements = textElements.map((el) =>
        el.id === selectedElementId ? { ...el, fontFamily: font } : el
      );
      setTextElements(newElements);
      saveToHistory(newElements);
    }
  };

  const handleSizeChange = (size: number) => {
    setSelectedSize(size);
    if (selectedElementId) {
      const newElements = textElements.map((el) =>
        el.id === selectedElementId ? { ...el, fontSize: size } : el
      );
      setTextElements(newElements);
      saveToHistory(newElements);
    }
  };

  const handleWeightChange = (weight: number) => {
    setSelectedWeight(weight);
    if (selectedElementId) {
      const newElements = textElements.map((el) =>
        el.id === selectedElementId ? { ...el, fontWeight: weight } : el
      );
      setTextElements(newElements);
      saveToHistory(newElements);
    }
  };

  const handleTextColorChange = (color: string) => {
    setSelectedTextColor(color);
    if (selectedElementId) {
      const newElements = textElements.map((el) =>
        el.id === selectedElementId ? { ...el, fill: color } : el
      );
      setTextElements(newElements);
      saveToHistory(newElements);
    }
  };

  const handleStrokeOnlyToggle = (enabled: boolean) => {
    setStrokeOnly(enabled);
    if (selectedElementId) {
      const newElements = textElements.map((el) =>
        el.id === selectedElementId ? { ...el, strokeOnly: enabled } : el
      );
      setTextElements(newElements);
      saveToHistory(newElements);
    }
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
          canvasColor={canvasColor}
          onSelectColor={setCanvasColor}
          selectedFont={selectedFont}
          onSelectFont={handleFontChange}
          selectedSize={selectedSize}
          onSelectSize={handleSizeChange}
          selectedWeight={selectedWeight}
          onSelectWeight={handleWeightChange}
          selectedTextColor={selectedTextColor}
          onSelectTextColor={handleTextColorChange}
          strokeOnly={strokeOnly}
          onStrokeOnlyToggle={handleStrokeOnlyToggle}
          onAddText={handleAddText}
          onAddRectangle={handleAddRectangle}
        />

        <main className="flex-1 overflow-auto bg-gray-100 p-8 flex items-center justify-center">
          <Canvas
            ref={canvasRef}
            template={selectedTemplate}
            textElements={textElements}
            rectangleElements={rectangleElements}
            scale={zoom / 100}
            canvasColor={canvasColor}
            onTextChange={handleTextChange}
            selectedElementId={selectedElementId}
            onSelectElement={handleSelectElement}
          />
        </main>
      </div>

      <BottomBar zoom={zoom} onZoomChange={setZoom} onExport={handleExport} />
    </div>
  );
}

export default App;
