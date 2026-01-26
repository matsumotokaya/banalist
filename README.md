# WHATIF

Browser-based banner design tool with template and rule-based image generation.

---

## Tech Stack

- **Frontend**: React 19.2.0 + Vite + TypeScript
- **Styling**: TailwindCSS
- **Canvas**: Konva.js (react-konva)
- **Backend**: Supabase (Auth, Database, Storage)
- **Data Fetching**: React Query (@tanstack/react-query)
- **State Management**: Local useState (planned: Zustand in Phase 2)
- **i18n**: react-i18next (English/Japanese support)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Deployment (Vercel + Domain)

### Vercel build
- Build command: `npm run build`
- Output directory: `dist`

### Required environment variables (Vercel)
Set these in Project Settings -> Environment Variables:
- `VITE_SUPABASE_URL` (Supabase -> Settings -> API -> Project URL)
- `VITE_SUPABASE_ANON_KEY` (Supabase -> Settings -> API -> anon public key)
- `VITE_STRIPE_PUBLISHABLE_KEY` (if Stripe is enabled)

Missing Supabase env vars will cause a blank screen at runtime.

### Domain setup example (`app.whatif-ep.xyz`)
1) Vercel -> Project -> Settings -> Domains -> add `app.whatif-ep.xyz`
2) At the registrar DNS, add/update a `CNAME` record:
   - Host/Name: `app`
   - Value/Target: use the value shown by Vercel (for example, `cname.vercel-dns.com` or a `vercel-dns-xxx.com` target)
3) Wait for DNS propagation, then confirm the domain is `Ready` in Vercel

## Project Structure

```
src/
├── components/       # React components (18 files)
│   ├── Canvas.tsx           # Main canvas with Konva
│   ├── Sidebar.tsx          # Left sidebar (tools)
│   ├── Header.tsx           # Top header
│   ├── BottomBar.tsx        # Bottom bar (zoom, export)
│   ├── PropertyPanel.tsx    # Right panel (properties)
│   └── ...
├── pages/            # Page components
│   ├── BannerManager.tsx    # Banner list page
│   ├── TemplateGallery.tsx  # Template gallery page
│   └── BannerEditor.tsx     # Banner editor page
├── hooks/            # Custom React hooks
│   ├── useBanners.ts        # React Query hooks for banners
│   ├── useTemplates.ts      # React Query hooks for templates
│   ├── useProfile.ts        # React Query hook for user profile
│   ├── useHistory.ts        # Undo/redo functionality
│   ├── useElementOperations.ts
│   └── ...
├── contexts/         # React contexts
│   └── AuthContext.tsx      # Authentication context
├── lib/              # Library configurations
│   └── queryClient.ts       # React Query client setup
├── types/            # TypeScript type definitions
│   └── template.ts          # Element types (CanvasElement, TextElement, ShapeElement)
├── templates/        # Template data
│   └── defaultTemplates.ts
├── utils/            # Utility functions
│   ├── bannerStorage.ts     # Supabase CRUD operations
│   ├── templateStorage.ts   # Supabase template queries
│   ├── storage.ts           # Supabase Storage helpers
│   ├── cacheManager.ts      # In-memory cache (legacy, being replaced by React Query)
│   └── supabase.ts          # Supabase client
├── scripts/           # One-off migration scripts
│   ├── migrate-base64-images.js
│   └── migrate-thumbnail-data-url.js
└── App.tsx           # Main app component
```

## Internationalization (i18n)

### Supported Languages
- 🇬🇧 **English** (Base language)
- 🇯🇵 **日本語** (Japanese)

### Implementation
- **Library**: react-i18next + i18next + i18next-browser-languagedetector
- **Translation Files**: `/src/i18n/locales/{en,ja}/*.json`
- **Namespaces**: `common`, `banner`, `editor`, `auth`, `modal`, `message`
- **Auto-detection**: Browser language with localStorage persistence
- **Language Switcher**: Available in header (🇬🇧/🇯🇵 dropdown)

