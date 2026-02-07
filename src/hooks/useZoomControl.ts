import { useState, useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';

interface UseZoomControlProps {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  containerRef: RefObject<HTMLDivElement | null>;
}

export const useZoomControl = ({
  initialZoom = 40,
  minZoom = 25,
  maxZoom = 200,
  containerRef,
}: UseZoomControlProps) => {
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);
  const lastGestureScale = useRef<number>(1);

  const resetView = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
    setZoom(initialZoom);
  }, [initialZoom]);

  // Document-level: block browser zoom AND handle pinch-to-zoom
  // Runs immediately on mount (no containerRef dependency) so it works
  // even during loading state before the canvas element is rendered.
  useEffect(() => {
    const clampZoom = (value: number) => Math.round(Math.max(minZoom, Math.min(maxZoom, value)));

    // Trackpad pinch on Chrome/Firefox fires as ctrlKey + wheel
    const handleDocumentWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.5;
        setZoom(prev => clampZoom(prev + delta));
      }
    };

    // Safari gesture events
    const handleGestureStart = (e: any) => {
      e.preventDefault();
      lastGestureScale.current = 1;
    };

    const handleGestureChange = (e: any) => {
      e.preventDefault();
      const scale = e.scale;
      const delta = (scale - lastGestureScale.current) * 100;
      setZoom(prev => clampZoom(prev + delta));
      lastGestureScale.current = scale;
    };

    const handleGestureEnd = (e: any) => {
      e.preventDefault();
      lastGestureScale.current = 1;
    };

    document.addEventListener('wheel', handleDocumentWheel, { passive: false });
    document.addEventListener('gesturestart', handleGestureStart, { passive: false } as any);
    document.addEventListener('gesturechange', handleGestureChange, { passive: false } as any);
    document.addEventListener('gestureend', handleGestureEnd, { passive: false } as any);

    return () => {
      document.removeEventListener('wheel', handleDocumentWheel);
      document.removeEventListener('gesturestart', handleGestureStart as any);
      document.removeEventListener('gesturechange', handleGestureChange as any);
      document.removeEventListener('gestureend', handleGestureEnd as any);
    };
  }, [minZoom, maxZoom]);

  // Container-level: scroll pan + mobile touch pinch
  useEffect(() => {
    const mainElement = containerRef.current;
    if (!mainElement) return;

    const clampZoom = (value: number) => Math.round(Math.max(minZoom, Math.min(maxZoom, value)));

    // Mobile two-finger pinch
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
        setZoom(prev => clampZoom(prev + zoomDelta));

        lastTouchDistance.current = distance;
      }
    };

    const handleTouchEnd = () => {
      lastTouchDistance.current = null;
    };

    // Regular scroll (no Ctrl/Cmd) = pan
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setPanOffset(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    mainElement.addEventListener('touchstart', handleTouchStart);
    mainElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    mainElement.addEventListener('touchend', handleTouchEnd);
    mainElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      mainElement.removeEventListener('touchstart', handleTouchStart);
      mainElement.removeEventListener('touchmove', handleTouchMove);
      mainElement.removeEventListener('touchend', handleTouchEnd);
      mainElement.removeEventListener('wheel', handleWheel);
    };
  }, [minZoom, maxZoom, containerRef]);

  return { zoom, setZoom, panOffset, setPanOffset, resetView };
};
