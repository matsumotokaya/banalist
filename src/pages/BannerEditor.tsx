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
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
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

    // Migrate existing shapes to new fill/stroke structure
    const migratedElements = loadedBanner.elements.map((el) => {
      if (el.type === 'shape') {
        const shape = el as ShapeElement;
        return {
          ...shape,
          fillEnabled: shape.fillEnabled !== undefined ? shape.fillEnabled : true,
          stroke: shape.stroke || '#000000',
          strokeWidth: shape.strokeWidth || 2,
          strokeEnabled: shape.strokeEnabled !== undefined ? shape.strokeEnabled : false,
        } as ShapeElement;
      }
      return el;
    });

    setBanner(loadedBanner);
    setSelectedTemplate(loadedBanner.template);
    setElements(migratedElements);
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
  }, [historyIndex, history, selectedElementIds, elements, copiedElement]);

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
    if (selectedElementIds.length === 1) {
      const element = elements.find((el) => el.id === selectedElementIds[0]);
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
      setSelectedElementIds([newId]);
    }
  };

  // Delete
  const handleDelete = () => {
    if (selectedElementIds.length > 0) {
      const newElements = elements.filter((el) => !selectedElementIds.includes(el.id));
      setElements(newElements);
      saveToHistory(newElements);
      setSelectedElementIds([]);
    }
  };

  // Update selection state and sync properties for single text element
  const handleSelectElement = (ids: string[]) => {
    setSelectedElementIds(ids);
    if (ids.length === 1) {
      const element = elements.find((el) => el.id === ids[0]);
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
    setSelectedElementIds([newId]);
  };

  const handleAddShape = (shapeType: 'rectangle' | 'triangle' | 'star' | 'circle' | 'heart') => {
    const newId = `shape-${Date.now()}`;
    const newShape: ShapeElement = {
      id: newId,
      type: 'shape',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      fill: '#000000',
      fillEnabled: true,
      stroke: '#000000',
      strokeWidth: 2,
      strokeEnabled: false,
      shapeType,
    };
    const newElements = [...elements, newShape];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedElementIds([newId]);
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
    setSelectedElementIds([newId]);
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
    if (selectedElementIds.length > 0) {
      const newElements = elements.map((el) =>
        selectedElementIds.includes(el.id) && el.type === 'text' ? { ...el, fontFamily: font } : el
      );
      setElements(newElements);
      saveToHistory(newElements);
    }
  };

  const handleSizeChange = (size: number) => {
    setSelectedSize(size);
    if (selectedElementIds.length > 0) {
      const newElements = elements.map((el) =>
        selectedElementIds.includes(el.id) && el.type === 'text' ? { ...el, fontSize: size } : el
      );
      setElements(newElements);
      saveToHistory(newElements);
    }
  };

  const handleWeightChange = (weight: number) => {
    setSelectedWeight(weight);
    if (selectedElementIds.length > 0) {
      const newElements = elements.map((el) =>
        selectedElementIds.includes(el.id) && el.type === 'text' ? { ...el, fontWeight: weight } : el
      );
      setElements(newElements);
      saveToHistory(newElements);
    }
  };


  const handlePropertyColorChange = (color: string) => {
    if (selectedElementIds.length > 0) {
      const newElements = elements.map((el) => {
        if (selectedElementIds.includes(el.id)) {
          if (el.type === 'text' || el.type === 'shape') {
            return { ...el, fill: color };
          }
        }
        return el;
      });
      setElements(newElements);
      saveToHistory(newElements);

      // Update text color state if single text element is selected
      if (selectedElementIds.length === 1) {
        const selectedElement = elements.find((el) => el.id === selectedElementIds[0]);
        if (selectedElement && selectedElement.type === 'text') {
          setSelectedTextColor(color);
        }
      }
    }
  };

  const handleOpacityChange = (opacity: number) => {
    if (selectedElementIds.length > 0) {
      const newElements = elements.map((el) =>
        selectedElementIds.includes(el.id) ? { ...el, opacity } : el
      );
      setElements(newElements);
      saveToHistory(newElements);
    }
  };

  const handleBringToFront = () => {
    if (selectedElementIds.length === 0) return;

    const newElements = [...elements];
    const selectedElements = selectedElementIds
      .map(id => newElements.find(el => el.id === id))
      .filter((el): el is CanvasElement => el !== undefined);

    const remainingElements = newElements.filter(el => !selectedElementIds.includes(el.id));
    const reordered = [...remainingElements, ...selectedElements];

    setElements(reordered);
    saveToHistory(reordered);
  };

  const handleSendToBack = () => {
    if (selectedElementIds.length === 0) return;

    const newElements = [...elements];
    const selectedElements = selectedElementIds
      .map(id => newElements.find(el => el.id === id))
      .filter((el): el is CanvasElement => el !== undefined);

    const remainingElements = newElements.filter(el => !selectedElementIds.includes(el.id));
    const reordered = [...selectedElements, ...remainingElements];

    setElements(reordered);
    saveToHistory(reordered);
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

  // Shape fill/stroke handlers
  const handleFillEnabledChange = (enabled: boolean) => {
    if (selectedElementIds.length > 0) {
      const newElements = elements.map((el) => {
        if (selectedElementIds.includes(el.id) && el.type === 'shape') {
          return { ...el, fillEnabled: enabled };
        }
        return el;
      });
      setElements(newElements);
      saveToHistory(newElements);
    }
  };

  const handleStrokeChange = (color: string) => {
    if (selectedElementIds.length > 0) {
      const newElements = elements.map((el) => {
        if (selectedElementIds.includes(el.id) && el.type === 'shape') {
          return { ...el, stroke: color };
        }
        return el;
      });
      setElements(newElements);
      saveToHistory(newElements);
    }
  };

  const handleStrokeWidthChange = (width: number) => {
    if (selectedElementIds.length > 0) {
      const newElements = elements.map((el) => {
        if (selectedElementIds.includes(el.id) && el.type === 'shape') {
          return { ...el, strokeWidth: width };
        }
        return el;
      });
      setElements(newElements);
      saveToHistory(newElements);
    }
  };

  const handleStrokeEnabledChange = (enabled: boolean) => {
    if (selectedElementIds.length > 0) {
      const newElements = elements.map((el) => {
        if (selectedElementIds.includes(el.id) && el.type === 'shape') {
          return { ...el, strokeEnabled: enabled };
        }
        return el;
      });
      setElements(newElements);
      saveToHistory(newElements);
    }
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

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
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
            if (e.target === e.currentTarget) {
              handleSelectElement([]);
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
            selectedElementIds={selectedElementIds}
            onSelectElement={handleSelectElement}
            onElementUpdate={handleElementUpdate}
          />
        </main>

        <PropertyPanel
          selectedElement={selectedElementIds.length === 1 ? elements.find((el) => el.id === selectedElementIds[0]) || null : null}
          onColorChange={handlePropertyColorChange}
          onFontChange={handleFontChange}
          onSizeChange={handleSizeChange}
          onWeightChange={handleWeightChange}
          onOpacityChange={handleOpacityChange}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onFillEnabledChange={handleFillEnabledChange}
          onStrokeChange={handleStrokeChange}
          onStrokeWidthChange={handleStrokeWidthChange}
          onStrokeEnabledChange={handleStrokeEnabledChange}
        />
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden">
        <main
          className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleSelectElement([]);
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
            selectedElementIds={selectedElementIds}
            onSelectElement={handleSelectElement}
            onElementUpdate={handleElementUpdate}
          />
        </main>

        {/* Mobile Sidebar - Bottom horizontal scrollable */}
        <Sidebar
          canvasColor={canvasColor}
          onSelectColor={setCanvasColor}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddImage={handleAddImage}
          isMobile={true}
        />

        {/* Mobile PropertyPanel - Modal */}
        <PropertyPanel
          selectedElement={selectedElementIds.length === 1 ? elements.find((el) => el.id === selectedElementIds[0]) || null : null}
          onColorChange={handlePropertyColorChange}
          onFontChange={handleFontChange}
          onSizeChange={handleSizeChange}
          onWeightChange={handleWeightChange}
          onOpacityChange={handleOpacityChange}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onFillEnabledChange={handleFillEnabledChange}
          onStrokeChange={handleStrokeChange}
          onStrokeWidthChange={handleStrokeWidthChange}
          onStrokeEnabledChange={handleStrokeEnabledChange}
          isMobile={true}
          onClose={() => handleSelectElement([])}
        />
      </div>

      <BottomBar zoom={zoom} onZoomChange={setZoom} onExport={handleExport} />
    </div>
  );
}

