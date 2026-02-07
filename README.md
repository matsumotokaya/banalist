# WHATIF

Browser-based banner design tool with template and rule-based image generation.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **Frontend**: React 19.2.0 + Vite + TypeScript
- **Canvas**: Konva.js (react-konva)
- **Styling**: TailwindCSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Data Fetching**: React Query (@tanstack/react-query)
- **i18n**: react-i18next (English/Japanese)

## Features

### Canvas Editing
- **Text**: Add/edit text with custom fonts, size, weight, letter spacing, line height
- **Shapes**: Rectangle, circle, triangle, star, heart with fill/stroke controls
- **Images**: Upload to personal library or use default library, drag & drop support
- **Effects**: Shadow (blur, offset X/Y, opacity, color)
- **Transform**: Drag, resize, rotate with visual transformers
- **Multi-selection**: Shift+Click to select multiple elements, group transform/move

### Keyboard Shortcuts
- **Cmd/Ctrl + Z/Y**: Undo/Redo
- **Cmd/Ctrl + C/V**: Copy/Paste
- **Delete/Backspace**: Delete selected element(s)
- **Arrow keys**: Move element (1px normal, 10px with Shift)

### Zoom & Pan
- **Trackpad Pinch**: Zoom in/out (blocks browser zoom)
- **Ctrl/Cmd + Wheel**: Zoom in/out
- **Regular Wheel**: Pan canvas
- **Grab & Drag**: Pan with mouse
- **Fit Button**: Reset view to center

### User Management
- **Authentication**: Google OAuth via Supabase
- **Roles**: `admin` | `user`
- **Subscription**: `free` | `premium` ($8/month via Stripe)
- **Permissions**: Admin can upload default images, manage templates

### Data Persistence
- **Auto-save**: 3-second debounce with real-time status indicator
- **Storage**: Supabase PostgreSQL (JSONB for elements)
- **Guest Mode**: Single trial banner in localStorage
- **Image Libraries**: User library (private) + Default library (public)

### Export
- PNG export at original resolution
- JPEG thumbnails (400px, 70% quality)

## Project Structure

```
src/
├── components/         # UI components (Canvas, Sidebar, PropertyPanel, etc.)
├── pages/              # Page components (BannerEditor, BannerManager, TemplateGallery)
├── hooks/              # Custom hooks (useBanners, useTemplates, useZoomControl, etc.)
├── types/              # TypeScript types (template.ts: CanvasElement, TextElement, etc.)
├── utils/              # Utilities (bannerStorage, templateStorage, supabase client)
├── i18n/               # Translation files (en, ja)
└── contexts/           # React contexts (AuthContext)
```

## Environment Variables

Create `.env.local` for local development:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

For production (Vercel), set these in Project Settings → Environment Variables.

## Database Schema

### Core Tables
- **`profiles`**: User metadata (role, subscription_tier, full_name, avatar_url)
- **`banners`**: User banner data (elements as JSONB, canvas_color, thumbnail_url)
- **`templates`**: Public templates (elements, plan_type: free/premium)
- **`default_images`**: Default image library metadata
- **`user_images`**: User image library metadata

See [docs/DATABASE.md](docs/DATABASE.md) for full schema details.

## Deployment (Vercel)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set environment variables (see above)
4. Add custom domain via Vercel → Settings → Domains

## Documentation

- [Development Guide](docs/DEVELOPMENT.md) - Architecture, conventions, adding features
- [Performance Guide](docs/PERFORMANCE.md) - React Query cache settings, optimization history
- [Database Schema](docs/DATABASE.md) - Full table definitions and RLS policies

## i18n (Internationalization)

Supported languages: English (🇬🇧) / Japanese (🇯🇵)

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation('editor');
  return <button>{t('download')}</button>;
};
```

Translation files: `/src/i18n/locales/{en,ja}/*.json`

---

## License

Proprietary - All rights reserved
