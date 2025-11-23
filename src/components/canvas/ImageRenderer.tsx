import { useRef, useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import type Konva from 'konva';
import type { ImageElement } from '../../types/template';

interface ImageRendererProps {
  imageElement: ImageElement;
  isShiftPressed: boolean;
  onSelect: (id: string, event: Konva.KonvaEventObject<MouseEvent>) => void;
  onUpdate?: (id: string, updates: Partial<ImageElement>) => void;
  nodeRef: (node: Konva.Image | null, id: string) => void;
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

export const ImageRenderer = ({
  imageElement,
  isShiftPressed,
  onSelect,
  onUpdate,
  nodeRef,
}: ImageRendererProps) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

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
