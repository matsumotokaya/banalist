import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { PropertyPanel } from '../components/PropertyPanel';
import { BottomBar } from '../components/BottomBar';
import { Canvas, type CanvasRef } from '../components/Canvas';
import { bannerStorage } from '../utils/bannerStorage';
import type { Template, CanvasElement, TextElement, ShapeElement, ImageElement, Banner } from '../types/template';

export const BannerEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [canvasColor, setCanvasColor] = useState<string>('#FFFFFF');
  const [selectedFont, setSelectedFont] = useState<string>('Arial');
  const [selectedSize, setSelectedSize] = useState<number>(80);
  const [selectedWeight, setSelectedWeight] = useState<number>(400);
  const [selectedTextColor, setSelectedTextColor] = useState<string>('#000000');
  const [strokeOnly, setStrokeOnly] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(50);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copiedElement, setCopiedElement] = useState<CanvasElement | null>(null);
  const canvasRef = useRef<CanvasRef>(null);

  // Load banner from localStorage
  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const loadedBanner = bannerStorage.getById(id);
    if (!loadedBanner) {
      navigate('/');
      return;
    }

    setBanner(loadedBanner);
    setSelectedTemplate(loadedBanner.template);
    setElements(loadedBanner.elements);
    setCanvasColor(loadedBanner.canvasColor);
  }, [id, navigate]);

  // Auto-save elements when changed
  useEffect(() => {
    if (banner && elements.length > 0) {
      const timeoutId = setTimeout(() => {
        bannerStorage.saveElements(banner.id, elements);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [elements, banner]);

  // Auto-save canvas color when changed
  useEffect(() => {
    if (banner) {
      bannerStorage.saveCanvasColor(banner.id, canvasColor);
    }
  }, [canvasColor, banner]);

  // Save thumbnail periodically
  useEffect(() => {
    if (banner && canvasRef.current) {
      const intervalId = setInterval(() => {
        const thumbnailDataURL = canvasRef.current?.exportImage();
        if (thumbnailDataURL) {
          bannerStorage.saveThumbnail(banner.id, thumbnailDataURL);
        }
      }, 3000);
      return () => clearInterval(intervalId);
    }
  }, [banner]);

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
  }, [historyIndex, history, selectedElementId, elements, copiedElement]);

  if (!banner || !selectedTemplate) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // Save to history (max 50 entries)
  const saveToHistory = (newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    const limitedHistory = newHistory.slice(-50);
    setHistory(limitedHistory);
    setHistoryIndex(limitedHistory.length - 1);
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  // Copy
  const handleCopy = () => {
    if (selectedElementId) {
      const element = elements.find((el) => el.id === selectedElementId);
      if (element) {
        setCopiedElement(JSON.parse(JSON.stringify(element)));
      }
    }
  };

  // Paste
  const handlePaste = () => {
    if (copiedElement) {
      const newId = `${copiedElement.type}-${Date.now()}`;
      const newElement: CanvasElement = {
        ...copiedElement,
        id: newId,
        x: copiedElement.x + 20,
        y: copiedElement.y + 20,
      } as CanvasElement;
      const newElements = [...elements, newElement];
      setElements(newElements);
      saveToHistory(newElements);
      setSelectedElementId(newId);
    }
  };

  // Delete
  const handleDelete = () => {
    if (selectedElementId) {
      const newElements = elements.filter((el) => el.id !== selectedElementId);
      setElements(newElements);
      saveToHistory(newElements);
      setSelectedElementId(null);
    }
  };

  // Update font, size, weight, color and stroke when an element is selected
  const handleSelectElement = (id: string | null) => {
    setSelectedElementId(id);
    if (id) {
      const element = elements.find((el) => el.id === id);
      if (element && element.type === 'text') {
        setSelectedFont(element.fontFamily);
        setSelectedSize(element.fontSize);
        setSelectedWeight(element.fontWeight);
        setSelectedTextColor(element.fill);
        setStrokeOnly(element.strokeOnly);
      }
    }
  };

  const handleAddText = (text: string) => {
    const newId = `text-${Date.now()}`;
    const newElement: TextElement = {
      id: newId,
      type: 'text',
      text,
      x: 50,
      y: 50,
      fontSize: selectedSize,
      fontFamily: selectedFont,
      fill: selectedTextColor,
      fontWeight: selectedWeight,
      strokeOnly: strokeOnly,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedElementId(newId);
  };

  const handleAddShape = (shapeType: 'rectangle' | 'triangle' | 'star') => {
    const newId = `shape-${Date.now()}`;
    const newShape: ShapeElement = {
      id: newId,
      type: 'shape',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      fill: '#000000',
      shapeType,
    };
    const newElements = [...elements, newShape];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedElementId(newId);
  };

  const handleAddImage = (src: string, width: number, height: number) => {
    const newId = `image-${Date.now()}`;
    const newImage: ImageElement = {
      id: newId,
      type: 'image',
      x: 100,
      y: 100,
      src,
      width,
      height,
    };
    const newElements = [...elements, newImage];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedElementId(newId);
  };

  const handleTextChange = (id: string, newText: string) => {
    const newElements = elements.map((el) =>
      el.id === id && el.type === 'text' ? { ...el, text: newText } : el
    );
    setElements(newElements);
    saveToHistory(newElements);
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    if (selectedElementId) {
      const newElements = elements.map((el) =>
        el.id === selectedElementId && el.type === 'text' ? { ...el, fontFamily: font } : el
      );
      setElements(newElements);
      saveToHistory(newElements);
    }
  };

  const handleSizeChange = (size: number) => {
    setSelectedSize(size);
    if (selectedElementId) {
      const newElements = elements.map((el) =>
        el.id === selectedElementId && el.type === 'text' ? { ...el, fontSize: size } : el
      );
      setElements(newElements);
      saveToHistory(newElements);
    }
  };

  const handleWeightChange = (weight: number) => {
    setSelectedWeight(weight);
    if (selectedElementId) {
      const newElements = elements.map((el) =>
        el.id === selectedElementId && el.type === 'text' ? { ...el, fontWeight: weight } : el
      );
      setElements(newElements);
      saveToHistory(newElements);
    }
  };


  const handlePropertyColorChange = (color: string) => {
    if (selectedElementId) {
      const newElements = elements.map((el) => {
        if (el.id === selectedElementId) {
          if (el.type === 'text' || el.type === 'shape') {
            return { ...el, fill: color };
          }
        }
        return el;
      });
      setElements(newElements);
      saveToHistory(newElements);

      // Update text color state if text element is selected
      const selectedElement = elements.find((el) => el.id === selectedElementId);
      if (selectedElement && selectedElement.type === 'text') {
        setSelectedTextColor(color);
      }
    }
  };

  const handleBringToFront = () => {
    if (!selectedElementId) return;
    const index = elements.findIndex((el) => el.id === selectedElementId);
    if (index === -1 || index === elements.length - 1) return;

    const newElements = [...elements];
    const [element] = newElements.splice(index, 1);
    newElements.push(element);
    setElements(newElements);
    saveToHistory(newElements);
  };

  const handleSendToBack = () => {
    if (!selectedElementId) return;
    const index = elements.findIndex((el) => el.id === selectedElementId);
    if (index === -1 || index === 0) return;

    const newElements = [...elements];
    const [element] = newElements.splice(index, 1);
    newElements.unshift(element);
    setElements(newElements);
    saveToHistory(newElements);
  };

  const handleElementUpdate = (id: string, updates: Partial<CanvasElement>) => {
    const newElements = elements.map((el) => {
      if (el.id === id) {
        // Type-safe merge based on element type
        if (el.type === 'text' && updates.type === 'text') {
          return { ...el, ...updates } as TextElement;
        } else if (el.type === 'shape' && updates.type === 'shape') {
          return { ...el, ...updates } as ShapeElement;
        } else if (el.type === 'image' && updates.type === 'image') {
          return { ...el, ...updates } as ImageElement;
        } else {
          // For updates without type change
          return { ...el, ...updates } as CanvasElement;
        }
      }
      return el;
    });
    setElements(newElements);
    saveToHistory(newElements);
  };

  const handleBannerNameChange = (newName: string) => {
    if (banner) {
      bannerStorage.update(banner.id, { name: newName });
      setBanner({ ...banner, name: newName });
    }
  };

  const handleExport = () => {
    if (!canvasRef.current || !banner) return;
    const dataURL = canvasRef.current.exportImage();
    const link = document.createElement('a');
    link.download = `${banner.name}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        onBackToManager={() => navigate('/')}
        bannerName={banner.name}
        bannerId={banner.id}
        onBannerNameChange={handleBannerNameChange}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          canvasColor={canvasColor}
          onSelectColor={setCanvasColor}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddImage={handleAddImage}
        />

        <main
          className="flex-1 overflow-auto bg-gray-100 p-8 flex items-center justify-center"
          onClick={(e) => {
            // Deselect when clicking on the gray area (not on the canvas)
            if (e.target === e.currentTarget) {
              handleSelectElement(null);
            }
          }}
        >
          <Canvas
            ref={canvasRef}
            template={selectedTemplate}
            elements={elements}
            scale={zoom / 100}
            canvasColor={canvasColor}
            fileName={`${banner.name}.png`}
            onTextChange={handleTextChange}
            selectedElementId={selectedElementId}
            onSelectElement={handleSelectElement}
            onElementUpdate={handleElementUpdate}
          />
        </main>

        <PropertyPanel
          selectedElement={elements.find((el) => el.id === selectedElementId) || null}
          onColorChange={handlePropertyColorChange}
          onFontChange={handleFontChange}
          onSizeChange={handleSizeChange}
          onWeightChange={handleWeightChange}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
        />
      </div>

      <BottomBar zoom={zoom} onZoomChange={setZoom} onExport={handleExport} />
    </div>
  );
}

