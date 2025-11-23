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
  const [zoom, setZoom] = useState<number>(50);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copiedElement, setCopiedElement] = useState<CanvasElement | null>(null);
  const canvasRef = useRef<CanvasRef>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);
  const lastGestureScale = useRef<number>(1);

  // Load banner from Supabase
  useEffect(() => {
    const loadBanner = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      const loadedBanner = await bannerStorage.getById(id);
      if (!loadedBanner) {
        navigate('/');
        return;
      }

      // Migrate existing shapes and text to new fill/stroke structure
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
        if (el.type === 'text') {
          const text = el as TextElement;
          // Migrate old strokeOnly property to new structure
          const strokeOnly = (text as any).strokeOnly;
          return {
            ...text,
            fillEnabled: text.fillEnabled !== undefined ? text.fillEnabled : (strokeOnly === undefined ? true : !strokeOnly),
            stroke: text.stroke || text.fill || '#000000',
            strokeWidth: text.strokeWidth || Math.max(text.fontSize * 0.03, 2),
            strokeEnabled: text.strokeEnabled !== undefined ? text.strokeEnabled : (strokeOnly || false),
          } as TextElement;
        }
        return el;
      });

      setBanner(loadedBanner);
      setSelectedTemplate(loadedBanner.template);
      setElements(migratedElements);
      setCanvasColor(loadedBanner.canvasColor);
    };

    loadBanner();
  }, [id, navigate]);

  // Auto-save elements when changed
  useEffect(() => {
    if (banner && elements.length > 0) {
      const timeoutId = setTimeout(async () => {
        await bannerStorage.saveElements(banner.id, elements);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [elements, banner]);

  // Auto-save canvas color when changed
  useEffect(() => {
    const saveCanvasColor = async () => {
      if (banner) {
        await bannerStorage.saveCanvasColor(banner.id, canvasColor);
      }
    };
    saveCanvasColor();
  }, [canvasColor, banner]);

  // Save thumbnail periodically
  useEffect(() => {
    if (banner && canvasRef.current) {
      const intervalId = setInterval(async () => {
        const thumbnailDataURL = canvasRef.current?.exportImage();
        if (thumbnailDataURL) {
          await bannerStorage.saveThumbnail(banner.id, thumbnailDataURL);
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

  // Pinch zoom and wheel zoom support
  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    // Handle pinch zoom (mobile/trackpad)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        lastTouchDistance.current = distance;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastTouchDistance.current !== null) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        const delta = distance - lastTouchDistance.current;
        const zoomDelta = delta * 0.1;
        const newZoom = Math.max(25, Math.min(200, zoom + zoomDelta));
        setZoom(Math.round(newZoom));

        lastTouchDistance.current = distance;
      }
    };

    const handleTouchEnd = () => {
      lastTouchDistance.current = null;
    };

    // Handle wheel zoom (Ctrl/Cmd + scroll on Mac/PC)
    // On Mac trackpad, pinch gestures trigger wheel events with ctrlKey=true
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        // Larger coefficient for more responsive zoom (was 0.1, now 0.5)
        const delta = -e.deltaY * 0.5;
        const newZoom = Math.max(25, Math.min(200, zoom + delta));
        setZoom(Math.round(newZoom));
      }
    };

    // Safari-specific gesture events for trackpad pinch
    const handleGestureStart = (e: any) => {
      e.preventDefault();
      lastGestureScale.current = 1;
    };

    const handleGestureChange = (e: any) => {
      e.preventDefault();
      const scale = e.scale;
      const delta = (scale - lastGestureScale.current) * 100;
      const newZoom = Math.max(25, Math.min(200, zoom + delta));
      setZoom(Math.round(newZoom));
      lastGestureScale.current = scale;
    };

    const handleGestureEnd = (e: any) => {
      e.preventDefault();
      lastGestureScale.current = 1;
    };

    mainElement.addEventListener('touchstart', handleTouchStart);
    mainElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    mainElement.addEventListener('touchend', handleTouchEnd);
    mainElement.addEventListener('wheel', handleWheel, { passive: false });

    // Safari gesture events
    mainElement.addEventListener('gesturestart', handleGestureStart, { passive: false } as any);
    mainElement.addEventListener('gesturechange', handleGestureChange, { passive: false } as any);
    mainElement.addEventListener('gestureend', handleGestureEnd, { passive: false } as any);

    return () => {
      mainElement.removeEventListener('touchstart', handleTouchStart);
      mainElement.removeEventListener('touchmove', handleTouchMove);
      mainElement.removeEventListener('touchend', handleTouchEnd);
      mainElement.removeEventListener('wheel', handleWheel);
      mainElement.removeEventListener('gesturestart', handleGestureStart as any);
      mainElement.removeEventListener('gesturechange', handleGestureChange as any);
      mainElement.removeEventListener('gestureend', handleGestureEnd as any);
    };
  }, [zoom]);

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
      fillEnabled: true,
      stroke: '#000000',
      strokeWidth: 2,
      strokeEnabled: false,
      fontWeight: selectedWeight,
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
      x: 0,
      y: 0,
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
        if (selectedElementIds.includes(el.id) && (el.type === 'shape' || el.type === 'text')) {
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
        if (selectedElementIds.includes(el.id) && (el.type === 'shape' || el.type === 'text')) {
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
        if (selectedElementIds.includes(el.id) && (el.type === 'shape' || el.type === 'text')) {
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
        if (selectedElementIds.includes(el.id) && (el.type === 'shape' || el.type === 'text')) {
          return { ...el, strokeEnabled: enabled };
        }
        return el;
      });
      setElements(newElements);
      saveToHistory(newElements);
    }
  };

  const handleBannerNameChange = async (newName: string) => {
    if (banner) {
      await bannerStorage.update(banner.id, { name: newName });
      setBanner({ ...banner, name: newName });
    }
  };

  const handleCanvasSizeChange = async (width: number, height: number) => {
    if (banner && selectedTemplate) {
      const updatedTemplate: Template = {
        ...selectedTemplate,
        width,
        height,
      };
      await bannerStorage.update(banner.id, { template: updatedTemplate });
      setSelectedTemplate(updatedTemplate);
      setBanner({ ...banner, template: updatedTemplate });
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
          canvasWidth={selectedTemplate.width}
          canvasHeight={selectedTemplate.height}
          onSelectColor={setCanvasColor}
          onCanvasSizeChange={handleCanvasSizeChange}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddImage={handleAddImage}
        />

        <main
          ref={mainRef}
          className="flex-1 overflow-auto bg-gray-100 p-8 flex items-center justify-center"
          style={{ touchAction: 'none' }}
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
          ref={mainRef}
          className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center"
          style={{ touchAction: 'none' }}
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
          canvasWidth={selectedTemplate.width}
          canvasHeight={selectedTemplate.height}
          onSelectColor={setCanvasColor}
          onCanvasSizeChange={handleCanvasSizeChange}
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