### Adding New Languages
```bash
# 1. Create translation files
mkdir -p src/i18n/locales/zh
cp src/i18n/locales/en/*.json src/i18n/locales/zh/

# 2. Update i18n/index.ts resources
# 3. Add to LanguageSwitcher.tsx LANGUAGES array
```

### Usage in Components
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation('editor');
  return <button>{t('download')}</button>;
};
```

## Type System

Canvas element types and properties are defined in `src/types/template.ts`.

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
- **Profile Source of Truth**: `profiles` table is used by the app; `auth.users` is only for authentication

### User Roles & Permissions ✅ (2025-11-23, Updated 2025-12-16)
- **Role Types**: `admin` | `user`
- **Subscription Tiers**: `free` | `premium`
- **Storage**: `profiles` table (`role`, `subscription_tier`, `full_name`, `avatar_url`)
- **Admin Privileges**:
  - Upload to default image library
  - Mark banners as Premium (via checkbox in header)
  - Manage default templates (future)
- **Free Users**: Basic banner creation & personal image library
- **Premium Users**: Advanced features (planned)

### Stripe Subscription Integration ✅ NEW (2025-12-21)

**Status**: ✅ Fully implemented and operational

#### Features
- **Stripe Checkout**: Seamless redirect-based payment flow
- **Subscription Price**: $8.00/month (recurring)
- **Webhook Integration**: Automatic profile updates after successful payment
- **Auto-Refresh**: Profile data automatically refreshes on payment success page

#### Technical Implementation
- **Frontend**:
  - `@stripe/stripe-js` for Checkout Session creation
  - Upgrade modal with seamless Stripe redirection
  - Payment success page with auto-redirect

- **Backend**:
  - Supabase Edge Functions:
    - `create-checkout-session`: Creates Stripe Checkout Session
    - `stripe-webhook`: Handles payment events and updates database
  - Webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

- **Data Flow**:
  ```
  User clicks "Upgrade to Premium"
    ↓
  Edge Function creates Stripe Checkout Session
    ↓
  Redirects to Stripe Checkout page
    ↓
  User completes payment
    ↓
  Stripe sends webhook to Supabase
    ↓
  profiles.subscription_tier updated to 'premium'
    ↓
  User redirected to success page
    ↓
  Profile automatically refreshed (React Query)
    ↓
  Immediate access to Premium banners
  ```

#### Configuration
- **Test Mode**: Currently using Stripe test API keys
- **Environment Variables**:
  - `VITE_STRIPE_PUBLISHABLE_KEY`: Frontend Stripe key
  - `STRIPE_SECRET_KEY`: Backend Stripe key (Edge Functions)
  - `STRIPE_WEBHOOK_SECRET`: Webhook signature verification

#### 今後の実装予定
- [ ] 本番環境への移行（Live Mode API Keys）
- [ ] サブスクリプション管理画面（キャンセル・再開）
- [ ] Premium限定機能（AI文言生成、高度なエフェクトなど）
- [ ] 請求履歴・領収書ダウンロード

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
- **Storage**: Migrated from localStorage to Supabase PostgreSQL (logged-in users)
- **Tables**:
  - `templates`: Public template definitions
  - `banners`: User banner data with JSONB elements and `template_id`
  - `profiles`: User metadata (role, subscription tier, full name, avatar)
  - `default_images`: Default library metadata
  - `user_images`: User library metadata
- **Auto-save**: Elements, canvas color, thumbnails
- **Thumbnails**: Stored in Supabase Storage (`thumbnail_url`), Base64 is deprecated
- **Save Status Indicator** ✨ NEW (2025-12-16): Real-time "Saving..." / "Saved" indicator in bottom-left corner
- **RLS Policies**: Row-level security ensures users only access their own data
- **Guest Mode**: One trial banner stored in `localStorage` (`banalist_guest_banner`)

### Template Gallery ✅ (2025-12-18)
- **Tabs**: "My Banners" and "Templates" are separate pages
- **Ordering**: `templates.display_order` asc (NULLs last), fallback to `updated_at` desc
- **Access**:
  - Guests: all templates locked except a single trial template (hardcoded ID)
  - Logged-in: `plan_type = premium` is gated by `profiles.subscription_tier`

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
- full_name: text
- avatar_url: text
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
- thumbnail_data_url: text -- legacy (deprecated)
- thumbnail_url: text       -- Storage public URL
- created_at: timestamp
- updated_at: timestamp
```

