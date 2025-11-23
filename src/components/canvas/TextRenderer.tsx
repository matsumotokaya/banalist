import { useRef } from 'react';
import { Text } from 'react-konva';
import type Konva from 'konva';
import type { TextElement } from '../../types/template';

interface TextRendererProps {
  textElement: TextElement;
  isShiftPressed: boolean;
  onSelect: (id: string, event: Konva.KonvaEventObject<MouseEvent>) => void;
  onDoubleClick: (element: TextElement, textNode: Konva.Text) => void;
  onUpdate?: (id: string, updates: Partial<TextElement>) => void;
  nodeRef: (node: Konva.Text | null, id: string) => void;
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

export const TextRenderer = ({
  textElement,
  isShiftPressed,
  onSelect,
  onDoubleClick,
  onUpdate,
  nodeRef,
}: TextRendererProps) => {
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  return (
    <Text
      key={textElement.id}
      ref={(node) => nodeRef(node, textElement.id)}
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
      draggable={!textElement.locked}
      listening={!textElement.locked}
      onMouseDown={(e) => onSelect(textElement.id, e)}
      onDblClick={(e) => {
        const textNode = e.target as Konva.Text;
        onDoubleClick(textElement, textNode);
      }}
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
          onUpdate(textElement.id, {
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

        if (onUpdate) {
          onUpdate(textElement.id, {
            x: node.x(),
            y: node.y(),
            fontSize: Math.max(10, textElement.fontSize * scaleY),
            rotation: node.rotation(),
          });
        }
      }}
    />
  );
};
