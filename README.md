# BANALIST

Browser-based banner design tool with template and rule-based image generation.

---

## 🚧 TODO - 未解決の課題

### Shift + Drag 制約機能（直線移動）の修正が必要

**現在の問題:**
- Shiftキーを押してドラッグすると、オブジェクトがワープする
- 水平・垂直移動が正しく機能しない

**期待される仕様（Illustrator/Figma方式）:**
1. ドラッグ開始位置のX座標とY座標を保存
2. Shiftキーを押した状態でドラッグすると：
   - **水平移動**: Y軸をドラッグ開始位置に固定、X軸のみ移動可能
   - **垂直移動**: X軸をドラッグ開始位置に固定、Y軸のみ移動可能
3. 移動方向（水平/垂直）は、ドラッグ開始位置からの距離で動的に切り替え
   - `dx > dy` → 水平移動（Y軸固定）
   - `dy > dx` → 垂直移動（X軸固定）

**技術的課題:**
- Konvaの`dragBoundFunc`内で正確なドラッグ開始位置を保持する必要がある
- 現在の実装では`onDragStart`で保存した位置がShift押下時にずれている可能性

**Status**: 🔴 未解決（現在は誤動作するが、実害は少ないためそのまま）

### ピンチイン/ピンチアウトでのキャンバスズーム制御

**目的:**
トラックパッド/タッチデバイスでピンチ操作により、キャンバスの表示倍率（左下の25%〜200%）を変更したい

**現在の問題:**
- ブラウザ全体がズームされてしまう（ネイティブのピンチズーム動作）
- キャンバスの表示倍率だけを変更できない

**試行した対策:**
- `touch-action: none` の追加
- `viewport` に `user-scalable=no` を設定
- `wheel` / `touch` / `gesture` イベントの `preventDefault()`
- Safari用 `gesturestart/gesturechange/gestureend` イベント処理

**技術的課題:**
- ブラウザ（特にMac Safari/Chrome）のネイティブピンチズーム動作を完全に無効化するのは技術的に困難
- セキュリティ・アクセシビリティの観点から、ブラウザが意図的に無効化を制限している可能性

**Status**: 🔴 未解決（実装試行したが、現時点では実現不可能の可能性あり）

### テキスト・図形のエフェクト機能

**目的:**
Illustratorのような高度な視覚効果を実現する

**実装したいエフェクト:**
- **外側線**: 線が塗りに重ならない（複数レイヤーを内部的に生成）
- **グロー効果**: 発光するような光彩
- **ドロップシャドウ**: 影をつける
- **アウトライン効果**: 線を外側に配置
- **グラデーション**: 塗りにグラデーションを適用

**技術的アプローチ:**
1. 単一の要素を内部的に複数のKonvaノードで構成
2. エフェクトをプリセットとして提供（ユーザーは選択するだけ）
3. 編集は単一オブジェクトとして、レンダリング時に複数レイヤーに展開

**課題:**
- Konva.jsの制約（strokeは常に中央配置）
- 複数ノードの同期管理
- パフォーマンス

**Status**: 📋 TODO（将来実装予定）

---

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: TailwindCSS
- **Canvas**: Konva.js (react-konva)
- **Backend**: Supabase (Auth, Database, Storage)

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
- Add images (via image library or drag & drop from local files)
- Drag and drop elements on canvas
- **Drag & Drop Local Images** ✨ NEW (2025-12-16): Drag images from desktop/folders directly onto canvas with visual feedback
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

### Authentication ✅ (2025-11-21)
- **Google OAuth**: Login/Logout via Supabase
- **UI**: Canva-style avatar dropdown menu
- **Status**: ✅ Fully implemented with database integration

### User Roles & Permissions ✅ (2025-11-23, Updated 2025-12-16)
- **Role Types**: `admin` | `user`
- **Subscription Tiers**: `free` | `premium`
- **Storage**: `profiles` table with `role` and `subscription_tier` columns
- **Admin Privileges**:
  - Upload to default image library
  - Mark banners as Premium (via checkbox in header)
  - Manage default templates (future)
