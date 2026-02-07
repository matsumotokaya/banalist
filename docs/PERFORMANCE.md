# Performance Optimization Guide

## React Query Cache Settings

### Current Configuration

| Hook | staleTime | refetchOnMount | Description |
|------|-----------|----------------|-------------|
| `useBanners` | 5 min | true | Banner list (refetch if stale) |
| `useBanner` | 5 min | - | Single banner detail |
| `useTemplates` | 5 min | false | Template list (no auto-refetch) |
| `useProfile` | - | - | User profile |

### Understanding `staleTime`

`staleTime` defines how long cached data is considered "fresh". Within this period, React Query returns cached data without making server requests.

**Tuning Guidelines:**
- **Increase** staleTime → Reduce server requests (better for Egress costs)
- **Decrease** staleTime → More real-time data (better for collaboration)
- Current setting (**5 min**) balances Egress reduction with reasonable freshness

### Cache Invalidation

React Query automatically invalidates caches on mutations:

```typescript
const mutation = useMutation(updateBanner, {
  onSuccess: () => {
    queryClient.invalidateQueries(['banner', id]);
    queryClient.invalidateQueries(['banners']);
  }
});
```

## Auto-Save Strategy

### Debounce Settings

```typescript
const debouncedSave = useMemo(() =>
  debounce(() => performSave(false), 3000),
  [elements, canvasColor]
);
```

- **Debounce delay**: 3 seconds (reduced from 800ms)
- **Thumbnail generation**: Only on page exit (not on every save)
- **Result**: 60% reduction in network requests

### Save Status Indicator

Real-time feedback to users:
- **Unsaved** (orange): Changes detected, debounce pending
- **Saving** (spinner): Network request in progress
- **Saved** (green): Data persisted successfully
- **Error** (red): Save failed, retry available

## Thumbnail Compression

### Strategy (2026-01-26)

- **Format**: JPEG (70% quality)
- **Size**: Max 400px width (aspect ratio preserved)
- **Before**: PNG 2-4MB
- **After**: JPEG ~30-50KB
- **Reduction**: **95%** egress cost savings

### Implementation

```typescript
// Export at reduced resolution with JPEG compression
const thumbnailScale = 400 / originalWidth;
const dataURL = stage.toDataURL({
  pixelRatio: thumbnailScale / scale,
  mimeType: 'image/jpeg',
  quality: 0.7
});
```

## Performance Metrics

### Before Optimization (2025-12-01)
- Initial load: **30-120 seconds**
- Auto-save every **800ms**
- Thumbnail generated on **every save**
- React StrictMode: **4-5x duplicate queries**
- No request deduplication

### After Optimization (2025-12-17)
- Initial load: **3 seconds** (90-97% improvement)
- Auto-save every **3 seconds** (60% fewer requests)
- Thumbnail only on **page exit**
- React StrictMode: **Removed** (1x queries)
- React Query: **Automatic deduplication**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial load | 30-120s | 3s | **90-97%** |
| Subsequent loads | 2-3s | Instant (cache) | **100%** |
| Auto-save frequency | 800ms | 3000ms | 60% reduction |
| Thumbnail generation | Every save | Only on exit | Major reduction |
| Duplicate requests | Common | Zero | 100% eliminated |
| UI update latency | Wait for save | Instant | Optimistic updates |

## Optimization History

### Phase 0: Emergency Fixes (2025-12-01)
1. Removed React StrictMode (4-5x → 1x queries)
2. Increased auto-save debounce (800ms → 2000ms)
3. Moved thumbnail generation to page exit only
4. Added SessionStorage cache for profile data

### Phase 1: React Query Migration (2025-12-10)
1. Replaced manual cache (`Map`) with React Query
2. Implemented optimistic updates for instant UI feedback
3. Automatic request deduplication
4. Code reduction: 166 lines removed

### Phase 2: Egress Optimization (2026-01-26)
1. Thumbnail compression (PNG → JPEG 70%)
2. Increased `staleTime` (0 → 5 minutes)
3. Disabled refetch on tab switch
4. Result: **95% reduction** in thumbnail egress

## Root Causes Identified

1. **Supabase Cold Start**: Initial connection overhead (not query time)
2. **React StrictMode**: Duplicate effect executions in development
3. **Aggressive Auto-save**: 800ms too frequent for network operations
4. **No Deduplication**: Multiple components fetching same data
5. **Thumbnail Size**: PNG 2-4MB per save operation

## Monitoring

### React Query DevTools

Available in development mode (bottom-right corner):
- View active queries and their states
- Inspect cache contents
- Track refetch behavior
- Debug stale/fresh transitions

### Browser Performance Tab

Monitor:
- Network waterfall for duplicate requests
- Memory usage for cache size
- Frame rate during canvas operations

## Future Optimizations

### Potential Improvements
- [ ] Implement `prefetchQuery` for template gallery
- [ ] Add service worker for offline support
- [ ] Lazy load Konva shapes library
- [ ] Virtualize layer list for 100+ elements
- [ ] Web Workers for thumbnail generation
- [ ] IndexedDB for guest mode persistence

### Trade-offs to Consider
- **staleTime** vs **real-time collaboration**: Current 5min is single-user optimized
- **Optimistic updates** vs **data consistency**: UI may show stale data briefly
- **Thumbnail quality** vs **egress cost**: 70% JPEG is current sweet spot
