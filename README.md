# BANALIST

Browser-based banner design tool with template and rule-based image generation.

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: TailwindCSS
- **Canvas**: Konva.js (react-konva)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/       # React components
│   ├── Canvas.tsx           # Main canvas with Konva
│   ├── Sidebar.tsx          # Left sidebar (tools)
│   ├── Header.tsx           # Top header
│   ├── BottomBar.tsx        # Bottom bar (zoom, export)
│   ├── TextEditor.tsx       # Text input
│   ├── FontSelector.tsx     # Font picker
│   ├── ColorPicker.tsx      # Color picker
│   └── ...
├── types/            # TypeScript type definitions
│   └── template.ts          # Element types (CanvasElement, TextElement, ShapeElement)
├── templates/        # Template data
│   └── defaultTemplates.ts
├── utils/            # Utility functions
└── App.tsx           # Main app component
```

## Type System

All canvas elements are managed as a unified `CanvasElement` union type:

```typescript
type CanvasElement = TextElement | ShapeElement | ImageElement;

interface TextElement {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: number;
  strokeOnly: boolean;
}

interface ShapeElement {
  id: string;
  type: 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  shapeType: 'rectangle' | 'triangle' | 'star';
}
```

## Features

### Canvas Operations
- Add/edit text elements
- Add shapes (rectangle, triangle, star)
- Add images
- Drag and drop elements
- Resize elements (shape: free resize, text: proportional)
- Delete elements

### Multi-Selection System ✨ NEW
- **Shift + Click**: Add/remove elements to/from selection
- **Lasso Selection**: Drag on background to select multiple elements (⚠️ In Progress)
- **Multi-drag**: Move all selected elements together
- **Multi-delete**: Delete all selected elements at once
- **Layer operations**: Bring to front / Send to back for multiple elements

### Keyboard Shortcuts
- **Cmd/Ctrl + Z**: Undo
- **Cmd/Ctrl + Y**: Redo
- **Cmd/Ctrl + C**: Copy (single element)
- **Cmd/Ctrl + V**: Paste
- **Delete/Backspace**: Delete selected element(s)

### History Management
- Unified history for all element types (text + shapes + images)
- Max 50 history entries
- Full undo/redo support

### Export
- PNG export functionality

## Development Notes

### Element Management
- All elements are stored in a single `elements: CanvasElement[]` array
- Element type is determined by the `type` field (`'text'` | `'shape'` | `'image'`)
- History stack tracks all element changes uniformly

### Adding New Element Types
1. Define new interface in `src/types/template.ts` extending `BaseElement`
2. Add to `CanvasElement` union type
3. Add rendering logic in `Canvas.tsx`
4. Add creation handler in `App.tsx`

### Canvas Architecture
- `BannerEditor.tsx`: State management, keyboard shortcuts, history
- `Canvas.tsx`: Konva rendering, element selection, transformers
- `Sidebar.tsx`: Tool palette
- `PropertyPanel.tsx`: Element property editors

### Selection System Architecture (2025-11-20)

**Completed Refactoring:**
- State changed from `selectedElementId: string | null` to `selectedElementIds: string[]`
- All handlers updated to support multi-selection
- Konva Transformer configured for multiple nodes simultaneously
- Smart click behavior: clicking already-selected element preserves multi-selection

**Implementation Details:**
- `handleElementClick()`: Distinguishes between Shift+Click (toggle) and regular click
- Multi-drag: Selected elements maintain selection during drag operations
- Keyboard shortcuts: Copy/Paste work with single element, Delete works with multiple
- PropertyPanel: Only shows properties when exactly 1 element is selected

---

## Known Issues

### Lasso Selection (In Progress)
- Selection rectangle visual appears correctly
- Coordinate system mismatch preventing element selection
- **Status**: Debugging coordinate transformation between screen and canvas space

## Future Enhancements
- **Lasso Selection**: Complete coordinate system fix
- **Multi-element resize**: Proportional resize of multiple selected elements
- **Copy/Paste multiple elements**: Extend clipboard to support multi-selection
- Image upload support
- More shape types
- Layer management
- Template system
- LLM-powered text generation
- Color palette presets
- Backend API (FastAPI)
- Authentication (Supabase)
- Alignment tools (align left/center/right, distribute evenly)
- Snap-to-grid / Smart guides
