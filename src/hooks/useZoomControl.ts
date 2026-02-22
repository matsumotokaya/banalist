import { useState, useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';

interface UseZoomControlProps {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  containerRef: RefObject<HTMLDivElement | null>;
  panMode?: boolean;
}

export const useZoomControl = ({
  initialZoom = 40,
  minZoom = 25,
  maxZoom = 200,
  containerRef,
  panMode = false,
}: UseZoomControlProps) => {
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);
  const lastGestureScale = useRef<number>(1);
  // Use ref for panMode to avoid re-attaching event listeners on every toggle
  const panModeRef = useRef(panMode);
  useEffect(() => { panModeRef.current = panMode; }, [panMode]);

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
    let rafId: number | null = null;
    let pendingZoomDelta = 0;

    // Apply accumulated zoom via rAF to prevent render storms
    const flushZoom = () => {
      if (pendingZoomDelta !== 0) {
        const delta = pendingZoomDelta;
        pendingZoomDelta = 0;
        setZoom(prev => clampZoom(prev + delta));
      }
      rafId = null;
    };

    // Mobile two-finger pinch (only in panMode)
    const handleTouchStart = (e: TouchEvent) => {
      if (!panModeRef.current) return;
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
      if (!panModeRef.current) return;
      if (e.touches.length === 2 && lastTouchDistance.current !== null) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        const delta = distance - lastTouchDistance.current;
        pendingZoomDelta += delta * 0.1;
        lastTouchDistance.current = distance;

        // Batch zoom updates via rAF
        if (rafId === null) {
          rafId = requestAnimationFrame(flushZoom);
        }
      }
    };

    const handleTouchEnd = () => {
      lastTouchDistance.current = null;
      // Flush any remaining zoom delta
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (pendingZoomDelta !== 0) {
        const delta = pendingZoomDelta;
        pendingZoomDelta = 0;
        setZoom(prev => clampZoom(prev + delta));
      }
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
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [minZoom, maxZoom, containerRef]);

  return { zoom, setZoom, panOffset, setPanOffset, resetView };
};
