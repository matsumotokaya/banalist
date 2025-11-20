import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Line, Star, Circle, Path, Image as KonvaImage } from 'react-konva';
import type { Template, CanvasElement, TextElement, ShapeElement, ImageElement } from '../types/template';
import type Konva from 'konva';

// Constrain drag to horizontal or vertical when Shift is pressed
// Illustrator/Figma-style: dynamically switches based on current position
const constrainedDragBound = (pos: { x: number; y: number }, startPos: { x: number; y: number }): { x: number; y: number } => {
  const dx = Math.abs(pos.x - startPos.x);
  const dy = Math.abs(pos.y - startPos.y);

  // Lock to axis with greater distance from drag start position
  // If moving more horizontally (dx > dy), lock Y axis (horizontal movement)
  // If moving more vertically (dy > dx), lock X axis (vertical movement)
  if (dx > dy) {
    return { x: pos.x, y: startPos.y }; // Horizontal movement - lock Y axis to start position
  } else {
    return { x: startPos.x, y: pos.y }; // Vertical movement - lock X axis to start position
  }
};

// Image component wrapper
const ImageComponent = ({
  imageElement,
  onSelect,
  nodeRef,
  onUpdate,
  isShiftPressed
}: {
  imageElement: ImageElement;
  onSelect: (id: string, event: Konva.KonvaEventObject<MouseEvent>) => void;
  nodeRef: (node: Konva.Image | null, id: string) => void;
  onUpdate?: (id: string, updates: Partial<ImageElement>) => void;
  isShiftPressed: boolean;
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageElement.src;
    img.onload = () => {
      setImage(img);
    };
  }, [imageElement.src]);

  return (
    <KonvaImage
      ref={(node) => nodeRef(node, imageElement.id)}
      image={image || undefined}
      x={imageElement.x}
      y={imageElement.y}
      width={imageElement.width}
      height={imageElement.height}
      rotation={imageElement.rotation || 0}
      opacity={imageElement.opacity ?? 1}
      draggable
      onMouseDown={(e) => onSelect(imageElement.id, e)}
      onDragStart={(e) => {
        dragStartPosRef.current = { x: e.target.x(), y: e.target.y() };
      }}
      dragBoundFunc={(pos) => {
        if (dragStartPosRef.current && isShiftPressed) {
          return constrainedDragBound(pos, dragStartPosRef.current);
        }
        return pos;
      }}
      onDragEnd={(e) => {
        if (onUpdate) {
          onUpdate(imageElement.id, {
            x: e.target.x(),
            y: e.target.y(),
          });
        }
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale and apply to width/height
        node.scaleX(1);
        node.scaleY(1);

        if (onUpdate) {
          onUpdate(imageElement.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }
      }}
    />
  );
};

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
  const dragStartPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const shiftPressPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const wasShiftPressed = useRef(false);

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
      if (!stageRef.current || !transformerRef.current) return '';

      // Hide transformer before export
      transformerRef.current.nodes([]);
      const layer = transformerRef.current.getLayer();
      if (layer) {
        layer.batchDraw();
      }

      // Export image
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 1 / scale });

      // Restore transformer selection after export
      if (selectedElementIds.length > 0 && !isEditing) {
        const selectedNodes = selectedElementIds
          .map(id => nodesRef.current.get(id))
          .filter((node): node is Konva.Node => node !== undefined);
        if (selectedNodes.length > 0) {
          transformerRef.current.nodes(selectedNodes);
          if (layer) {
            layer.batchDraw();
          }
        }
      }

      return dataURL;
    },
  }));

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
                if (element.type === 'shape') {
                  const shape = element as ShapeElement;
                  if (shape.shapeType === 'rectangle') {
                    return (
                      <Rect
                        key={shape.id}
                        ref={(node) => {
                          if (node) {
                            nodesRef.current.set(shape.id, node);
                          } else {
                            nodesRef.current.delete(shape.id);
                          }
                        }}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        fill={shape.fillEnabled ? shape.fill : undefined}
                        stroke={shape.strokeEnabled ? shape.stroke : undefined}
                        strokeWidth={shape.strokeEnabled ? shape.strokeWidth : 0}
                        rotation={shape.rotation || 0}
                        opacity={shape.opacity ?? 1}
                        draggable
                        onMouseDown={(e) => handleElementClick(shape.id, e)}
                        onDragStart={(e) => {
                          dragStartPositions.current.set(shape.id, { x: e.target.x(), y: e.target.y() });
                        }}
                        dragBoundFunc={(pos) => {
                          const startPos = dragStartPositions.current.get(shape.id);
                          if (startPos && isShiftPressed) {
                            return constrainedDragBound(pos, startPos);
                          }
                          return pos;
                        }}
                        onDragEnd={(e) => {
                          if (onElementUpdate) {
                            onElementUpdate(shape.id, {
                              x: e.target.x(),
                              y: e.target.y(),
                            });
                          }
                        }}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          const scaleY = node.scaleY();

                          node.scaleX(1);
                          node.scaleY(1);

                          if (onElementUpdate) {
                            onElementUpdate(shape.id, {
                              x: node.x(),
                              y: node.y(),
                              width: Math.max(5, node.width() * scaleX),
                              height: Math.max(5, node.height() * scaleY),
                              rotation: node.rotation(),
                            });
                          }
                        }}
                      />
                    );
                  } else if (shape.shapeType === 'triangle') {
                    return (
                      <Line
                        key={shape.id}
                        ref={(node) => {
                          if (node) {
                            nodesRef.current.set(shape.id, node);
                          } else {
                            nodesRef.current.delete(shape.id);
                          }
                        }}
                        points={[
                          shape.width / 2, 0,
                          shape.width, shape.height,
                          0, shape.height
                        ]}
                        x={shape.x}
                        y={shape.y}
                        fill={shape.fillEnabled ? shape.fill : undefined}
                        stroke={shape.strokeEnabled ? shape.stroke : undefined}
                        strokeWidth={shape.strokeEnabled ? shape.strokeWidth : 0}
                        rotation={shape.rotation || 0}
                        opacity={shape.opacity ?? 1}
                        closed
                        draggable
                        onMouseDown={(e) => handleElementClick(shape.id, e)}
                        onDragStart={(e) => {
                          dragStartPositions.current.set(shape.id, { x: e.target.x(), y: e.target.y() });
                        }}
                        dragBoundFunc={(pos) => {
                          const startPos = dragStartPositions.current.get(shape.id);
                          if (startPos && isShiftPressed) {
                            return constrainedDragBound(pos, startPos);
                          }
                          return pos;
                        }}
                        onDragEnd={(e) => {
                          if (onElementUpdate) {
                            onElementUpdate(shape.id, {
                              x: e.target.x(),
                              y: e.target.y(),
                            });
                          }
                        }}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          const scaleY = node.scaleY();

                          node.scaleX(1);
                          node.scaleY(1);

                          if (onElementUpdate) {
                            onElementUpdate(shape.id, {
                              x: node.x(),
                              y: node.y(),
                              width: Math.max(5, shape.width * scaleX),
                              height: Math.max(5, shape.height * scaleY),
                              rotation: node.rotation(),
                            });
                          }
                        }}
                      />
                    );
                  } else if (shape.shapeType === 'star') {
                    return (
                      <Star
                        key={shape.id}
                        ref={(node) => {
                          if (node) {
                            nodesRef.current.set(shape.id, node);
                          } else {
                            nodesRef.current.delete(shape.id);
                          }
                        }}
                        x={shape.x + shape.width / 2}
                        y={shape.y + shape.height / 2}
                        numPoints={5}
                        innerRadius={Math.min(shape.width, shape.height) / 4}
                        outerRadius={Math.min(shape.width, shape.height) / 2}
                        fill={shape.fillEnabled ? shape.fill : undefined}
                        stroke={shape.strokeEnabled ? shape.stroke : undefined}
                        strokeWidth={shape.strokeEnabled ? shape.strokeWidth : 0}
                        rotation={shape.rotation || 0}
                        opacity={shape.opacity ?? 1}
                        draggable
                        onMouseDown={(e) => handleElementClick(shape.id, e)}
                        onDragStart={(e) => {
                          dragStartPositions.current.set(shape.id, { x: e.target.x(), y: e.target.y() });
                        }}
                        dragBoundFunc={(pos) => {
                          const startPos = dragStartPositions.current.get(shape.id);
                          if (startPos && isShiftPressed) {
                            return constrainedDragBound(pos, startPos);
                          }
                          return pos;
                        }}
                        onDragEnd={(e) => {
                          if (onElementUpdate) {
                            const centerX = e.target.x();
                            const centerY = e.target.y();
                            onElementUpdate(shape.id, {
                              x: centerX - shape.width / 2,
                              y: centerY - shape.height / 2,
                            });
                          }
                        }}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          const scaleY = node.scaleY();

                          node.scaleX(1);
                          node.scaleY(1);

                          const centerX = node.x();
                          const centerY = node.y();
                          const newWidth = Math.max(5, shape.width * scaleX);
                          const newHeight = Math.max(5, shape.height * scaleY);

                          if (onElementUpdate) {
                            onElementUpdate(shape.id, {
                              x: centerX - newWidth / 2,
                              y: centerY - newHeight / 2,
                              width: newWidth,
                              height: newHeight,
                              rotation: node.rotation(),
                            });
                          }
                        }}
                      />
                    );
                  } else if (shape.shapeType === 'circle') {
                    return (
                      <Circle
                        key={shape.id}
                        ref={(node) => {
                          if (node) {
                            nodesRef.current.set(shape.id, node);
                          } else {
                            nodesRef.current.delete(shape.id);
                          }
                        }}
                        x={shape.x + shape.width / 2}
                        y={shape.y + shape.height / 2}
                        radiusX={shape.width / 2}
                        radiusY={shape.height / 2}
                        fill={shape.fillEnabled ? shape.fill : undefined}
                        stroke={shape.strokeEnabled ? shape.stroke : undefined}
                        strokeWidth={shape.strokeEnabled ? shape.strokeWidth : 0}
                        rotation={shape.rotation || 0}
                        opacity={shape.opacity ?? 1}
                        draggable
                        onMouseDown={(e) => handleElementClick(shape.id, e)}
                        onDragStart={(e) => {
                          dragStartPositions.current.set(shape.id, { x: e.target.x(), y: e.target.y() });
                        }}
                        dragBoundFunc={(pos) => {
                          const startPos = dragStartPositions.current.get(shape.id);
                          if (startPos && isShiftPressed) {
                            return constrainedDragBound(pos, startPos);
                          }
                          return pos;
                        }}
                        onDragEnd={(e) => {
                          if (onElementUpdate) {
                            const centerX = e.target.x();
                            const centerY = e.target.y();
                            onElementUpdate(shape.id, {
                              x: centerX - shape.width / 2,
                              y: centerY - shape.height / 2,
                            });
                          }
                        }}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          const scaleY = node.scaleY();

                          node.scaleX(1);
                          node.scaleY(1);

                          const centerX = node.x();
                          const centerY = node.y();
                          const newWidth = Math.max(5, shape.width * scaleX);
                          const newHeight = Math.max(5, shape.height * scaleY);

                          if (onElementUpdate) {
                            onElementUpdate(shape.id, {
                              x: centerX - newWidth / 2,
                              y: centerY - newHeight / 2,
                              width: newWidth,
                              height: newHeight,
                              rotation: node.rotation(),
                            });
                          }
                        }}
                      />
                    );
                  } else if (shape.shapeType === 'heart') {
                    const heartPath = `M ${shape.width / 2} ${shape.height * 0.3}
                      C ${shape.width / 2} ${shape.height * 0.15}, ${shape.width * 0.35} 0, ${shape.width * 0.25} 0
                      C ${shape.width * 0.1} 0, 0 ${shape.height * 0.15}, 0 ${shape.height * 0.3}
                      C 0 ${shape.height * 0.55}, ${shape.width / 2} ${shape.height * 0.8}, ${shape.width / 2} ${shape.height}
                      C ${shape.width / 2} ${shape.height * 0.8}, ${shape.width} ${shape.height * 0.55}, ${shape.width} ${shape.height * 0.3}
                      C ${shape.width} ${shape.height * 0.15}, ${shape.width * 0.9} 0, ${shape.width * 0.75} 0
                      C ${shape.width * 0.65} 0, ${shape.width / 2} ${shape.height * 0.15}, ${shape.width / 2} ${shape.height * 0.3} Z`;

                    return (
                      <Path
                        key={shape.id}
                        ref={(node) => {
                          if (node) {
                            nodesRef.current.set(shape.id, node);
                          } else {
                            nodesRef.current.delete(shape.id);
                          }
                        }}
                        data={heartPath}
                        x={shape.x}
                        y={shape.y}
                        fill={shape.fillEnabled ? shape.fill : undefined}
                        stroke={shape.strokeEnabled ? shape.stroke : undefined}
                        strokeWidth={shape.strokeEnabled ? shape.strokeWidth : 0}
                        rotation={shape.rotation || 0}
                        opacity={shape.opacity ?? 1}
                        draggable
                        onMouseDown={(e) => handleElementClick(shape.id, e)}
                        onDragStart={(e) => {
                          dragStartPositions.current.set(shape.id, { x: e.target.x(), y: e.target.y() });
                        }}
                        dragBoundFunc={(pos) => {
                          const startPos = dragStartPositions.current.get(shape.id);
                          if (startPos && isShiftPressed) {
                            return constrainedDragBound(pos, startPos);
                          }
                          return pos;
                        }}
                        onDragEnd={(e) => {
                          if (onElementUpdate) {
                            onElementUpdate(shape.id, {
                              x: e.target.x(),
                              y: e.target.y(),
                            });
                          }
                        }}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          const scaleY = node.scaleY();

                          node.scaleX(1);
                          node.scaleY(1);

                          if (onElementUpdate) {
                            onElementUpdate(shape.id, {
                              x: node.x(),
                              y: node.y(),
                              width: Math.max(5, shape.width * scaleX),
                              height: Math.max(5, shape.height * scaleY),
                              rotation: node.rotation(),
                            });
                          }
                        }}
                      />
                    );
                  }
                } else if (element.type === 'text') {
                  const textElement = element as TextElement;
                  return (
                    <Text
                      key={textElement.id}
                      ref={(node) => {
                        if (node) {
                          nodesRef.current.set(textElement.id, node);
                        } else {
                          nodesRef.current.delete(textElement.id);
                        }
                      }}
                      text={textElement.text}
                      x={textElement.x}
                      y={textElement.y}
                      fontSize={textElement.fontSize}
                      fontFamily={textElement.fontFamily}
                      fontStyle={textElement.fontWeight >= 700 ? 'bold' : textElement.fontWeight <= 300 ? 'lighter' : 'normal'}
                      fill={textElement.fillEnabled ? textElement.fill : 'transparent'}
                      stroke={textElement.strokeEnabled ? textElement.stroke : undefined}
                      strokeWidth={textElement.strokeEnabled ? textElement.strokeWidth : 0}
                      rotation={textElement.rotation || 0}
                      opacity={textElement.opacity ?? 1}
                      draggable
                      onMouseDown={(e) => handleElementClick(textElement.id, e)}
                      onDblClick={(e) => {
                        const textNode = e.target as Konva.Text;
                        handleTextDoubleClick(textElement, textNode);
                      }}
                      onDragStart={(e) => {
                        dragStartPositions.current.set(textElement.id, { x: e.target.x(), y: e.target.y() });
                      }}
                      dragBoundFunc={(pos) => {
                        const startPos = dragStartPositions.current.get(textElement.id);
                        if (startPos && isShiftPressed) {
                          return constrainedDragBound(pos, startPos);
                        }
                        return pos;
                      }}
                      onDragEnd={(e) => {
                        if (onElementUpdate) {
                          onElementUpdate(textElement.id, {
                            x: e.target.x(),
                            y: e.target.y(),
                          });
                        }
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target as Konva.Text;
                        const scaleY = node.scaleY();

                        node.scaleX(1);
                        node.scaleY(1);

                        if (onElementUpdate) {
                          onElementUpdate(textElement.id, {
                            x: node.x(),
                            y: node.y(),
                            fontSize: Math.max(10, textElement.fontSize * scaleY),
                            rotation: node.rotation(),
                          });
                        }
                      }}
                    />
                  );
                } else if (element.type === 'image') {
                  const imageElement = element as ImageElement;
                  return (
                    <ImageComponent
                      key={imageElement.id}
                      imageElement={imageElement}
                      nodeRef={(node, id) => {
                        if (node) {
                          nodesRef.current.set(id, node);
                        } else {
                          nodesRef.current.delete(id);
                        }
                      }}
                      onSelect={handleElementClick}
                      onUpdate={onElementUpdate}
                      isShiftPressed={isShiftPressed}
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
