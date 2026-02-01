import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import type { Template, CanvasElement, TextElement, ShapeElement, ImageElement } from '../types/template';
import type Konva from 'konva';
import { ShapeRenderer } from './canvas/ShapeRenderer';
import { TextRenderer } from './canvas/TextRenderer';
import { ImageRenderer } from './canvas/ImageRenderer';

interface CanvasProps {
  template: Template;
  elements: CanvasElement[];
  scale?: number;
  canvasColor: string;
  fileName?: string;
  onTextChange?: (id: string, newText: string) => void;
  selectedElementIds?: string[];
  onSelectElement?: (ids: string[]) => void;
  onElementUpdate?: (id: string, updates: Partial<CanvasElement>) => void;
  onElementsUpdate?: (ids: string[], updateFn: (element: CanvasElement) => Partial<CanvasElement>) => void;
  onImageDrop?: (file: File, x: number, y: number, width: number, height: number) => void;
}

export interface CanvasRef {
  exportImage: () => string;
  exportThumbnail: () => string;
}

export const Canvas = forwardRef<CanvasRef, CanvasProps>(function Canvas(
  { template, elements, scale = 0.5, canvasColor, fileName = 'artwork-01.png', onTextChange, selectedElementIds = [], onSelectElement, onElementUpdate, onElementsUpdate, onImageDrop },
  ref
) {
  const { t } = useTranslation('editor');
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodesRef = useRef<Map<string, Konva.Node>>(new Map());
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState<'text' | 'shape' | 'image' | null>(null);
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isMultiDragging, setIsMultiDragging] = useState(false);
  const multiDragRef = useRef<{
    active: boolean;
    draggedId: string | null;
    startPositions: Map<string, { x: number; y: number }>;
    elementMap: Map<string, CanvasElement>;
  }>({ active: false, draggedId: null, startPositions: new Map(), elementMap: new Map() });
  const multiDragLockAxisRef = useRef<'x' | 'y' | null>(null);

  // Track Shift key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    exportImage: () => {
      if (!stageRef.current) {
        console.error('Export failed: stageRef is null');
        return '';
      }

      const stage = stageRef.current;

      // Save current transformer state
      const wasTransformerVisible = transformerRef.current && transformerRef.current.nodes().length > 0;

      // Hide transformer before export
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
      }

      // Force redraw to ensure all elements are rendered
      const layers = stage.getLayers();
      if (layers.length > 0) {
        layers[0].batchDraw();
      } else {
        console.error('Export failed: no layers found');
        return '';
      }

      // Export at original resolution (not scaled)
      // pixelRatio should be inverse of scale to get original size
      // e.g., if scale=0.5 (50%), pixelRatio=2 to get 100% size output
      try {
        const dataURL = stage.toDataURL({
          pixelRatio: 1 / scale,
          mimeType: 'image/png',
          quality: 1
        });

        console.log('Export dataURL length:', dataURL?.length || 0);

        // Restore transformer selection after export
        if (wasTransformerVisible && transformerRef.current && !isEditing) {
          const selectedNodes = selectedElementIds
            .map(id => nodesRef.current.get(id))
            .filter((node): node is Konva.Node => node !== undefined);
          if (selectedNodes.length > 0) {
            transformerRef.current.nodes(selectedNodes);
            if (layers.length > 0) {
              layers[0].batchDraw();
            }
          }
        }

        return dataURL;
      } catch (error) {
        console.error('Export failed with error:', error);
        return '';
      }
    },
    exportThumbnail: () => {
      if (!stageRef.current) {
        console.error('Thumbnail export failed: stageRef is null');
        return '';
      }

      const stage = stageRef.current;

      // Hide transformer before export
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
      }

      const layers = stage.getLayers();
      if (layers.length > 0) {
        layers[0].batchDraw();
      } else {
        console.error('Thumbnail export failed: no layers found');
        return '';
      }

      try {
        // Calculate thumbnail size (max 400px width, maintain aspect ratio)
        const originalWidth = template.width;
        const maxThumbnailWidth = 400;
        const thumbnailScale = maxThumbnailWidth / originalWidth;

        // pixelRatio to get thumbnail size from scaled canvas
        // Current display: originalWidth * scale
        // Target: maxThumbnailWidth = originalWidth * thumbnailScale
        // So pixelRatio = thumbnailScale / scale
        const pixelRatio = thumbnailScale / scale;

        const dataURL = stage.toDataURL({
          pixelRatio,
          mimeType: 'image/jpeg',
          quality: 0.7
        });

        console.log('Thumbnail dataURL length:', dataURL?.length || 0, 'pixelRatio:', pixelRatio);

        return dataURL;
      } catch (error) {
        console.error('Thumbnail export failed with error:', error);
        return '';
      }
    },
  }), [scale, selectedElementIds, isEditing, template.width, template.height]);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current) return;

    if (selectedElementIds.length > 0 && !isEditing) {
      const selectedNodes = selectedElementIds
        .map(id => nodesRef.current.get(id))
        .filter((node): node is Konva.Node => node !== undefined);

      // Always update transformer nodes (even if empty, to clear stale state)
      transformerRef.current.nodes(selectedNodes);

      if (selectedNodes.length > 0) {
        // Determine node type (only if single selection)
        if (selectedElementIds.length === 1) {
          const element = elements.find((el) => el.id === selectedElementIds[0]);
          if (element) {
            setSelectedNodeType(element.type === 'text' ? 'text' : element.type === 'image' ? 'image' : 'shape');
          }
        } else {
          setSelectedNodeType('shape'); // Multi-selection: use shape-like behavior
        }
      } else {
        setSelectedNodeType(null);
      }
    } else {
      transformerRef.current.nodes([]);
      setSelectedNodeType(null);
    }
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedElementIds, isEditing, elements]);

  // Handle element selection (single or multi with Shift)
  const handleElementClick = (id: string, event: Konva.KonvaEventObject<MouseEvent>) => {
    if (!onSelectElement) return;

    const isShiftPressed = event.evt.shiftKey;
    const isAlreadySelected = selectedElementIds.includes(id);

    console.log('handleElementClick:', { id, isShiftPressed, isAlreadySelected, currentSelection: selectedElementIds });

    if (isShiftPressed) {
      // Shift+Click: toggle selection
      if (isAlreadySelected) {
        onSelectElement(selectedElementIds.filter(selectedId => selectedId !== id));
      } else {
        onSelectElement([...selectedElementIds, id]);
      }
    } else {
      // Regular click: only change selection if clicking on unselected element
      // This allows dragging multiple selected elements without deselecting
      if (!isAlreadySelected || selectedElementIds.length === 1) {
        onSelectElement([id]);
      }
      // If already selected and part of multi-selection, keep the current selection
    }
  };

  const handleElementDragStart = (id: string, _event: Konva.KonvaEventObject<DragEvent>) => {
    if (selectedElementIds.length <= 1 || !selectedElementIds.includes(id)) {
      multiDragRef.current = { active: false, draggedId: null, startPositions: new Map(), elementMap: new Map() };
      setIsMultiDragging(false);
      multiDragLockAxisRef.current = null;
      return;
    }

    const startPositions = new Map<string, { x: number; y: number }>();
    const elementMap = new Map<string, CanvasElement>();
    selectedElementIds.forEach((selectedId) => {
      // Use element's logical coordinates instead of node.x()/y()
      // This ensures consistent coordinate system for all element types
      // (Star/Circle use center coordinates in Konva, but element.x/y is top-left)
      const element = elements.find(el => el.id === selectedId);
      if (element) {
        startPositions.set(selectedId, { x: element.x, y: element.y });
        elementMap.set(selectedId, element);
      }
    });

    multiDragRef.current = {
      active: true,
      draggedId: id,
      startPositions,
      elementMap,
    };
    multiDragLockAxisRef.current = null;
    setIsMultiDragging(true);
  };

  const handleElementDragMove = (id: string, event: Konva.KonvaEventObject<DragEvent>) => {
    const { active, draggedId, startPositions, elementMap } = multiDragRef.current;
    if (!active || draggedId !== id) return;

    const draggedElement = elementMap.get(id);
    const draggedStart = startPositions.get(id);
    if (!draggedStart || !draggedElement) return;

    // Calculate delta using logical coordinates
    // For Star/Circle, node.x() is center coordinate, so convert to top-left
    let currentX = event.target.x();
    let currentY = event.target.y();

    if (draggedElement.type === 'shape') {
      const shapeEl = draggedElement as ShapeElement;
      if (shapeEl.shapeType === 'star' || shapeEl.shapeType === 'circle') {
        // Convert center coordinate to top-left coordinate
        currentX = currentX - shapeEl.width / 2;
        currentY = currentY - shapeEl.height / 2;
      }
    }

    const dx = currentX - draggedStart.x;
    const dy = currentY - draggedStart.y;
    let constrainedDx = dx;
    let constrainedDy = dy;

    if (isShiftPressed) {
      if (!multiDragLockAxisRef.current) {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        if (absDx !== absDy) {
          multiDragLockAxisRef.current = absDx >= absDy ? 'y' : 'x';
        }
      }

      if (multiDragLockAxisRef.current === 'x') {
        constrainedDx = 0;
      } else if (multiDragLockAxisRef.current === 'y') {
        constrainedDy = 0;
      }
    } else {
      multiDragLockAxisRef.current = null;
    }

    const constrainedX = draggedStart.x + constrainedDx;
    const constrainedY = draggedStart.y + constrainedDy;

    // Ensure dragged node follows the constrained path
    let draggedNodeX = constrainedX;
    let draggedNodeY = constrainedY;
    if (draggedElement.type === 'shape') {
      const shapeEl = draggedElement as ShapeElement;
      if (shapeEl.shapeType === 'star' || shapeEl.shapeType === 'circle') {
        draggedNodeX = constrainedX + shapeEl.width / 2;
        draggedNodeY = constrainedY + shapeEl.height / 2;
      }
    }
    event.target.position({ x: draggedNodeX, y: draggedNodeY });

    // Move other selected elements (visual update)
    startPositions.forEach((startPos, elementId) => {
      if (elementId === id) return;
      const node = nodesRef.current.get(elementId);
      const element = elementMap.get(elementId);
      if (!node || !element) return;

      // Set node position based on element type
      let nodeX = startPos.x + constrainedDx;
      let nodeY = startPos.y + constrainedDy;

      if (element.type === 'shape') {
        const shapeEl = element as ShapeElement;
        if (shapeEl.shapeType === 'star' || shapeEl.shapeType === 'circle') {
          // Convert top-left coordinate to center coordinate for rendering
          nodeX = nodeX + shapeEl.width / 2;
          nodeY = nodeY + shapeEl.height / 2;
        }
      }

      node.position({ x: nodeX, y: nodeY });
    });

    event.target.getStage()?.batchDraw();
  };

  const handleElementDragEnd = (id: string, event: Konva.KonvaEventObject<DragEvent>) => {
    const { active, draggedId, startPositions, elementMap } = multiDragRef.current;
    if (!active || draggedId !== id) return false;

    const draggedElement = elementMap.get(id);
    const draggedStart = startPositions.get(id);
    if (!draggedStart || !draggedElement) return false;

    // Calculate delta using logical coordinates
    // For Star/Circle, node.x() is center coordinate, so convert to top-left
    let currentX = event.target.x();
    let currentY = event.target.y();

    if (draggedElement.type === 'shape') {
      const shapeEl = draggedElement as ShapeElement;
      if (shapeEl.shapeType === 'star' || shapeEl.shapeType === 'circle') {
        // Convert center coordinate to top-left coordinate
        currentX = currentX - shapeEl.width / 2;
        currentY = currentY - shapeEl.height / 2;
      }
    }

    let dx = currentX - draggedStart.x;
    let dy = currentY - draggedStart.y;

    if (multiDragLockAxisRef.current === 'x') {
      dx = 0;
    } else if (multiDragLockAxisRef.current === 'y') {
      dy = 0;
    }

    if (onElementsUpdate) {
      const ids = selectedElementIds.length > 0 ? selectedElementIds : Array.from(startPositions.keys());
      onElementsUpdate(ids, (element) => ({
        x: element.x + dx,
        y: element.y + dy,
      }));
    } else if (onElementUpdate) {
      startPositions.forEach((startPos, elementId) => {
        onElementUpdate(elementId, {
          x: startPos.x + dx,
          y: startPos.y + dy,
        });
      });
    }

    multiDragRef.current = { active: false, draggedId: null, startPositions: new Map(), elementMap: new Map() };
    setIsMultiDragging(false);
    multiDragLockAxisRef.current = null;
    return true;
  };

  const handleTextDoubleClick = (element: TextElement, textNode: Konva.Text) => {
    if (!stageRef.current || !onTextChange) return;

    setIsEditing(true);
    const stage = stageRef.current;
    const container = stage.container();

    // Hide the text node temporarily
    textNode.hide();

    // Create textarea element
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    // Get the bounding box of the text node on the canvas
    const textPosition = textNode.getClientRect();
    const stageContainer = container.getBoundingClientRect();

    // Calculate absolute position on the page
    const absoluteX = stageContainer.left + textPosition.x + window.scrollX;
    const absoluteY = stageContainer.top + textPosition.y + window.scrollY;

    // Calculate minimum width to fit content
    const minWidth = Math.max(textPosition.width, 100);

    // Position the textarea
    textarea.value = element.text;
    textarea.style.position = 'absolute';
    textarea.style.top = `${absoluteY}px`;
    textarea.style.left = `${absoluteX}px`;
    textarea.style.minWidth = `${minWidth}px`;
    textarea.style.width = 'auto';
    textarea.style.minHeight = `${element.fontSize * scale}px`;
    textarea.style.height = 'auto';
    textarea.style.fontSize = `${element.fontSize * scale}px`;
    textarea.style.fontFamily = element.fontFamily;
    textarea.style.fontWeight = element.fontWeight.toString();
    textarea.style.letterSpacing = `${(element.letterSpacing ?? 0) * scale}px`;
    textarea.style.border = '2px solid #4F46E5';
    textarea.style.padding = '2px 4px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'rgba(255, 255, 255, 0.9)';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = '1.2';
    textarea.style.color = element.fill;
    textarea.style.transformOrigin = 'left top';
    textarea.style.zIndex = '1000';
    textarea.style.boxSizing = 'border-box';
    textarea.style.whiteSpace = 'pre-wrap';
    textarea.style.wordWrap = 'break-word';

    // Auto-resize function
    const autoResize = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener('input', autoResize);

    // Focus and select all text
    textarea.focus();
    textarea.select();
    autoResize();

    const removeTextarea = () => {
      textarea.parentNode?.removeChild(textarea);
      textNode.show();
      setIsEditing(false);
    };

    const handleSubmit = () => {
      const newText = textarea.value;
      onTextChange(element.id, newText);
      removeTextarea();
    };

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        removeTextarea();
      }
    });

    textarea.addEventListener('blur', handleSubmit);
  };

  // Handle file drop on canvas
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (!onImageDrop || !stageRef.current) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    // Get drop position relative to canvas
    const stage = stageRef.current;
    const stageContainer = stage.container().getBoundingClientRect();
    const baseDropX = (e.clientX - stageContainer.left) / scale;
    const baseDropY = (e.clientY - stageContainer.top) / scale;

    // Process each image file
    imageFiles.forEach((imageFile, index) => {
      const objectUrl = URL.createObjectURL(imageFile);
      const img = new Image();
      img.onload = () => {
        const offsetX = baseDropX + (index * 50);
        const offsetY = baseDropY + (index * 50);
        onImageDrop(imageFile, offsetX, offsetY, img.width, img.height);
        URL.revokeObjectURL(objectUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the canvas container itself
    if (e.currentTarget === e.target) {
      setIsDraggingOver(false);
    }
  };

  return (
    <div className="relative" onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
      <div className="absolute -top-8 left-0 text-sm font-medium text-gray-700">
        {fileName}
      </div>
      {isDraggingOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-4 border-blue-500 border-dashed z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white px-6 py-3 rounded-lg shadow-lg">
            <p className="text-blue-600 font-semibold text-lg">{t('dropImage')}</p>
          </div>
        </div>
      )}
      <div className="bg-white shadow-xl border border-gray-200">
        <Stage
          ref={stageRef}
          width={template.width * scale}
          height={template.height * scale}
          scaleX={scale}
          scaleY={scale}
          onClick={(e) => {
            // Deselect when clicking on empty area (stage or background rect)
            const isBackground = e.target === e.target.getStage() ||
                                 (e.target.getClassName() === 'Rect' && e.target.attrs.fill === canvasColor);
            if (isBackground && onSelectElement) {
              onSelectElement([]);
            }
          }}
          onMouseDown={(e) => {
            // Start lasso selection on background (not on elements)
            // Elements have draggable=true, so their onMouseDown will stop propagation
            // This only fires when clicking on Stage or background Rect
            const target = e.target;
            const isStage = target === e.target.getStage();
            const isBackgroundRect = target.getClassName() === 'Rect' && target.listening() === false;

            console.log('Stage onMouseDown:', {
              targetClass: target.getClassName(),
              isStage,
              isBackgroundRect,
              listening: target.listening ? target.listening() : 'N/A',
              isEditing
            });

            if ((isStage || isBackgroundRect) && !isEditing) {
              // Get mouse position in canvas coordinates (accounting for scale)
              const stage = e.target.getStage();
              if (!stage) return;

              const pointerPosition = stage.getPointerPosition();
              if (!pointerPosition) return;
              const x = pointerPosition.x;
              const y = pointerPosition.y;

              console.log('Starting lasso selection - stage pos:', { x, y });
              selectionStartRef.current = { x, y };
              setSelectionRect({ x, y, width: 0, height: 0 });
            }
          }}
          onMouseMove={(e) => {
            if (!selectionStartRef.current) {
              // Not in selection mode
              return;
            }

            const stage = e.target.getStage();
            if (!stage) return;

            const pointerPosition = stage.getPointerPosition();
            if (!pointerPosition) return;
            const x = pointerPosition.x;
            const y = pointerPosition.y;

            const startX = selectionStartRef.current.x;
            const startY = selectionStartRef.current.y;

            const rect = {
              x: Math.min(startX, x),
              y: Math.min(startY, y),
              width: Math.abs(x - startX),
              height: Math.abs(y - startY),
            };

            // Only log occasionally to avoid spam
            if (Math.random() < 0.1) {
              console.log('onMouseMove - start:', selectionStartRef.current, 'current:', { x, y }, 'rect:', rect);
            }
            setSelectionRect(rect);
          }}
          onMouseUp={() => {
            if (!selectionRect || !onSelectElement) {
              selectionStartRef.current = null;
              setSelectionRect(null);
              return;
            }

            // Skip if selection area is too small (just a click)
            if (selectionRect.width < 5 && selectionRect.height < 5) {
              selectionStartRef.current = null;
              setSelectionRect(null);
              return;
            }

            // Find all elements that intersect with selection rectangle
            const selected: string[] = [];
            console.log('Lasso selection:', selectionRect);

            elements.forEach((element) => {
              const node = nodesRef.current.get(element.id);
              if (!node) return;

              // Get bounding box in stage coordinates
              const nodeBox = node.getClientRect({ skipTransform: false });
              console.log('Element:', element.id, 'nodeBox (stage):', nodeBox);

              // Check intersection
              const intersects =
                !(
                  selectionRect.x > nodeBox.x + nodeBox.width ||
                  selectionRect.x + selectionRect.width < nodeBox.x ||
                  selectionRect.y > nodeBox.y + nodeBox.height ||
                  selectionRect.y + selectionRect.height < nodeBox.y
                );

              console.log('Intersects:', intersects);
              if (intersects) {
                selected.push(element.id);
              }
            });

            console.log('Selected elements:', selected);
            if (selected.length > 0) {
              onSelectElement(selected);
            }

            selectionStartRef.current = null;
            setSelectionRect(null);
          }}
        >
          <Layer>
            <Rect
              x={0}
              y={0}
              width={template.width}
              height={template.height}
              fill={canvasColor}
              listening={false}
            />
              {elements.map((element) => {
                const nodeRefSetter = (node: Konva.Node | null, id: string) => {
                  if (node) {
                    nodesRef.current.set(id, node);
                  } else {
                    nodesRef.current.delete(id);
                  }
                };

                if (element.type === 'shape') {
                  return (
                    <ShapeRenderer
                      key={element.id}
                      shape={element as ShapeElement}
                      isShiftPressed={isShiftPressed}
                      isMultiDragging={isMultiDragging}
                      onSelect={handleElementClick}
                      onUpdate={onElementUpdate}
                      onDragStart={handleElementDragStart}
                      onDragMove={handleElementDragMove}
                      onDragEnd={handleElementDragEnd}
                      nodeRef={nodeRefSetter}
                    />
                  );
                } else if (element.type === 'text') {
                  return (
                    <TextRenderer
                      key={element.id}
                      textElement={element as TextElement}
                      isShiftPressed={isShiftPressed}
                      isMultiDragging={isMultiDragging}
                      onSelect={handleElementClick}
                      onDoubleClick={handleTextDoubleClick}
                      onUpdate={onElementUpdate}
                      onDragStart={handleElementDragStart}
                      onDragMove={handleElementDragMove}
                      onDragEnd={handleElementDragEnd}
                      nodeRef={nodeRefSetter}
                    />
                  );
                } else if (element.type === 'image') {
                  return (
                    <ImageRenderer
                      key={element.id}
                      imageElement={element as ImageElement}
                      isShiftPressed={isShiftPressed}
                      isMultiDragging={isMultiDragging}
                      onSelect={handleElementClick}
                      onUpdate={onElementUpdate}
                      onDragStart={handleElementDragStart}
                      onDragMove={handleElementDragMove}
                      onDragEnd={handleElementDragEnd}
                      nodeRef={nodeRefSetter}
                    />
                  );
                }
                return null;
              })}
              <Transformer
                ref={transformerRef}
                borderStroke="#4F46E5"
                borderStrokeWidth={2}
                borderDash={[4, 4]}
                anchorStroke="#4F46E5"
                anchorFill="#FFFFFF"
                anchorSize={8}
                enabledAnchors={
                  selectedNodeType === 'shape'
                    ? ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']
                    : selectedNodeType === 'image'
                    ? ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']
                    : ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                }
                rotateEnabled={true}
                rotationSnaps={isShiftPressed ? [0, 45, 90, 135, 180, 225, 270, 315] : []}
                rotationSnapTolerance={5}
                keepRatio={selectedNodeType === 'text'}
              />
              {selectionRect && (
                <Rect
                  x={selectionRect.x / scale}
                  y={selectionRect.y / scale}
                  width={selectionRect.width / scale}
                  height={selectionRect.height / scale}
                  fill="rgba(79, 70, 229, 0.1)"
                  stroke="#4F46E5"
                  strokeWidth={1}
                  dash={[4, 4]}
                  listening={false}
                />
              )}
            </Layer>
          </Stage>
      </div>
    </div>
  );
});
