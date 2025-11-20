import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Line, Star } from 'react-konva';
import type { Template, CanvasElement, TextElement, ShapeElement } from '../types/template';
import type Konva from 'konva';

interface CanvasProps {
  template: Template;
  elements: CanvasElement[];
  scale?: number;
  canvasColor: string;
  fileName?: string;
  onTextChange?: (id: string, newText: string) => void;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
}

export interface CanvasRef {
  exportImage: () => string;
}

export const Canvas = forwardRef<CanvasRef, CanvasProps>(function Canvas(
  { template, elements, scale = 0.5, canvasColor, fileName = 'artwork-01.png', onTextChange, selectedElementId, onSelectElement },
  ref
) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodesRef = useRef<Map<string, Konva.Node>>(new Map());
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState<'text' | 'shape' | null>(null);

  useImperativeHandle(ref, () => ({
    exportImage: () => {
      if (!stageRef.current) return '';
      return stageRef.current.toDataURL({ pixelRatio: 1 / scale });
    },
  }));

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current) return;

    if (selectedElementId && !isEditing) {
      const selectedNode = nodesRef.current.get(selectedElementId);

      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);

        // Determine node type from elements
        const element = elements.find((el) => el.id === selectedElementId);
        if (element) {
          setSelectedNodeType(element.type === 'text' ? 'text' : 'shape');
        }
      }
    } else {
      transformerRef.current.nodes([]);
      setSelectedNodeType(null);
    }
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedElementId, isEditing, elements]);

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
            // Deselect when clicking on empty area
            const clickedOnEmpty = e.target === e.target.getStage();
            if (clickedOnEmpty && onSelectElement) {
              onSelectElement(null);
            }
          }}
        >
          <Layer>
            <Rect
              x={0}
              y={0}
              width={template.width}
              height={template.height}
              fill={canvasColor}
              onClick={() => {
                // Deselect when clicking on background
                if (onSelectElement) {
                  onSelectElement(null);
                }
              }}
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
                        fill={shape.fill}
                        draggable
                        onClick={() => {
                          if (onSelectElement) {
                            onSelectElement(shape.id);
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
                        fill={shape.fill}
                        closed
                        draggable
                        onClick={() => {
                          if (onSelectElement) {
                            onSelectElement(shape.id);
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
                        fill={shape.fill}
                        draggable
                        onClick={() => {
                          if (onSelectElement) {
                            onSelectElement(shape.id);
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
                      fill={textElement.strokeOnly ? 'transparent' : textElement.fill}
                      stroke={textElement.strokeOnly ? textElement.fill : undefined}
                      strokeWidth={textElement.strokeOnly ? Math.max(textElement.fontSize * 0.03, 2) : 0}
                      draggable
                      onClick={() => {
                        if (onSelectElement) {
                          onSelectElement(textElement.id);
                        }
                      }}
                      onDblClick={(e) => {
                        const textNode = e.target as Konva.Text;
                        handleTextDoubleClick(textElement, textNode);
                      }}
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
                    : ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                }
                rotateEnabled={false}
                keepRatio={selectedNodeType === 'text'}
              />
            </Layer>
          </Stage>
      </div>
    </div>
  );
});
