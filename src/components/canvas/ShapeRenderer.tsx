import { useRef, memo } from 'react';
import { Rect, Line, Star, Circle, Path } from 'react-konva';
import type Konva from 'konva';
import type { ShapeElement } from '../../types/template';

interface ShapeRendererProps {
  shape: ShapeElement;
  isShiftPressed: boolean;
  onSelect: (id: string, event: Konva.KonvaEventObject<MouseEvent>) => void;
  onUpdate?: (id: string, updates: Partial<ShapeElement>) => void;
  nodeRef: (node: Konva.Node | null, id: string) => void;
}

// Constrain drag to horizontal or vertical when Shift is pressed
const constrainedDragBound = (pos: { x: number; y: number }, startPos: { x: number; y: number }): { x: number; y: number } => {
  const dx = Math.abs(pos.x - startPos.x);
  const dy = Math.abs(pos.y - startPos.y);

  if (dx > dy) {
    return { x: pos.x, y: startPos.y };
  } else {
    return { x: startPos.x, y: pos.y };
  }
};

const ShapeRendererComponent = ({ shape, isShiftPressed, onSelect, onUpdate, nodeRef }: ShapeRendererProps) => {
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const commonProps = {
    key: shape.id,
    fill: shape.fillEnabled ? shape.fill : undefined,
    stroke: shape.strokeEnabled ? shape.stroke : undefined,
    strokeWidth: shape.strokeEnabled ? shape.strokeWidth : 0,
    rotation: shape.rotation || 0,
    opacity: shape.opacity ?? 1,
    draggable: !shape.locked,
    listening: !shape.locked,
    onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => onSelect(shape.id, e),
    onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => {
      dragStartPosRef.current = { x: e.target.x(), y: e.target.y() };
    },
    dragBoundFunc: (pos: { x: number; y: number }) => {
      if (dragStartPosRef.current && isShiftPressed) {
        return constrainedDragBound(pos, dragStartPosRef.current);
      }
      return pos;
    },
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      if (onUpdate) {
        onUpdate(shape.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      }
    },
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>, isCentered: boolean = false) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    if (onUpdate) {
      if (isCentered) {
        // For center-positioned shapes (star, circle)
        const centerX = node.x();
        const centerY = node.y();
        const newWidth = Math.max(5, shape.width * scaleX);
        const newHeight = Math.max(5, shape.height * scaleY);

        onUpdate(shape.id, {
          x: centerX - newWidth / 2,
          y: centerY - newHeight / 2,
          width: newWidth,
          height: newHeight,
          rotation: node.rotation(),
        });
      } else {
        // For corner-positioned shapes (rectangle, triangle, heart)
        onUpdate(shape.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(5, shape.width * scaleX),
          height: Math.max(5, shape.height * scaleY),
          rotation: node.rotation(),
        });
      }
    }
  };

  if (shape.shapeType === 'rectangle') {
    return (
      <Rect
        {...commonProps}
        ref={(node) => nodeRef(node, shape.id)}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        onTransformEnd={handleTransformEnd}
      />
    );
  }

  if (shape.shapeType === 'triangle') {
    return (
      <Line
        {...commonProps}
        ref={(node) => nodeRef(node, shape.id)}
        points={[
          shape.width / 2, 0,
          shape.width, shape.height,
          0, shape.height
        ]}
        x={shape.x}
        y={shape.y}
        closed
        onTransformEnd={handleTransformEnd}
      />
    );
  }

  if (shape.shapeType === 'star') {
    return (
      <Star
        {...commonProps}
        ref={(node) => nodeRef(node, shape.id)}
        x={shape.x + shape.width / 2}
        y={shape.y + shape.height / 2}
        numPoints={5}
        innerRadius={Math.min(shape.width, shape.height) / 4}
        outerRadius={Math.min(shape.width, shape.height) / 2}
        onDragEnd={(e) => {
          if (onUpdate) {
            const centerX = e.target.x();
            const centerY = e.target.y();
            onUpdate(shape.id, {
              x: centerX - shape.width / 2,
              y: centerY - shape.height / 2,
            });
          }
        }}
        onTransformEnd={(e) => handleTransformEnd(e, true)}
      />
    );
  }

  if (shape.shapeType === 'circle') {
    return (
      <Circle
        {...commonProps}
        ref={(node) => nodeRef(node, shape.id)}
        x={shape.x + shape.width / 2}
        y={shape.y + shape.height / 2}
        radiusX={shape.width / 2}
        radiusY={shape.height / 2}
        onDragEnd={(e) => {
          if (onUpdate) {
            const centerX = e.target.x();
            const centerY = e.target.y();
            onUpdate(shape.id, {
              x: centerX - shape.width / 2,
              y: centerY - shape.height / 2,
            });
          }
        }}
        onTransformEnd={(e) => handleTransformEnd(e, true)}
      />
    );
  }

  if (shape.shapeType === 'heart') {
    const heartPath = `M ${shape.width / 2} ${shape.height * 0.3}
      C ${shape.width / 2} ${shape.height * 0.15}, ${shape.width * 0.35} 0, ${shape.width * 0.25} 0
      C ${shape.width * 0.1} 0, 0 ${shape.height * 0.15}, 0 ${shape.height * 0.3}
      C 0 ${shape.height * 0.55}, ${shape.width / 2} ${shape.height * 0.8}, ${shape.width / 2} ${shape.height}
      C ${shape.width / 2} ${shape.height * 0.8}, ${shape.width} ${shape.height * 0.55}, ${shape.width} ${shape.height * 0.3}
      C ${shape.width} ${shape.height * 0.15}, ${shape.width * 0.9} 0, ${shape.width * 0.75} 0
      C ${shape.width * 0.65} 0, ${shape.width / 2} ${shape.height * 0.15}, ${shape.width / 2} ${shape.height * 0.3} Z`;

    return (
      <Path
        {...commonProps}
        ref={(node) => nodeRef(node, shape.id)}
        data={heartPath}
        x={shape.x}
        y={shape.y}
        onTransformEnd={handleTransformEnd}
      />
    );
  }

  return null;
};

// Memo to prevent unnecessary re-renders
export const ShapeRenderer = memo(ShapeRendererComponent, (prevProps, nextProps) => {
  const prevShape = prevProps.shape;
  const nextShape = nextProps.shape;

  return (
    prevShape.id === nextShape.id &&
    prevShape.x === nextShape.x &&
    prevShape.y === nextShape.y &&
    prevShape.width === nextShape.width &&
    prevShape.height === nextShape.height &&
    prevShape.fill === nextShape.fill &&
    prevShape.fillEnabled === nextShape.fillEnabled &&
    prevShape.stroke === nextShape.stroke &&
    prevShape.strokeEnabled === nextShape.strokeEnabled &&
    prevShape.strokeWidth === nextShape.strokeWidth &&
    prevShape.rotation === nextShape.rotation &&
    prevShape.opacity === nextShape.opacity &&
    prevShape.locked === nextShape.locked &&
    prevShape.shapeType === nextShape.shapeType &&
    prevProps.isShiftPressed === nextProps.isShiftPressed
  );
});