- **Free Users**: Basic banner creation & personal image library
- **Premium Users**: Advanced features (planned)

### Banner Plan Types ✅ NEW (2025-12-16)
Each banner can be designated as Free or Premium:
- **Plan Types**: `free` | `premium`
- **Storage**: `banners` table with `plan_type` column (default: `free`)
- **Admin Control**: Only admin users can mark banners as Premium via checkbox in editor header
- **Visual Indicators**:
  - **Premium Badge**: Gold "PREMIUM" badge with lock icon displayed on banner cards in list view (top-left corner)
  - **Header Label**: "Premium" checkbox with lock icon in banner editor (visible to admins only)
- **Future**: Free users will be blocked from accessing premium banners (with upgrade prompt)

### Image Library System ✅ NEW (2025-11-23)
WordPress-style image library with dual storage:

#### Default Image Library
- **Bucket**: `default-images` (Public)
- **Table**: `default_images`
- **Access**: All users can view, only admins can upload
- **Purpose**: High-quality curated images provided by the service

#### User Image Library (My Library)
- **Bucket**: `user-images` (Public with RLS)
- **Table**: `user_images`
- **Access**: Users can only view/upload their own images
- **Storage Path**: `user-images/{user_id}/{filename}`
- **Features**:
  - Once uploaded, images can be reused across multiple banners
  - Automatic metadata storage (width, height, file size)
  - Organized by user ID for multi-tenant support

#### UI Features
- **Modal Interface**: WordPress-style image picker
- **Tabs**: "Default" and "My Library"
- **Upload**: Drag & drop or file picker
- **Grid Display**: Thumbnail previews with hover effects
- **One-Click Insert**: Click to add image to canvas at original size

### Data Persistence ✅ (2025-11-23, Updated 2025-12-16)
- **Storage**: Migrated from localStorage to Supabase PostgreSQL
- **Tables**:
  - `banners`: User banner data with JSONB elements and `plan_type`
  - `profiles`: User metadata (role, subscription tier)
  - `default_images`: Default library metadata
  - `user_images`: User library metadata
- **Auto-save**: Elements (800ms debounce), canvas color, thumbnails (3s interval)
- **Save Status Indicator** ✨ NEW (2025-12-16): Real-time "Saving..." / "Saved" indicator in bottom-left corner
- **RLS Policies**: Row-level security ensures users only access their own data

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

## Database Schema

### Tables

#### `profiles`
```sql
- id: uuid (FK to auth.users)
- email: text
- role: text (admin | user)
- subscription_tier: text (free | premium)
- subscription_expires_at: timestamp
- created_at: timestamp
- updated_at: timestamp
```

#### `banners`
```sql
- id: uuid (PK)
- user_id: uuid (FK to profiles)
- name: text
- template: jsonb
- elements: jsonb
- canvas_color: text
- thumbnail_data_url: text
- plan_type: text (free | premium) DEFAULT 'free' -- NEW (2025-12-16)
- created_at: timestamp
- updated_at: timestamp
```

#### `default_images`
```sql
- id: uuid (PK)
- name: text
- storage_path: text (unique)
- width: integer
- height: integer
- file_size: integer
- tags: text[]
- created_at: timestamp
```

#### `user_images`
```sql
- id: uuid (PK)
- user_id: uuid (FK to profiles)
- name: text
- storage_path: text (unique)
- width: integer
- height: integer
- file_size: integer
- created_at: timestamp
```

## Future Enhancements
- **Lasso Selection**: Complete coordinate system fix
- **Multi-element resize**: Proportional resize of multiple selected elements
- **Copy/Paste multiple elements**: Extend clipboard to support multi-selection
- **Premium Features**: Define feature set for paid tier
- **Template System**: Pre-designed banner templates
- **LLM Integration**: AI-powered text generation
- **Color Palette Presets**: Curated color schemes
- **Alignment Tools**: Align left/center/right, distribute evenly
- **Snap-to-grid / Smart Guides**: Design assistance
- **Image Search**: Tag-based filtering in image library
- **Stripe Integration**: Payment processing for premium subscriptions
