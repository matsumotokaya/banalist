import { useRef, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import type { Template, TextElement } from '../types/template';
import type Konva from 'konva';

interface CanvasProps {
  template: Template;
  textElements: TextElement[];
  scale?: number;
}

export interface CanvasRef {
  exportImage: () => string;
}

export const Canvas = forwardRef<CanvasRef, CanvasProps>(function Canvas(
  { template, textElements, scale = 0.5 },
  ref
) {
  const stageRef = useRef<Konva.Stage>(null);

  useImperativeHandle(ref, () => ({
    exportImage: () => {
      if (!stageRef.current) return '';
      return stageRef.current.toDataURL({ pixelRatio: 1 / scale });
    },
  }));

  return (
    <div className="flex justify-center items-center bg-gray-100 p-8 rounded-lg shadow-inner">
      <div className="border-2 border-gray-300 shadow-xl">
        <Stage
          ref={stageRef}
          width={template.width * scale}
          height={template.height * scale}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            <Rect
              x={0}
              y={0}
              width={template.width}
              height={template.height}
              fill={template.backgroundColor}
            />
            {textElements.map((element) => (
              <Text
                key={element.id}
                text={element.text}
                x={element.x}
                y={element.y}
                fontSize={element.fontSize}
                fontFamily={element.fontFamily}
                fill={element.fill}
                draggable
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
});
