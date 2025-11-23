import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
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
}

export interface CanvasRef {
  exportImage: () => string;
}

export const Canvas = forwardRef<CanvasRef, CanvasProps>(function Canvas(
  { template, elements, scale = 0.5, canvasColor, fileName = 'artwork-01.png', onTextChange, selectedElementIds = [], onSelectElement, onElementUpdate },
  ref
) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodesRef = useRef<Map<string, Konva.Node>>(new Map());
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState<'text' | 'shape' | 'image' | null>(null);
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

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
  }), [scale, selectedElementIds, isEditing]);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current) return;

    if (selectedElementIds.length > 0 && !isEditing) {
      const selectedNodes = selectedElementIds
        .map(id => nodesRef.current.get(id))
        .filter((node): node is Konva.Node => node !== undefined);

      if (selectedNodes.length > 0) {
        transformerRef.current.nodes(selectedNodes);

        // Determine node type (only if single selection)
        if (selectedElementIds.length === 1) {
          const element = elements.find((el) => el.id === selectedElementIds[0]);
          if (element) {
            setSelectedNodeType(element.type === 'text' ? 'text' : element.type === 'image' ? 'image' : 'shape');
          }
        } else {
          setSelectedNodeType('shape'); // Multi-selection: use shape-like behavior
        }
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

  return (
    <div className="relative">
      <div className="absolute -top-8 left-0 text-sm font-medium text-gray-700">
        {fileName}
      </div>
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

              // Convert screen coordinates to canvas coordinates
              const x = pointerPosition.x / scale;
              const y = pointerPosition.y / scale;

              console.log('Starting lasso selection - pointer:', pointerPosition, 'canvas pos:', { x, y });
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

            // Convert screen coordinates to canvas coordinates
            const x = pointerPosition.x / scale;
            const y = pointerPosition.y / scale;

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

              // Get bounding box in screen coordinates, then convert to canvas coordinates
              const nodeBox = node.getClientRect({ skipTransform: false });
              const canvasNodeBox = {
                x: nodeBox.x / scale,
                y: nodeBox.y / scale,
                width: nodeBox.width / scale,
                height: nodeBox.height / scale,
              };
              console.log('Element:', element.id, 'nodeBox (canvas):', canvasNodeBox);

              // Check intersection
              const intersects =
                !(
                  selectionRect.x > canvasNodeBox.x + canvasNodeBox.width ||
                  selectionRect.x + selectionRect.width < canvasNodeBox.x ||
                  selectionRect.y > canvasNodeBox.y + canvasNodeBox.height ||
                  selectionRect.y + selectionRect.height < canvasNodeBox.y
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
                      onSelect={handleElementClick}
                      onUpdate={onElementUpdate}
                      nodeRef={nodeRefSetter}
                    />
                  );
                } else if (element.type === 'text') {
                  return (
                    <TextRenderer
                      key={element.id}
                      textElement={element as TextElement}
                      isShiftPressed={isShiftPressed}
                      onSelect={handleElementClick}
                      onDoubleClick={handleTextDoubleClick}
                      onUpdate={onElementUpdate}
                      nodeRef={nodeRefSetter}
                    />
                  );
                } else if (element.type === 'image') {
                  return (
                    <ImageRenderer
                      key={element.id}
                      imageElement={element as ImageElement}
                      isShiftPressed={isShiftPressed}
                      onSelect={handleElementClick}
                      onUpdate={onElementUpdate}
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
                keepRatio={selectedNodeType === 'text'}
              />
              {selectionRect && (
                <Rect
                  x={selectionRect.x}
                  y={selectionRect.y}
                  width={selectionRect.width}
                  height={selectionRect.height}
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
