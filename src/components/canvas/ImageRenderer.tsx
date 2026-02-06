import { useRef, useEffect, useState, memo } from 'react';
import { Image as KonvaImage } from 'react-konva';
import type Konva from 'konva';
import type { ImageElement } from '../../types/template';

interface ImageRendererProps {
  imageElement: ImageElement;
  isShiftPressed: boolean;
  isMultiDragging: boolean;
  isMultiSelected: boolean;
  onSelect: (id: string, event: Konva.KonvaEventObject<MouseEvent>) => void;
  onUpdate?: (id: string, updates: Partial<ImageElement>) => void;
  onDragStart?: (id: string, event: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove?: (id: string, event: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (id: string, event: Konva.KonvaEventObject<DragEvent>) => boolean;
  nodeRef: (node: Konva.Image | null, id: string) => void;
}

const ImageRendererComponent = ({
  imageElement,
  isShiftPressed,
  isMultiDragging,
  isMultiSelected,
  onSelect,
  onUpdate,
  onDragStart,
  onDragMove,
  onDragEnd,
  nodeRef,
}: ImageRendererProps) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const lockAxisRef = useRef<'x' | 'y' | null>(null);
  const localNodeRef = useRef<Konva.Image | null>(null);

  const resolveLockAxis = (currentPos: { x: number; y: number }, startPos: { x: number; y: number }) => {
    const dx = Math.abs(currentPos.x - startPos.x);
    const dy = Math.abs(currentPos.y - startPos.y);
    if (dx === dy) return null;
    // dx >= dy means horizontal movement, so lock Y (fixed Y-axis)
    return dx >= dy ? 'y' : 'x';
  };

  const resetDragState = () => {
    dragStartPosRef.current = null;
    lockAxisRef.current = null;
  };

  useEffect(() => {
    const loadImage = async () => {
      const img = new window.Image();

      // Check if this is a Supabase Storage URL
      const isSupabaseUrl = imageElement.src.includes('supabase');

      if (isSupabaseUrl && !imageElement.src.startsWith('blob:')) {
        // If it's a Supabase URL, download it as Blob to avoid CORS issues
        try {
          // Extract bucket name and path from URL
          const url = new URL(imageElement.src);
          const pathParts = url.pathname.split('/');
          const bucketIndex = pathParts.findIndex(part => part === 'object' || part === 'public') + 1;
          const bucketName = pathParts[bucketIndex];
          const storagePath = pathParts.slice(bucketIndex + 1).join('/');

          console.log('Loading Supabase image:', { bucketName, storagePath });

          // Import supabase dynamically
          const { supabase } = await import('../../utils/supabase');
          const { data, error } = await supabase.storage.from(bucketName).download(storagePath);

          if (error) {
            console.error('Error downloading image from Supabase:', error);
            // Fallback to direct load with CORS
            img.crossOrigin = 'anonymous';
            img.src = imageElement.src;
          } else {
            // Create Blob URL
            const blobUrl = URL.createObjectURL(data);
            img.src = blobUrl;
          }
        } catch (error) {
          console.error('Error processing Supabase URL:', error);
          // Fallback to direct load with CORS
          img.crossOrigin = 'anonymous';
          img.src = imageElement.src;
        }
      } else {
        // For non-Supabase URLs or already Blob URLs, load normally
        if (!imageElement.src.startsWith('blob:')) {
          img.crossOrigin = 'anonymous';
        }
        img.src = imageElement.src;
      }

      img.onload = () => {
        setImage(img);
      };
      img.onerror = (error) => {
        console.error('Failed to load image:', imageElement.src, error);
      };
    };

    loadImage();
  }, [imageElement.src]);

  return (
    <KonvaImage
      ref={(node) => {
        localNodeRef.current = node;
        nodeRef(node, imageElement.id);
      }}
      image={image || undefined}
      x={imageElement.x}
      y={imageElement.y}
      width={imageElement.width}
      height={imageElement.height}
      rotation={imageElement.rotation || 0}
      opacity={imageElement.opacity ?? 1}
      visible={imageElement.visible ?? true}
      draggable={!imageElement.locked && (imageElement.visible ?? true)}
      listening={!imageElement.locked && (imageElement.visible ?? true)}
      onMouseDown={(e) => onSelect(imageElement.id, e)}
      onDragStart={(e) => {
        dragStartPosRef.current = { x: e.target.x(), y: e.target.y() };
        lockAxisRef.current = null;
        onDragStart?.(imageElement.id, e);
      }}
      dragBoundFunc={(pos) => {
        if (isMultiDragging || !dragStartPosRef.current) {
          return pos;
        }

        if (!isShiftPressed) {
          lockAxisRef.current = null;
          return pos;
        }

        const node = localNodeRef.current;
        const stage = node?.getStage();
        const scaleX = stage?.scaleX() ?? 1;
        const scaleY = stage?.scaleY() ?? 1;
        const unscaledPos = { x: pos.x / scaleX, y: pos.y / scaleY };
        const startPos = dragStartPosRef.current;

        if (!lockAxisRef.current) {
          lockAxisRef.current = resolveLockAxis(unscaledPos, startPos);
        }

        if (!lockAxisRef.current) {
          return pos;
        }

        const lockedPos = lockAxisRef.current === 'x'
          ? { x: startPos.x, y: unscaledPos.y }
          : { x: unscaledPos.x, y: startPos.y };
        return { x: lockedPos.x * scaleX, y: lockedPos.y * scaleY };
      }}
      onDragMove={(e) => {
        onDragMove?.(imageElement.id, e);
      }}
      onDragEnd={(e) => {
        const handled = onDragEnd?.(imageElement.id, e);
        resetDragState();
        if (!handled && onUpdate) {
          onUpdate(imageElement.id, {
            x: e.target.x(),
            y: e.target.y(),
          });
        }
      }}
      onTransformEnd={(e) => {
        // Skip when multi-selected — group Transformer handles batch update
        if (isMultiSelected) return;

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

// Memo to prevent unnecessary re-renders
export const ImageRenderer = memo(ImageRendererComponent, (prevProps, nextProps) => {
  const prevImage = prevProps.imageElement;
  const nextImage = nextProps.imageElement;

  return (
    prevImage.id === nextImage.id &&
    prevImage.src === nextImage.src &&
    prevImage.x === nextImage.x &&
    prevImage.y === nextImage.y &&
    prevImage.width === nextImage.width &&
    prevImage.height === nextImage.height &&
    prevImage.rotation === nextImage.rotation &&
    prevImage.opacity === nextImage.opacity &&
    prevImage.locked === nextImage.locked &&
    prevImage.visible === nextImage.visible &&
    prevProps.isShiftPressed === nextProps.isShiftPressed &&
    prevProps.isMultiDragging === nextProps.isMultiDragging &&
    prevProps.isMultiSelected === nextProps.isMultiSelected
  );
});
