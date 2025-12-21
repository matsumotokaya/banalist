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

  // Ensure all numeric properties are valid
  const safeX = Number.isFinite(shape.x) ? shape.x : 100;
  const safeY = Number.isFinite(shape.y) ? shape.y : 100;
  const safeWidth = Number.isFinite(shape.width) ? shape.width : 200;
  const safeHeight = Number.isFinite(shape.height) ? shape.height : 150;
  const safeRotation = Number.isFinite(shape.rotation) ? shape.rotation : 0;
  const safeOpacity = Number.isFinite(shape.opacity) ? shape.opacity : 1;

  const commonProps = {
    fill: shape.fillEnabled ? shape.fill : undefined,
    stroke: shape.strokeEnabled ? shape.stroke : undefined,
    strokeWidth: shape.strokeEnabled ? shape.strokeWidth : 0,
    rotation: safeRotation,
    opacity: safeOpacity,
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
      // Ensure width and height are valid numbers
      const safeWidth = Number.isFinite(shape.width) ? shape.width : 200;
      const safeHeight = Number.isFinite(shape.height) ? shape.height : 150;
      const safeScaleX = Number.isFinite(scaleX) ? scaleX : 1;
      const safeScaleY = Number.isFinite(scaleY) ? scaleY : 1;

      if (isCentered) {
        // For center-positioned shapes (star, circle)
        const centerX = node.x();
        const centerY = node.y();
        const newWidth = Math.max(5, safeWidth * safeScaleX);
        const newHeight = Math.max(5, safeHeight * safeScaleY);

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
          width: Math.max(5, safeWidth * safeScaleX),
          height: Math.max(5, safeHeight * safeScaleY),
          rotation: node.rotation(),
        });
      }
    }
  };

  if (shape.shapeType === 'rectangle') {
    return (
      <Rect
        key={shape.id}
        {...commonProps}
        ref={(node) => nodeRef(node, shape.id)}
        x={safeX}
        y={safeY}
        width={safeWidth}
        height={safeHeight}
        onTransformEnd={handleTransformEnd}
      />
    );
  }

  if (shape.shapeType === 'triangle') {
    return (
      <Line
        key={shape.id}
        {...commonProps}
        ref={(node) => nodeRef(node, shape.id)}
        points={[
          safeWidth / 2, 0,
          safeWidth, safeHeight,
          0, safeHeight
        ]}
        x={safeX}
        y={safeY}
        closed
        onTransformEnd={handleTransformEnd}
      />
    );
  }

  if (shape.shapeType === 'star') {
    return (
      <Star
        key={shape.id}
        {...commonProps}
        ref={(node) => nodeRef(node, shape.id)}
        x={safeX + safeWidth / 2}
        y={safeY + safeHeight / 2}
        numPoints={5}
        innerRadius={Math.min(safeWidth, safeHeight) / 4}
        outerRadius={Math.min(safeWidth, safeHeight) / 2}
        onDragEnd={(e) => {
          if (onUpdate) {
            const centerX = e.target.x();
            const centerY = e.target.y();
            onUpdate(shape.id, {
              x: centerX - safeWidth / 2,
              y: centerY - safeHeight / 2,
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
        key={shape.id}
        {...commonProps}
        ref={(node) => {
          if (node) {
            // Set width and height for Transformer compatibility
            node.width(safeWidth);
            node.height(safeHeight);
          }
          nodeRef(node, shape.id);
        }}
        x={safeX + safeWidth / 2}
        y={safeY + safeHeight / 2}
        radiusX={safeWidth / 2}
        radiusY={safeHeight / 2}
        onDragEnd={(e) => {
          if (onUpdate) {
            const centerX = e.target.x();
            const centerY = e.target.y();
            onUpdate(shape.id, {
              x: centerX - safeWidth / 2,
              y: centerY - safeHeight / 2,
            });
          }
        }}
        onTransformEnd={(e) => handleTransformEnd(e, true)}
      />
    );
  }

  if (shape.shapeType === 'heart') {
    const heartPath = `M ${safeWidth / 2} ${safeHeight * 0.3}
      C ${safeWidth / 2} ${safeHeight * 0.15}, ${safeWidth * 0.35} 0, ${safeWidth * 0.25} 0
      C ${safeWidth * 0.1} 0, 0 ${safeHeight * 0.15}, 0 ${safeHeight * 0.3}
      C 0 ${safeHeight * 0.55}, ${safeWidth / 2} ${safeHeight * 0.8}, ${safeWidth / 2} ${safeHeight}
      C ${safeWidth / 2} ${safeHeight * 0.8}, ${safeWidth} ${safeHeight * 0.55}, ${safeWidth} ${safeHeight * 0.3}
      C ${safeWidth} ${safeHeight * 0.15}, ${safeWidth * 0.9} 0, ${safeWidth * 0.75} 0
      C ${safeWidth * 0.65} 0, ${safeWidth / 2} ${safeHeight * 0.15}, ${safeWidth / 2} ${safeHeight * 0.3} Z`;

    return (
      <Path
        key={shape.id}
        {...commonProps}
        ref={(node) => nodeRef(node, shape.id)}
        data={heartPath}
        x={safeX}
        y={safeY}
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
