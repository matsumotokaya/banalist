import { useCallback } from 'react';
import type { CanvasElement, TextElement, ShapeElement, ImageElement } from '../types/template';

interface UseElementOperationsProps {
  elements: CanvasElement[];
  setElements: (elements: CanvasElement[]) => void;
  saveToHistory: (elements: CanvasElement[]) => void;
}

export const useElementOperations = ({
  elements,
  setElements,
  saveToHistory,
}: UseElementOperationsProps) => {

  // Update a single element with partial updates
  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    const newElements = elements.map((el) => {
      if (el.id === id) {
        // Type-safe merge based on element type
        if (el.type === 'text' && updates.type === 'text') {
          return { ...el, ...updates } as TextElement;
        } else if (el.type === 'shape' && updates.type === 'shape') {
          return { ...el, ...updates } as ShapeElement;
        } else if (el.type === 'image' && updates.type === 'image') {
          return { ...el, ...updates } as ImageElement;
        } else {
          // For updates without type change
          return { ...el, ...updates } as CanvasElement;
        }
      }
      return el;
    });
    setElements(newElements);
    saveToHistory(newElements);
  }, [elements, setElements, saveToHistory]);

  // Update multiple elements (by IDs) with same property changes
  const updateElements = useCallback((
    ids: string[],
    updateFn: (element: CanvasElement) => Partial<CanvasElement>
  ) => {
    const newElements = elements.map((el) => {
      if (ids.includes(el.id)) {
        const updates = updateFn(el);
        return { ...el, ...updates } as CanvasElement;
      }
      return el;
    });
    setElements(newElements);
    saveToHistory(newElements);
  }, [elements, setElements, saveToHistory]);

  // Delete elements by IDs
  const deleteElements = useCallback((ids: string[]) => {
    const newElements = elements.filter((el) => !ids.includes(el.id));
    setElements(newElements);
    saveToHistory(newElements);
  }, [elements, setElements, saveToHistory]);

  // Add new element
  const addElement = useCallback((element: CanvasElement) => {
    const newElements = [...elements, element];
    setElements(newElements);
    saveToHistory(newElements);
  }, [elements, setElements, saveToHistory]);

  // Bring elements to front (z-index)
  const bringToFront = useCallback((ids: string[]) => {
    const selectedElements = ids
      .map(id => elements.find(el => el.id === id))
      .filter((el): el is CanvasElement => el !== undefined);

    const remainingElements = elements.filter(el => !ids.includes(el.id));
    const reordered = [...remainingElements, ...selectedElements];

    setElements(reordered);
    saveToHistory(reordered);
  }, [elements, setElements, saveToHistory]);

  // Send elements to back (z-index)
  const sendToBack = useCallback((ids: string[]) => {
    const selectedElements = ids
      .map(id => elements.find(el => el.id === id))
      .filter((el): el is CanvasElement => el !== undefined);

    const remainingElements = elements.filter(el => !ids.includes(el.id));
    const reordered = [...selectedElements, ...remainingElements];

    setElements(reordered);
    saveToHistory(reordered);
  }, [elements, setElements, saveToHistory]);

  // Reorder elements (for layer drag & drop)
  const reorderElements = useCallback((newOrder: CanvasElement[]) => {
    setElements(newOrder);
    saveToHistory(newOrder);
  }, [setElements, saveToHistory]);

  return {
    updateElement,
    updateElements,
    deleteElements,
    addElement,
    bringToFront,
    sendToBack,
    reorderElements,
  };
};
