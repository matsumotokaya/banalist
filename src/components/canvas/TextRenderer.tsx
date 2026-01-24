import { useRef, memo } from 'react';
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

const TextRendererComponent = ({
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
      letterSpacing={textElement.letterSpacing ?? 0}
      fontStyle={textElement.fontWeight >= 700 ? 'bold' : textElement.fontWeight <= 300 ? 'lighter' : 'normal'}
      fill={textElement.fillEnabled ? textElement.fill : 'transparent'}
      stroke={textElement.strokeEnabled ? textElement.stroke : undefined}
      strokeWidth={textElement.strokeEnabled ? textElement.strokeWidth : 0}
      rotation={textElement.rotation || 0}
      opacity={textElement.opacity ?? 1}
      visible={textElement.visible ?? true}
      draggable={!textElement.locked && (textElement.visible ?? true)}
      listening={!textElement.locked && (textElement.visible ?? true)}
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

// Memo to prevent unnecessary re-renders
export const TextRenderer = memo(TextRendererComponent, (prevProps, nextProps) => {
  return (
    prevProps.textElement.id === nextProps.textElement.id &&
    prevProps.textElement.text === nextProps.textElement.text &&
    prevProps.textElement.x === nextProps.textElement.x &&
    prevProps.textElement.y === nextProps.textElement.y &&
    prevProps.textElement.fontSize === nextProps.textElement.fontSize &&
    prevProps.textElement.fontFamily === nextProps.textElement.fontFamily &&
    prevProps.textElement.letterSpacing === nextProps.textElement.letterSpacing &&
    prevProps.textElement.fontWeight === nextProps.textElement.fontWeight &&
    prevProps.textElement.fill === nextProps.textElement.fill &&
    prevProps.textElement.fillEnabled === nextProps.textElement.fillEnabled &&
    prevProps.textElement.stroke === nextProps.textElement.stroke &&
    prevProps.textElement.strokeEnabled === nextProps.textElement.strokeEnabled &&
    prevProps.textElement.strokeWidth === nextProps.textElement.strokeWidth &&
    prevProps.textElement.rotation === nextProps.textElement.rotation &&
    prevProps.textElement.visible === nextProps.textElement.visible &&
    prevProps.isShiftPressed === nextProps.isShiftPressed
  );
});
