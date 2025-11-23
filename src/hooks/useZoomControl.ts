import { useState, useEffect, useRef, RefObject } from 'react';

interface UseZoomControlProps {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  containerRef: RefObject<HTMLDivElement>;
}

export const useZoomControl = ({
  initialZoom = 40,
  minZoom = 25,
  maxZoom = 200,
  containerRef,
}: UseZoomControlProps) => {
  const [zoom, setZoom] = useState<number>(initialZoom);
  const lastTouchDistance = useRef<number | null>(null);
  const lastGestureScale = useRef<number>(1);

  useEffect(() => {
    const mainElement = containerRef.current;
    if (!mainElement) return;

    // Handle pinch zoom (mobile/trackpad)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        lastTouchDistance.current = distance;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastTouchDistance.current !== null) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        const delta = distance - lastTouchDistance.current;
        const zoomDelta = delta * 0.1;
        const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + zoomDelta));
        setZoom(Math.round(newZoom));

        lastTouchDistance.current = distance;
      }
    };

    const handleTouchEnd = () => {
      lastTouchDistance.current = null;
    };

    // Handle wheel zoom (Ctrl/Cmd + scroll on Mac/PC)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.5;
        const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));
        setZoom(Math.round(newZoom));
      }
    };

    // Safari-specific gesture events for trackpad pinch
    const handleGestureStart = (e: any) => {
      e.preventDefault();
      lastGestureScale.current = 1;
    };

    const handleGestureChange = (e: any) => {
      e.preventDefault();
      const scale = e.scale;
      const delta = (scale - lastGestureScale.current) * 100;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));
      setZoom(Math.round(newZoom));
      lastGestureScale.current = scale;
    };

    const handleGestureEnd = (e: any) => {
      e.preventDefault();
      lastGestureScale.current = 1;
    };

    mainElement.addEventListener('touchstart', handleTouchStart);
    mainElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    mainElement.addEventListener('touchend', handleTouchEnd);
    mainElement.addEventListener('wheel', handleWheel, { passive: false });

    // Safari gesture events
    mainElement.addEventListener('gesturestart', handleGestureStart, { passive: false } as any);
    mainElement.addEventListener('gesturechange', handleGestureChange, { passive: false } as any);
    mainElement.addEventListener('gestureend', handleGestureEnd, { passive: false } as any);

    return () => {
      mainElement.removeEventListener('touchstart', handleTouchStart);
      mainElement.removeEventListener('touchmove', handleTouchMove);
      mainElement.removeEventListener('touchend', handleTouchEnd);
      mainElement.removeEventListener('wheel', handleWheel);
      mainElement.removeEventListener('gesturestart', handleGestureStart as any);
      mainElement.removeEventListener('gesturechange', handleGestureChange as any);
      mainElement.removeEventListener('gestureend', handleGestureEnd as any);
    };
  }, [zoom, minZoom, maxZoom, containerRef]);

  return { zoom, setZoom };
};
