import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { PropertyPanel } from '../components/PropertyPanel';
import { BottomBar } from '../components/BottomBar';
import { Canvas, type CanvasRef } from '../components/Canvas';
import { useBanner, useBatchSaveBanner, useUpdateBanner, useUpdateBannerName, useUpdateBannerPlanType } from '../hooks/useBanners';
import type { Template, CanvasElement, TextElement, ShapeElement, ImageElement } from '../types/template';
import { useHistory } from '../hooks/useHistory';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useZoomControl } from '../hooks/useZoomControl';
import { useElementOperations } from '../hooks/useElementOperations';

export const BannerEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // React Query hooks
  const { data: banner, isLoading } = useBanner(id);
  const batchSave = useBatchSaveBanner(id || '');
  const updateBanner = useUpdateBanner(id || '');
  const updateName = useUpdateBannerName(id || '');
  const updatePlanType = useUpdateBannerPlanType(id || '');

  // Local state for editing (not persisted immediately)
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [canvasColor, setCanvasColor] = useState<string>('#FFFFFF');
  const [selectedFont, setSelectedFont] = useState<string>('Arial');
  const [selectedSize, setSelectedSize] = useState<number>(80);
  const [selectedWeight, setSelectedWeight] = useState<number>(400);
  const [selectedTextColor, setSelectedTextColor] = useState<string>('#000000');
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [copiedElement, setCopiedElement] = useState<CanvasElement | null>(null);
  const canvasRef = useRef<CanvasRef>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { saveToHistory, undo, redo } = useHistory();
  const getInitialZoom = () => {
    const isMobile = window.innerWidth < 768;
    return isMobile ? 30 : 40;
  };
  const { zoom, setZoom } = useZoomControl({
    initialZoom: getInitialZoom(),
    containerRef: mainRef,
  });
  const elementOps = useElementOperations({
    elements,
    setElements,
    saveToHistory,
  });

  // Initialize local state from React Query data
  useEffect(() => {
    if (!banner) {
      if (!isLoading && !id) {
        navigate('/');
      }
      return;
    }

    // Migrate existing shapes and text to new fill/stroke structure
    const migratedElements = banner.elements.map((el) => {
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

    setElements(migratedElements);
    setCanvasColor(banner.canvasColor);
  }, [banner, isLoading, id, navigate]);

  // Auto-save with React Query mutation (optimized batch save)
  const pendingSaveRef = useRef<{
    elements?: CanvasElement[];
    canvasColor?: string;
  }>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const thumbnailTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleBatchSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (!banner) return;

      const updates: any = {};

      if (pendingSaveRef.current.elements) {
        updates.elements = pendingSaveRef.current.elements;
      }
      if (pendingSaveRef.current.canvasColor) {
        updates.canvasColor = pendingSaveRef.current.canvasColor;
      }

      if (Object.keys(updates).length > 0) {
        await batchSave.mutateAsync(updates);
        console.log('Batch saved:', Object.keys(updates).join(', '));
      }

      pendingSaveRef.current = {};
    }, 2000); // 2 second debounce
  }, [banner, batchSave]);

  // Trigger save for elements
  useEffect(() => {
    if (banner && elements.length > 0) {
      pendingSaveRef.current.elements = elements;
      scheduleBatchSave();
    }
  }, [elements, banner, scheduleBatchSave]);

  // Trigger save for canvas color
  useEffect(() => {
    if (banner) {
      pendingSaveRef.current.canvasColor = canvasColor;
      scheduleBatchSave();
    }
  }, [canvasColor, banner, scheduleBatchSave]);

  // Separate thumbnail generation (every 5 seconds)
  useEffect(() => {
    if (!banner || !canvasRef.current || elements.length === 0) return;

    if (thumbnailTimeoutRef.current) {
      clearTimeout(thumbnailTimeoutRef.current);
    }

    thumbnailTimeoutRef.current = setTimeout(async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const thumbnailDataURL = canvasRef.current?.exportImage();
        if (thumbnailDataURL && thumbnailDataURL.length > 100) {
          await batchSave.mutateAsync({ thumbnailDataURL });
          console.log('Thumbnail saved');
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
    }, 5000);

    return () => {
      if (thumbnailTimeoutRef.current) {
        clearTimeout(thumbnailTimeoutRef.current);
      }
    };
  }, [elements, canvasColor, banner, batchSave]);

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
      elementOps.addElement(newElement);
      setSelectedElementIds([newId]);
    }
  };

  // Delete
  const handleDelete = () => {
    if (selectedElementIds.length > 0) {
      elementOps.deleteElements(selectedElementIds);
      setSelectedElementIds([]);
    }
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    const prevElements = undo();
    if (prevElements) {
      setElements(prevElements);
    }
  };

  const handleRedo = () => {
    const nextElements = redo();
    if (nextElements) {
      setElements(nextElements);
    }
  };

  // Arrow key movement handlers (Photoshop-style: 1px normal, 10px with Shift)
  const handleMoveUp = (distance: number) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) => ({
        y: el.y - distance,
      }));
    }
  };

  const handleMoveDown = (distance: number) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) => ({
        y: el.y + distance,
      }));
    }
  };

  const handleMoveLeft = (distance: number) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) => ({
        x: el.x - distance,
      }));
    }
  };

  const handleMoveRight = (distance: number) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) => ({
        x: el.x + distance,
      }));
    }
  };

  // Update selection state and sync properties for single text element
  const handleSelectElement = useCallback((ids: string[]) => {
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
  }, [elements]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onDelete: handleDelete,
    onMoveUp: handleMoveUp,
    onMoveDown: handleMoveDown,
    onMoveLeft: handleMoveLeft,
    onMoveRight: handleMoveRight,
  });

  if (!banner) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

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
    elementOps.addElement(newElement);
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
    elementOps.addElement(newShape);
    setSelectedElementIds([newId]);
  };

  const handleAddImage = (src: string, width: number, height: number) => {
    const newId = `image-${Date.now()}-${Math.random()}`;

    setElements(prevElements => {
      const newImage: ImageElement = {
        id: newId,
        type: 'image',
        x: 0,
        y: 0,
        src,
        width,
        height,
      };

      const newElements = [...prevElements, newImage];
      // Save to history after state update
      setTimeout(() => saveToHistory(newElements), 0);
      return newElements;
    });

    setSelectedElementIds([newId]);
  };

  const handleImageDrop = (imageUrl: string, x: number, y: number, width: number, height: number) => {
    const newId = `image-${Date.now()}-${Math.random()}`;

    setElements(prevElements => {
      const newImage: ImageElement = {
        id: newId,
        type: 'image',
        x,
        y,
        src: imageUrl,
        width,
        height,
      };

      const newElements = [...prevElements, newImage];
      // Save to history after state update
      setTimeout(() => saveToHistory(newElements), 0);
      return newElements;
    });

    setSelectedElementIds([newId]);
  };

  const handleTextChange = (id: string, newText: string) => {
    elementOps.updateElement(id, { text: newText });
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        el.type === 'text' ? { fontFamily: font } : {}
      );
    }
  };

  const handleSizeChange = (size: number) => {
    setSelectedSize(size);
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        el.type === 'text' ? { fontSize: size } : {}
      );
    }
  };

  const handleWeightChange = (weight: number) => {
    setSelectedWeight(weight);
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        el.type === 'text' ? { fontWeight: weight } : {}
      );
    }
  };


  const handlePropertyColorChange = (color: string) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        (el.type === 'text' || el.type === 'shape') ? { fill: color } : {}
      );

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
      elementOps.updateElements(selectedElementIds, () => ({ opacity }));
    }
  };

  const handleBringToFront = () => {
    elementOps.bringToFront(selectedElementIds);
  };

  const handleSendToBack = () => {
    elementOps.sendToBack(selectedElementIds);
  };

  const handleElementUpdate = (id: string, updates: Partial<CanvasElement>) => {
    elementOps.updateElement(id, updates);
  };

  const handleToggleLock = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      elementOps.updateElement(id, { locked: !element.locked });
    }
  };

  // Shape fill/stroke handlers
  const handleFillEnabledChange = (enabled: boolean) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        (el.type === 'shape' || el.type === 'text') ? { fillEnabled: enabled } : {}
      );
    }
  };

  const handleStrokeChange = (color: string) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        (el.type === 'shape' || el.type === 'text') ? { stroke: color } : {}
      );
    }
  };

  const handleStrokeWidthChange = (width: number) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        (el.type === 'shape' || el.type === 'text') ? { strokeWidth: width } : {}
      );
    }
  };

  const handleStrokeEnabledChange = (enabled: boolean) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        (el.type === 'shape' || el.type === 'text') ? { strokeEnabled: enabled } : {}
      );
    }
  };

  const handleBannerNameChange = async (newName: string) => {
    await updateName.mutateAsync(newName);
  };

  const handlePremiumChange = async (isPremium: boolean) => {
    const newPlanType = isPremium ? 'premium' : 'free';
    await updatePlanType.mutateAsync(newPlanType);
  };

  const handleReorderElements = (newOrder: CanvasElement[]) => {
    elementOps.reorderElements(newOrder);
  };

  const handleCanvasSizeChange = async (width: number, height: number) => {
    if (banner) {
      const updatedTemplate: Template = {
        ...banner.template,
        width,
        height,
      };
      await updateBanner.mutateAsync({ template: updatedTemplate });
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current || !banner) return;

    try {
      // Small delay to ensure canvas is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      const dataURL = canvasRef.current.exportImage();

      if (!dataURL || dataURL.length < 100) {
        alert('画像の生成に失敗しました。もう一度お試しください。');
        console.error('Export failed: invalid data URL');
        return;
      }

      const link = document.createElement('a');
      link.download = `${banner.name}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Export successful, size:', dataURL.length);
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('画像のエクスポートに失敗しました。');
    }
  };

  // Loading state
  if (isLoading || !banner) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        onBackToManager={() => navigate('/')}
        bannerName={banner.name}
        bannerId={banner.id}
        onBannerNameChange={handleBannerNameChange}
        isPremium={banner.planType === 'premium'}
        onPremiumChange={handlePremiumChange}
      />

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <Sidebar
          canvasColor={canvasColor}
          canvasWidth={banner.template.width}
          canvasHeight={banner.template.height}
          onSelectColor={setCanvasColor}
          onCanvasSizeChange={handleCanvasSizeChange}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddImage={handleAddImage}
          elements={elements}
          selectedElementIds={selectedElementIds}
          onSelectElement={handleSelectElement}
          onReorderElements={handleReorderElements}
          onToggleLock={handleToggleLock}
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
              template={banner.template}
              elements={elements}
              scale={zoom / 100}
              canvasColor={canvasColor}
              fileName={`${banner.name}.png`}
              onTextChange={handleTextChange}
              selectedElementIds={selectedElementIds}
              onSelectElement={handleSelectElement}
              onElementUpdate={handleElementUpdate}
              onImageDrop={handleImageDrop}
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
              template={banner.template}
              elements={elements}
              scale={zoom / 100}
              canvasColor={canvasColor}
              fileName={`${banner.name}.png`}
              onTextChange={handleTextChange}
              selectedElementIds={selectedElementIds}
              onSelectElement={handleSelectElement}
              onElementUpdate={handleElementUpdate}
              onImageDrop={handleImageDrop}
            />
        </main>

        {/* Mobile Sidebar - Bottom horizontal scrollable */}
        <Sidebar
          canvasColor={canvasColor}
          canvasWidth={banner.template.width}
          canvasHeight={banner.template.height}
          onSelectColor={setCanvasColor}
          onCanvasSizeChange={handleCanvasSizeChange}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddImage={handleAddImage}
          elements={elements}
          selectedElementIds={selectedElementIds}
          onSelectElement={handleSelectElement}
          onReorderElements={handleReorderElements}
          onToggleLock={handleToggleLock}
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

      <BottomBar zoom={zoom} onZoomChange={setZoom} onExport={handleExport} isSaving={batchSave.isPending} />
    </div>
  );
}