#### `templates`
```sql
- id: uuid (PK)
- name: text
- elements: jsonb
- canvas_color: text
- thumbnail_url: text
- plan_type: text (free | premium)
- display_order: integer (nullable)
- width: integer
- height: integer
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

## Performance Optimizations (2025-12-17)

### Completed Improvements

#### Emergency Fixes (Phase 0)
- ✅ **Initial load time**: 30-120s → **3s** (90-97% improvement)
- ✅ **Auto-save debounce**: 800ms → 2000ms (60% reduction in network requests)
- ✅ **Thumbnail generation**: Separated to 5-second interval (no longer blocks saves)
- ✅ **React StrictMode**: Removed to prevent duplicate executions (4-5x → 1x queries)
- ✅ **Profile caching**: SessionStorage cache for instant page reloads
- ✅ **Optimistic UI**: Profile loading no longer blocks initial render

#### React Query Implementation (Phase 1)
- ✅ **Data fetching layer**: Replaced manual cache management with React Query
- ✅ **Optimistic updates**: All mutations provide instant UI feedback
- ✅ **Request deduplication**: Automatic prevention of duplicate network requests
- ✅ **Code reduction**: 166 lines removed across components
  - AuthContext: 184 → 107 lines (42% reduction)
  - BannerEditor: 90 lines removed
- ✅ **Cache hit rate**: Expected 80%+ for subsequent loads
- ✅ **React Query DevTools**: Available for debugging (press button in bottom-right corner)

#### Egress Optimization (2026-01-26)
- ✅ **Thumbnail compression**: PNG 2-4MB → JPEG 400px 70% quality (~30-50KB, 95% reduction)
- ✅ **staleTime optimization**: 0 → 5 minutes (reduces refetch frequency)
- ✅ **Tab switch refetch removed**: No longer refetches on visibility change

### React Query Cache Settings

| Hook | staleTime | refetchOnMount | Description |
|------|-----------|----------------|-------------|
| `useBanners` | 5 min | true | Banner list (refetch if stale) |
| `useBanner` | 5 min | - | Single banner detail |
| `useTemplates` | 5 min | false | Template list (no auto-refetch) |
| `useProfile` | - | - | User profile |

**staleTime**: Duration that cached data is considered "fresh". Within this period, React Query returns cached data without server request.

**Tuning Notes**:
- Increase staleTime to reduce server requests (better for Egress)
- Decrease staleTime for more real-time data (better for collaboration)
- Current setting (5 min) balances Egress reduction with reasonable freshness

### Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial load | 30-120s | 3s | **90-97%** |
| Subsequent loads | 2-3s | **Instant (cache)** | **100%** |
| Auto-save frequency | 800ms | 2000ms | 60% reduction |
| Thumbnail generation | Every save | Every 5s | Major reduction |
| Duplicate requests | Common | **Zero** | 100% eliminated |
| UI update latency | Save wait | **Instant** | Optimistic updates |

### Architecture Improvements

#### Before (Manual Cache Management)
```typescript
// Manual cache with Map
const cache = new Map();
const data = cache.get(key) || await fetch();
cache.set(key, data);
// Manual invalidation needed everywhere
cache.delete(key);
```

#### After (React Query)
```typescript
// Automatic cache management
const { data } = useQuery(['key'], fetchFn);
// Automatic invalidation, deduplication, and background updates
const mutation = useMutation(updateFn, {
  onSuccess: () => queryClient.invalidateQueries(['key'])
});
```

### Root Causes Identified

1. **Supabase Cold Start**: Database query itself is 2.357ms, but initial connection takes time
2. **Network Latency**: First request has SSL/TLS handshake overhead
3. **React StrictMode**: Caused 4-5x duplicate executions in development
4. **Aggressive Auto-save**: 800ms was too frequent for network operations
5. **No Request Deduplication**: Multiple components fetching same data simultaneously

---
