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
- Drag and drop elements
- Resize elements (shape: free resize, text: proportional)
- Delete elements

### Keyboard Shortcuts
- **Cmd/Ctrl + Z**: Undo
- **Cmd/Ctrl + Y**: Redo
- **Cmd/Ctrl + C**: Copy
- **Cmd/Ctrl + V**: Paste
- **Delete/Backspace**: Delete selected element

### History Management
- Unified history for all element types (text + shapes)
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
- `App.tsx`: State management, keyboard shortcuts, history
- `Canvas.tsx`: Konva rendering, element selection, transformers
- `Sidebar.tsx`: Tool palette, property editors

## Planned Features (TODO)

### High Priority - Selection System Refactoring

**Current Issue:** Selection is designed for single elements only (`selectedElementId: string | null`). This limits UX significantly.

**Required Refactoring:**
1. **Multi-selection support** (Shift + Click)
   - Change state from `selectedElementId` to `selectedElementIds: string[]`
   - Update all selection handlers across codebase
   - Konva Transformer already supports multiple nodes - no library limitation
   - **Risk:** Low - requires 1-2 hours of systematic refactoring
   - **Benefit:** Enables PowerPoint/Figma-like UX

2. **Lasso Selection** (Rectangular drag selection)
   - Draw selection rectangle on canvas during drag
   - Select all elements that intersect with selection box
   - Use `Konva.Util.haveIntersection()` for collision detection
   - **Implementation:** ~1 hour after multi-selection refactoring
   - **Reference:** Common in PowerPoint, Figma, Canva

3. **Group Operations**
   - Move multiple selected elements together (already works with Konva Transformer)
   - Resize multiple elements proportionally
   - Delete multiple elements at once
   - **Implementation:** Trivial after multi-selection refactoring

**Technical Assessment:**
- ✅ Konva.js fully supports all planned features
- ✅ No performance concerns
- ✅ No future technical debt
- ⚠️ Requires state management refactoring (breaking change internally, but no API changes)

**Decision:** Refactoring is **strongly recommended** before adding more features to avoid compound technical debt.

---

## Future Enhancements
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
