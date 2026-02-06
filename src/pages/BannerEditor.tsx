import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { PropertyPanel } from '../components/PropertyPanel';
import { BottomBar } from '../components/BottomBar';
import { Canvas, type CanvasRef } from '../components/Canvas';
import { UpgradeModal } from '../components/UpgradeModal';
import { SaveAsTemplateModal } from '../components/SaveAsTemplateModal';
import { useBanner, useBatchSaveBanner, useUpdateBanner, useUpdateBannerName } from '../hooks/useBanners';
import type { Banner, Template, CanvasElement, TextElement, ShapeElement, ImageElement } from '../types/template';
import { useHistory } from '../hooks/useHistory';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useZoomControl } from '../hooks/useZoomControl';
import { useElementOperations } from '../hooks/useElementOperations';
import { useAuth } from '../contexts/AuthContext';
import { isDataUrlImage, uploadDataUrlToBucket, uploadFileToBucket } from '../utils/storage';
import { templateStorage } from '../utils/templateStorage';

export const BannerEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSaveAsTemplateModal, setShowSaveAsTemplateModal] = useState(false);
  const isGuest = !id;
  const guestStorageKey = 'banalist_guest_banner';

  const [guestTemplate, setGuestTemplate] = useState<Template | null>(null);
  const [guestName, setGuestName] = useState<string>('');
  const [guestUpdatedAt, setGuestUpdatedAt] = useState<string>(new Date().toISOString());

  // React Query hooks
  const { data: bannerData, isLoading } = useBanner(id);
  const batchSave = useBatchSaveBanner(id || '');
  const updateBanner = useUpdateBanner(id || '');
  const updateName = useUpdateBannerName(id || '');

  // Local state for editing (not persisted immediately)
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [canvasColor, setCanvasColor] = useState<string>('#FFFFFF');
  const [selectedFont, setSelectedFont] = useState<string>('Arial');
  const [selectedSize, setSelectedSize] = useState<number>(80);
  const [selectedWeight, setSelectedWeight] = useState<number>(400);
  const [selectedLetterSpacing, setSelectedLetterSpacing] = useState<number>(0);
  const [selectedLineHeight, setSelectedLineHeight] = useState<number>(1);
  const [selectedTextColor, setSelectedTextColor] = useState<string>('#000000');
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [copiedElements, setCopiedElements] = useState<CanvasElement[]>([]);
  const canvasRef = useRef<CanvasRef>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const guestCreatedAtRef = useRef<string>(new Date().toISOString());
  const guestMountedRef = useRef(false);
  const prevGuestElementsRef = useRef<string>('');
  const prevGuestCanvasColorRef = useRef<string>('');

  // Track current banner ID to detect banner switches
  const [currentBannerId, setCurrentBannerId] = useState<string | null>(null);

  // Track previous values to detect actual changes
  const prevElementsRef = useRef<string>('');
  const prevCanvasColorRef = useRef<string>('');
  const isMountedRef = useRef(false);

  // Custom hooks
  const { resetHistory, saveToHistory, undo, redo } = useHistory();
  const getInitialZoom = () => {
    const isMobile = window.innerWidth < 768;
    return isMobile ? 30 : 40;
  };
  const { zoom, setZoom } = useZoomControl({
    initialZoom: getInitialZoom(),
    containerRef: mainRef,
  });
  const elementOps = useElementOperations({
    setElements,
    saveToHistory,
  });

  const guestState = location.state as {
    template: Template;
    elements: CanvasElement[];
    canvasColor: string;
    name: string;
    templateId?: string;
  } | null;

  const guestBanner: Banner | null = isGuest && (guestTemplate || guestState?.template) ? {
    id: 'guest',
    name: guestName || guestState?.name || 'Guest Banner',
    createdAt: guestCreatedAtRef.current,
    updatedAt: guestUpdatedAt,
    template: guestTemplate || guestState?.template!,
    elements,
    canvasColor,
  } : null;

  const banner = isGuest ? guestBanner : bannerData;

  useEffect(() => {
    if (!isGuest) return;

    if (guestState) {
      setGuestTemplate(guestState.template);
      setGuestName(guestState.name);
      setElements(guestState.elements || []);
      setCanvasColor(guestState.canvasColor || '#FFFFFF');
      resetHistory(guestState.elements || []);
      return;
    }

    try {
      const stored = localStorage.getItem(guestStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          name: string;
          template: Template;
          elements: CanvasElement[];
          canvasColor: string;
          updatedAt?: string;
          createdAt?: string;
        };
        setGuestTemplate(parsed.template);
        setGuestName(parsed.name);
        setElements(parsed.elements || []);
        setCanvasColor(parsed.canvasColor || '#FFFFFF');
        resetHistory(parsed.elements || []);
        if (parsed.createdAt) {
          guestCreatedAtRef.current = parsed.createdAt;
        }
        if (parsed.updatedAt) {
          setGuestUpdatedAt(parsed.updatedAt);
        }
        return;
      }
    } catch (error) {
      console.warn('[BannerEditor] Failed to load guest banner from localStorage:', error);
    }

    navigate('/');
  }, [isGuest, guestState, navigate]);

  // Initialize local state from React Query data ONLY when banner changes
  useEffect(() => {
    if (isGuest) return;
    console.log('[BannerEditor] useEffect triggered. Banner:', banner?.id, 'CurrentBannerId:', currentBannerId);

    if (!banner) {
      if (!isLoading && !id) {
        navigate('/mydesign');
      }
      return;
    }

    const templatePlanType = banner.template?.planType || 'free';
    if (templatePlanType === 'premium') {
      if (!profile || profile.subscriptionTier === 'free') {
        setShowUpgradeModal(true);
        return;
      }
    }

    // Only load from DB when opening a different banner
    if (banner.id !== currentBannerId) {
      console.log('[BannerEditor] Loading NEW banner from DB:', banner.id);
      console.log('[BannerEditor] Previous bannerId:', currentBannerId);
      console.log('[BannerEditor] Banner elements from DB:', banner.elements.length, 'elements');
      setCurrentBannerId(banner.id);

      // Migrate existing shapes and text to new fill/stroke structure
      const migratedElements = banner.elements.map((el) => {
        if (el.type === 'shape') {
          const shape = el as ShapeElement;
          return {
            ...shape,
            fillEnabled: shape.fillEnabled !== undefined ? shape.fillEnabled : true,
            stroke: shape.stroke || '#000000',
            strokeWidth: shape.strokeWidth || 2,
            strokeEnabled: shape.strokeEnabled !== undefined ? shape.strokeEnabled : false,
            visible: shape.visible ?? true,
          } as ShapeElement;
        }
        if (el.type === 'text') {
          const text = el as TextElement;
          // Migrate old strokeOnly property to new structure
          const strokeOnly = (text as any).strokeOnly;
          return {
            ...text,
            fillEnabled: text.fillEnabled !== undefined ? text.fillEnabled : (strokeOnly === undefined ? true : !strokeOnly),
            stroke: text.stroke || text.fill || '#000000',
            strokeWidth: text.strokeWidth || Math.max(text.fontSize * 0.03, 2),
            strokeEnabled: text.strokeEnabled !== undefined ? text.strokeEnabled : (strokeOnly || false),
            letterSpacing: text.letterSpacing ?? 0,
            visible: text.visible ?? true,
          } as TextElement;
        }
        if (el.type === 'image') {
          const image = el as ImageElement;
          return {
            ...image,
            visible: image.visible ?? true,
          } as ImageElement;
        }
        return el;
      });

      console.log('[BannerEditor] Setting elements to:', migratedElements);
      setElements(migratedElements);
      setCanvasColor(banner.canvasColor);
      resetHistory(migratedElements);

      // If new banner with no elements, add default text and save to DB immediately
      if (migratedElements.length === 0) {
        console.log('[BannerEditor] Banner is empty, adding default text and saving to DB');
        const defaultText: TextElement = {
          id: `text-${Date.now()}-${Math.random()}`, // Unique ID with random component
          type: 'text',
          text: 'BANALISTでバナーをつくろう。',
          x: banner.template.width / 2 - 550,
          y: banner.template.height / 2 - 40,
          fontSize: 80,
          fontFamily: 'Arial',
          letterSpacing: 0,
          fill: '#000000',
          fillEnabled: true,
          stroke: '#000000',
          strokeWidth: 2,
          strokeEnabled: false,
          fontWeight: 400,
          visible: true,
        };
        const newElements = [defaultText];
        setElements(newElements);
        resetHistory(newElements);

        // Save default text to DB immediately to maintain consistency
        batchSave.mutateAsync({
          elements: newElements,
          canvasColor: banner.canvasColor,
        }).then(() => {
          console.log('[BannerEditor] Default text saved to DB');
          setHasUnsavedChanges(false); // Already saved
        }).catch((error) => {
          console.error('[BannerEditor] Failed to save default text to DB:', error);
          setHasUnsavedChanges(true); // Mark as unsaved if save fails
        });
      }
    } else {
      console.log('[BannerEditor] Same banner, keeping local state. BannerID:', banner.id);
      // Don't log elements.length here to avoid dependency issues
    }
    // If same banner, keep local state (don't overwrite with DB)
    // Note: elements is NOT in dependency array to avoid loops
  }, [banner?.id, banner?.template, isLoading, id, navigate, profile, currentBannerId, isGuest]);

  // Track if there are unsaved changes and save status
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [lastSaveError, setLastSaveError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Core save function
  const performSave = async (generateThumbnail = false) => {
    if (isGuest) {
      if (!guestTemplate && !guestState?.template) return;
      setSaveStatus('saving');
      setLastSaveError(null);
      try {
        let thumbnailDataURL: string | undefined;
        if (generateThumbnail && canvasRef.current && elements.length > 0) {
          console.log('[BannerEditor Guest] Generating thumbnail...');
          await new Promise(resolve => setTimeout(resolve, 100));
          thumbnailDataURL = canvasRef.current.exportThumbnail();
          console.log('[BannerEditor Guest] Thumbnail generated:', thumbnailDataURL ? `${thumbnailDataURL.substring(0, 50)}... (length: ${thumbnailDataURL.length})` : 'NONE');
        } else {
          console.log('[BannerEditor Guest] Skipping thumbnail generation - generateThumbnail:', generateThumbnail, 'hasCanvas:', !!canvasRef.current, 'elementsCount:', elements.length);
        }

        const updatedAt = new Date().toISOString();
        const snapshot = {
          name: guestName || guestState?.name || 'Guest Banner',
          template: guestTemplate || guestState?.template,
          elements,
          canvasColor,
          updatedAt,
          createdAt: guestCreatedAtRef.current,
          thumbnailUrl: thumbnailDataURL,
        };
        console.log('[BannerEditor Guest] Saving to localStorage with thumbnail:', !!thumbnailDataURL);
        localStorage.setItem(guestStorageKey, JSON.stringify(snapshot));
        setGuestUpdatedAt(updatedAt);
        setHasUnsavedChanges(false);
        setSaveStatus('saved');
        console.log('[BannerEditor Guest] Save complete');
      } catch (error) {
        console.error('[BannerEditor] Guest save failed:', error);
        setSaveStatus('error');
        setLastSaveError(error instanceof Error ? error.message : '保存に失敗しました');
      }
      return;
    }
    if (!banner || !id) return;

    console.log('[BannerEditor] Saving... Elements:', elements.length, 'Banner ID:', banner.id);
    setSaveStatus('saving');
    setLastSaveError(null);

    try {
      let thumbnailDataURL: string | undefined;

      // Only generate thumbnail for manual saves or periodically
      if (generateThumbnail && canvasRef.current && elements.length > 0) {
        console.log('[BannerEditor] 🎨 GENERATING THUMBNAIL (JPEG 400px)...');
        await new Promise(resolve => setTimeout(resolve, 100));
        thumbnailDataURL = canvasRef.current.exportThumbnail();
        console.log('[BannerEditor] 🎨 Thumbnail generated, length:', thumbnailDataURL?.length || 0);
      } else {
        console.log('[BannerEditor] ⏭️  SKIPPING thumbnail generation (generateThumbnail:', generateThumbnail, ', hasCanvas:', !!canvasRef.current, ', elementsCount:', elements.length, ')');
      }

      // Save to database
      console.log('[BannerEditor] Calling batchSave with', elements.length, 'elements, hasThumbnail:', !!thumbnailDataURL);
      await batchSave.mutateAsync({
        elements,
        canvasColor,
        thumbnailDataURL,
      });

      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      console.log('[BannerEditor] ✅ Save successful (with thumbnail:', !!thumbnailDataURL, ')');
    } catch (error) {
      console.error('[BannerEditor] Save failed:', error);
      setSaveStatus('error');
      setLastSaveError(error instanceof Error ? error.message : '保存に失敗しました');
      // Don't show alert for auto-save failures, just show in status indicator
    }
  };

  // Debounced auto-save (3 seconds after last change for better performance)
  const debouncedSave = useMemo(
    () => debounce(() => {
      performSave(false); // No thumbnail for auto-saves
    }, 3000), // Increased from 2000ms to 3000ms
    [elements, canvasColor, banner, id, isGuest]
  );

  const debouncedGuestSave = useMemo(
    () => debounce(() => {
      performSave(false);
    }, 1000),
    [elements, canvasColor, guestName, guestTemplate, isGuest]
  );

  // Immediate save for important actions
  const immediateSave = useCallback(async () => {
    debouncedSave.cancel();
    debouncedGuestSave.cancel();
    await performSave(false); // No thumbnail for immediate saves to improve performance
  }, [elements, canvasColor, banner, id, isGuest, debouncedGuestSave, performSave]);

  // Mark as dirty and trigger auto-save when elements actually change
  useEffect(() => {
    if (isGuest) return;
    const currentElementsStr = JSON.stringify(elements);

    // Skip on initial mount
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      prevElementsRef.current = currentElementsStr;
      return;
    }

    // Only save if elements actually changed
    if (currentElementsStr !== prevElementsRef.current && banner && currentBannerId === banner.id) {
      console.log('[BannerEditor] Elements actually changed, triggering auto-save');
      prevElementsRef.current = currentElementsStr;
      setHasUnsavedChanges(true);
      setSaveStatus('unsaved');
      debouncedSave();
    }

    return () => {
      debouncedSave.cancel();
    };
  }, [elements, banner, currentBannerId, debouncedSave, isGuest]);

  useEffect(() => {
    if (!isGuest) return;
    const currentElementsStr = JSON.stringify(elements);

    if (!guestMountedRef.current) {
      guestMountedRef.current = true;
      prevGuestElementsRef.current = currentElementsStr;
      prevGuestCanvasColorRef.current = canvasColor;
      return;
    }

    if (currentElementsStr !== prevGuestElementsRef.current) {
      prevGuestElementsRef.current = currentElementsStr;
      setHasUnsavedChanges(true);
      setSaveStatus('unsaved');
      debouncedGuestSave();
    }
  }, [elements, canvasColor, debouncedGuestSave, isGuest]);

  // Mark as dirty and trigger auto-save when canvas color actually changes
  useEffect(() => {
    if (isGuest) return;
    if (!isMountedRef.current) return;

    if (canvasColor !== prevCanvasColorRef.current && banner && currentBannerId === banner.id) {
      console.log('[BannerEditor] Canvas color changed, triggering auto-save');
      prevCanvasColorRef.current = canvasColor;
      setHasUnsavedChanges(true);
      setSaveStatus('unsaved');
      debouncedSave();
    }
  }, [canvasColor, banner, currentBannerId, debouncedSave, isGuest]);

  useEffect(() => {
    if (!isGuest) return;
    if (!guestMountedRef.current) return;

    if (canvasColor !== prevGuestCanvasColorRef.current) {
      prevGuestCanvasColorRef.current = canvasColor;
      setHasUnsavedChanges(true);
      setSaveStatus('unsaved');
      debouncedGuestSave();
    }
  }, [canvasColor, debouncedGuestSave, isGuest]);

  // Save before leaving page (if there are unsaved changes)
  useEffect(() => {
    const handleBeforeUnload = async (_e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Cancel any pending saves
        debouncedSave.cancel();
        debouncedGuestSave.cancel();

        // Try to save synchronously (best effort)
        // Note: Modern browsers may not allow async operations in beforeunload
        performSave(false);

        // Don't show confirmation dialog since we're auto-saving
        // If save is critical, uncomment these lines:
        // e.preventDefault();
        // e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isGuest, debouncedGuestSave, debouncedSave, performSave]);



  // Manual save handler (for save button)
  const handleSave = async () => {
    await immediateSave();
  };

  // Copy (with localStorage for cross-banner support)
  const handleCopy = () => {
    if (selectedElementIds.length === 0) return;

    const elementsToCopy = elements.filter((el) => selectedElementIds.includes(el.id));
    if (elementsToCopy.length > 0) {
      const clonedElements = JSON.parse(JSON.stringify(elementsToCopy));
      setCopiedElements(clonedElements);
      // Save to localStorage for cross-banner paste
      try {
        localStorage.setItem('whatif_clipboard', JSON.stringify(clonedElements));
        console.log(`${clonedElements.length} element(s) copied to clipboard (cross-banner enabled)`);
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  };

  // Paste (with localStorage for cross-banner support)
  const handlePaste = () => {
    let elementsToPaste = copiedElements.length > 0 ? copiedElements : null;

    // Try to get from localStorage if no local copy
    if (!elementsToPaste || elementsToPaste.length === 0) {
      try {
        const stored = localStorage.getItem('whatif_clipboard');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Support both old format (single element) and new format (array)
          elementsToPaste = Array.isArray(parsed) ? parsed : [parsed];
          console.log(`${elementsToPaste.length} element(s) retrieved from cross-banner clipboard`);
        }
      } catch (error) {
        console.error('Failed to read from localStorage:', error);
      }
    }

    if (elementsToPaste && elementsToPaste.length > 0) {
      const newIds: string[] = [];
      const timestamp = Date.now();
      elementsToPaste.forEach((element, index) => {
        const newId = `${element.type}-${timestamp}-${index}`;
        const newElement: CanvasElement = {
          ...element,
          id: newId,
          x: element.x + 20,
          y: element.y + 20,
        } as CanvasElement;
        elementOps.addElement(newElement);
        newIds.push(newId);
      });
      setSelectedElementIds(newIds);
    }
  };

  // Delete
  const handleDelete = () => {
    if (selectedElementIds.length > 0) {
      elementOps.deleteElements(selectedElementIds);
      setSelectedElementIds([]);

      // Immediate save for element deletion
      immediateSave();
    }
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    const prevElements = undo();
    if (prevElements) {
      setElements(prevElements);
    }
  };

  const handleRedo = () => {
    const nextElements = redo();
    if (nextElements) {
      setElements(nextElements);
    }
  };

  // Arrow key movement handlers (Photoshop-style: 1px normal, 10px with Shift)
  const handleMoveUp = (distance: number) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) => ({
        y: el.y - distance,
      }));
    }
  };

  const handleMoveDown = (distance: number) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) => ({
        y: el.y + distance,
      }));
    }
  };

  const handleMoveLeft = (distance: number) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) => ({
        x: el.x - distance,
      }));
    }
  };

  const handleMoveRight = (distance: number) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) => ({
        x: el.x + distance,
      }));
    }
  };

  // Update selection state and sync properties for single text element
  const handleSelectElement = useCallback((ids: string[]) => {
    setSelectedElementIds(ids);
    if (ids.length === 1) {
      const element = elements.find((el) => el.id === ids[0]);
      if (element && element.type === 'text') {
        setSelectedFont(element.fontFamily);
        setSelectedSize(element.fontSize);
        setSelectedWeight(element.fontWeight);
        setSelectedLetterSpacing(element.letterSpacing ?? 0);
        setSelectedLineHeight(element.lineHeight ?? 1);
        setSelectedTextColor(element.fill);
      }
    }
  }, [elements]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onDelete: handleDelete,
    onSave: handleSave,
    onMoveUp: handleMoveUp,
    onMoveDown: handleMoveDown,
    onMoveLeft: handleMoveLeft,
    onMoveRight: handleMoveRight,
  });

  if (!banner) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#101010]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const handleAddText = (text: string) => {
    const newId = `text-${Date.now()}`;
    const newElement: TextElement = {
      id: newId,
      type: 'text',
      text,
      x: 50,
      y: 50,
      fontSize: selectedSize,
      fontFamily: selectedFont,
      letterSpacing: selectedLetterSpacing,
      lineHeight: selectedLineHeight,
      fill: selectedTextColor,
      fillEnabled: true,
      stroke: '#000000',
      strokeWidth: 2,
      strokeEnabled: false,
      fontWeight: selectedWeight,
      visible: true,
    };
    elementOps.addElement(newElement);
    setSelectedElementIds([newId]);

    // Immediate save for element addition
    immediateSave();
  };

  const handleAddShape = (shapeType: 'rectangle' | 'triangle' | 'star' | 'circle' | 'heart') => {
    const newId = `shape-${Date.now()}`;
    const newShape: ShapeElement = {
      id: newId,
      type: 'shape',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      fill: '#000000',
      fillEnabled: true,
      stroke: '#000000',
      strokeWidth: 2,
      strokeEnabled: false,
      shapeType,
      visible: true,
    };
    elementOps.addElement(newShape);
    setSelectedElementIds([newId]);

    // Immediate save for element addition
    immediateSave();
  };

  const handleAddImage = async (src: string, width: number, height: number) => {
    const newId = `image-${Date.now()}-${Math.random()}`;
    let finalSrc = src;

    if (isDataUrlImage(src)) {
      if (!user) {
        alert('画像を追加するにはログインが必要です。');
        return;
      }
      try {
        const fileBase = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}`;
        finalSrc = await uploadDataUrlToBucket(src, 'user-images', fileBase);
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('画像のアップロードに失敗しました。');
        return;
      }
    }

    setElements(prevElements => {
      const newImage: ImageElement = {
        id: newId,
        type: 'image',
        x: 0,
        y: 0,
        src: finalSrc,
        width,
        height,
        visible: true,
      };

      const newElements = [...prevElements, newImage];
      // Save to history after state update
      setTimeout(() => saveToHistory(newElements), 0);
      return newElements;
    });

    setSelectedElementIds([newId]);

    // Immediate save for image addition
    immediateSave();
  };

  const handleImageDrop = async (file: File, x: number, y: number, width: number, height: number) => {
    const newId = `image-${Date.now()}-${Math.random()}`;
    if (!user) {
      alert('画像を追加するにはログインが必要です。');
      return;
    }

    let publicUrl = '';
    try {
      const fileBase = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}`;
      publicUrl = await uploadFileToBucket(file, 'user-images', fileBase);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('画像のアップロードに失敗しました。');
      return;
    }

    setElements(prevElements => {
      const newImage: ImageElement = {
        id: newId,
        type: 'image',
        x,
        y,
        src: publicUrl,
        width,
        height,
        visible: true,
      };

      const newElements = [...prevElements, newImage];
      // Save to history after state update
      setTimeout(() => saveToHistory(newElements), 0);
      return newElements;
    });

    setSelectedElementIds([newId]);

    // Immediate save for image drop
    immediateSave();
  };

  const handleTextChange = (id: string, newText: string) => {
    elementOps.updateElement(id, { text: newText });
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        el.type === 'text' ? { fontFamily: font } : {}
      );
    }
  };

  const handleSizeChange = (size: number) => {
    setSelectedSize(size);
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        el.type === 'text' ? { fontSize: size } : {}
      );
    }
  };

  const handleWeightChange = (weight: number) => {
    setSelectedWeight(weight);
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        el.type === 'text' ? { fontWeight: weight } : {}
      );
    }
  };

  const handleLetterSpacingChange = (letterSpacing: number) => {
    setSelectedLetterSpacing(letterSpacing);
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        el.type === 'text' ? { letterSpacing } : {}
      );
    }
  };

  const handleLineHeightChange = (lineHeight: number) => {
    setSelectedLineHeight(lineHeight);
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        el.type === 'text' ? { lineHeight } : {}
      );
    }
  };

  const handlePropertyColorChange = (color: string) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        (el.type === 'text' || el.type === 'shape') ? { fill: color } : {}
      );

      // Update text color state if single text element is selected
      if (selectedElementIds.length === 1) {
        const selectedElement = elements.find((el) => el.id === selectedElementIds[0]);
        if (selectedElement && selectedElement.type === 'text') {
          setSelectedTextColor(color);
        }
      }
    }
  };

  const handleOpacityChange = (opacity: number) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, () => ({ opacity }));
    }
  };

  const handleBringToFront = () => {
    elementOps.bringToFront(selectedElementIds);
  };

  const handleSendToBack = () => {
    elementOps.sendToBack(selectedElementIds);
  };

  const handleElementUpdate = (id: string, updates: Partial<CanvasElement>) => {
    elementOps.updateElement(id, updates);
  };

  const handleElementsUpdate = (ids: string[], updateFn: (element: CanvasElement) => Partial<CanvasElement>) => {
    elementOps.updateElements(ids, updateFn);
  };

  const handleToggleLock = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      elementOps.updateElement(id, { locked: !element.locked });
    }
  };

  const handleToggleVisibility = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    const nextVisible = !(element.visible ?? true);
    elementOps.updateElement(id, { visible: nextVisible });
    if (!nextVisible) {
      setSelectedElementIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  // Shape fill/stroke handlers
  const handleFillEnabledChange = (enabled: boolean) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        (el.type === 'shape' || el.type === 'text') ? { fillEnabled: enabled } : {}
      );
    }
  };

  const handleStrokeChange = (color: string) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        (el.type === 'shape' || el.type === 'text') ? { stroke: color } : {}
      );
    }
  };

  const handleStrokeWidthChange = (width: number) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        (el.type === 'shape' || el.type === 'text') ? { strokeWidth: width } : {}
      );
    }
  };

  const handleStrokeEnabledChange = (enabled: boolean) => {
    if (selectedElementIds.length > 0) {
      elementOps.updateElements(selectedElementIds, (el) =>
        (el.type === 'shape' || el.type === 'text') ? { strokeEnabled: enabled } : {}
      );
    }
  };

  const handleBannerNameChange = async (newName: string) => {
    if (isGuest) return;
    await updateName.mutateAsync(newName);
  };


  const handleReorderElements = (newOrder: CanvasElement[]) => {
    elementOps.reorderElements(newOrder);
  };

  const handleCanvasSizeChange = async (width: number, height: number) => {
    if (isGuest) {
      const baseTemplate = guestTemplate || banner?.template;
      if (baseTemplate) {
        setGuestTemplate({
          ...baseTemplate,
          width,
          height,
        });
      }
      return;
    }
    if (banner) {
      const updatedTemplate: Template = {
        ...banner.template,
        width,
        height,
      };
      await updateBanner.mutateAsync({ template: updatedTemplate });
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current || !banner) return;

    try {
      // Small delay to ensure canvas is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      const dataURL = canvasRef.current.exportImage();

      if (!dataURL || dataURL.length < 100) {
        alert('画像の生成に失敗しました。もう一度お試しください。');
        console.error('Export failed: invalid data URL');
        return;
      }

      const link = document.createElement('a');
      link.download = `${banner.name}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Export successful, size:', dataURL.length);
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('画像のエクスポートに失敗しました。');
    }
  };

  const isBannerLoading = !isGuest && (isLoading || !banner);
  if (isBannerLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#101010]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }
  if (!banner) {
    return null;
  }

  const handleBackToManager = async () => {
    // Prevent multiple clicks
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      // Save any pending changes with thumbnail before navigating
      if (isGuest) {
        debouncedGuestSave.cancel();
      } else {
        debouncedSave.cancel();
      }
      await performSave(true); // Always generate thumbnail when leaving editor (both guest and logged-in)
      navigate('/mydesign');
    } catch (error) {
      console.error('[BannerEditor] Failed to save before navigating:', error);
      // Navigate anyway to avoid being stuck
      navigate('/mydesign');
    } finally {
      setIsNavigating(false);
    }
  };

  const handleSaveAsTemplate = () => {
    // Only allow admins to save as template
    if (profile?.role !== 'admin') {
      return;
    }
    setShowSaveAsTemplateModal(true);
  };

  const handleTemplateModalSave = async ({ planType, displayOrder }: { planType: 'free' | 'premium'; displayOrder: number }) => {
    try {
      // Generate thumbnail for the template
      const thumbnailDataUrl = canvasRef.current?.exportThumbnail();
      if (!thumbnailDataUrl) {
        console.error('Failed to generate thumbnail');
        return;
      }

      // Upload thumbnail to storage (same bucket as existing templates)
      const fileBase = `templates/${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const thumbnailUrl = await uploadDataUrlToBucket(thumbnailDataUrl, 'default-images', fileBase);

      // Create template
      await templateStorage.createTemplate({
        name: banner.name,
        elements: elements,
        canvasColor: canvasColor,
        thumbnailUrl: thumbnailUrl,
        planType: planType,
        displayOrder: displayOrder,
        width: banner.template.width,
        height: banner.template.height,
      });

      // モーダル側で閉じる処理とメッセージ表示を行う
    } catch (error) {
      console.error('Failed to save template:', error);
      throw error; // モーダル側で catch してエラー表示
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#101010]">
      <Header
        onBackToManager={handleBackToManager}
        bannerName={banner.name}
        bannerId={isGuest ? undefined : banner.id}
        onBannerNameChange={isGuest ? undefined : handleBannerNameChange}
        isAdmin={profile?.role === 'admin'}
        onSaveAsTemplate={handleSaveAsTemplate}
      />


      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <Sidebar
          canvasColor={canvasColor}
          canvasWidth={banner.template.width}
          canvasHeight={banner.template.height}
          onSelectColor={setCanvasColor}
          onCanvasSizeChange={handleCanvasSizeChange}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddImage={handleAddImage}
          elements={elements}
          selectedElementIds={selectedElementIds}
          onSelectElement={handleSelectElement}
          onReorderElements={handleReorderElements}
          onToggleLock={handleToggleLock}
          onToggleVisibility={handleToggleVisibility}
        />

        <main
          ref={mainRef}
          className="flex-1 overflow-auto bg-[#101010] p-8 flex items-center justify-center"
          style={{ touchAction: 'none' }}
          onClick={(e) => {
            // Deselect when clicking outside the canvas stage
            const target = e.target as HTMLElement;
            const isCanvasStage = target.tagName === 'CANVAS';
            if (!isCanvasStage) {
              handleSelectElement([]);
            }
          }}
        >
          <Canvas
              ref={canvasRef}
              template={banner.template}
              elements={elements}
              scale={zoom / 100}
              canvasColor={canvasColor}
              fileName={`${banner.name}.png`}
              onTextChange={handleTextChange}
              selectedElementIds={selectedElementIds}
              onSelectElement={handleSelectElement}
              onElementUpdate={handleElementUpdate}
              onElementsUpdate={handleElementsUpdate}
              onImageDrop={handleImageDrop}
            />
        </main>

        <PropertyPanel
          selectedElement={selectedElementIds.length === 1 ? elements.find((el) => el.id === selectedElementIds[0]) || null : null}
          onColorChange={handlePropertyColorChange}
          onFontChange={handleFontChange}
          onSizeChange={handleSizeChange}
          onWeightChange={handleWeightChange}
          onLetterSpacingChange={handleLetterSpacingChange}
          onLineHeightChange={handleLineHeightChange}
          onOpacityChange={handleOpacityChange}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onFillEnabledChange={handleFillEnabledChange}
          onStrokeChange={handleStrokeChange}
          onStrokeWidthChange={handleStrokeWidthChange}
          onStrokeEnabledChange={handleStrokeEnabledChange}
        />
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden">
        <main
          ref={mainRef}
          className="flex-1 overflow-auto bg-[#101010] p-8 flex items-center justify-center"
          style={{ touchAction: 'none' }}
          onClick={(e) => {
            // Deselect when clicking outside the canvas stage
            const target = e.target as HTMLElement;
            const isCanvasStage = target.tagName === 'CANVAS';
            if (!isCanvasStage) {
              handleSelectElement([]);
            }
          }}
        >
          <Canvas
              ref={canvasRef}
              template={banner.template}
              elements={elements}
              scale={zoom / 100}
              canvasColor={canvasColor}
              fileName={`${banner.name}.png`}
              onTextChange={handleTextChange}
              selectedElementIds={selectedElementIds}
              onSelectElement={handleSelectElement}
              onElementUpdate={handleElementUpdate}
              onElementsUpdate={handleElementsUpdate}
              onImageDrop={handleImageDrop}
            />
        </main>

        {/* Mobile Sidebar - Bottom horizontal scrollable */}
        <Sidebar
          canvasColor={canvasColor}
          canvasWidth={banner.template.width}
          canvasHeight={banner.template.height}
          onSelectColor={setCanvasColor}
          onCanvasSizeChange={handleCanvasSizeChange}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddImage={handleAddImage}
          elements={elements}
          selectedElementIds={selectedElementIds}
          onSelectElement={handleSelectElement}
          onReorderElements={handleReorderElements}
          onToggleLock={handleToggleLock}
          onToggleVisibility={handleToggleVisibility}
          isMobile={true}
        />

        {/* Mobile PropertyPanel - Modal */}
        <PropertyPanel
          selectedElement={selectedElementIds.length === 1 ? elements.find((el) => el.id === selectedElementIds[0]) || null : null}
          onColorChange={handlePropertyColorChange}
          onFontChange={handleFontChange}
          onSizeChange={handleSizeChange}
          onWeightChange={handleWeightChange}
          onLetterSpacingChange={handleLetterSpacingChange}
          onLineHeightChange={handleLineHeightChange}
          onOpacityChange={handleOpacityChange}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onFillEnabledChange={handleFillEnabledChange}
          onStrokeChange={handleStrokeChange}
          onStrokeWidthChange={handleStrokeWidthChange}
          onStrokeEnabledChange={handleStrokeEnabledChange}
          isMobile={true}
          onClose={() => handleSelectElement([])}
        />
      </div>

      <BottomBar
        zoom={zoom}
        onZoomChange={setZoom}
        onExport={handleExport}
        saveStatus={saveStatus}
        lastSaveError={lastSaveError}
        onRetry={immediateSave}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          navigate('/mydesign');
        }}
      />

      <SaveAsTemplateModal
        isOpen={showSaveAsTemplateModal}
        onClose={() => setShowSaveAsTemplateModal(false)}
        onSave={handleTemplateModalSave}
        defaultName={banner.name}
      />

      {/* Loading overlay when navigating */}
      {isNavigating && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-800">サムネイル生成中...</p>
              <p className="text-sm text-gray-500 mt-1">しばらくお待ちください</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
