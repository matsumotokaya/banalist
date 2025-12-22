# 🔍 デバッグ計画：要素消失問題の徹底調査

**最終更新**: 2025-12-22

---

## 🎯 調査の目的

**「なぜデフォルトテキストを移動すると、追加した要素が消えるのか」を完全に解明する**

---

## 📍 Phase 1: ログの完全網羅（最優先）

### 目的
すべてのステート変更とイベントを追跡し、**消失の瞬間**を特定する

### 追加すべきログ

#### 1. useElementOperations.ts
```typescript
// Line 17: updateElement
const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
  console.log('=== [updateElement] START ===');
  console.log('  Updating element ID:', id);
  console.log('  Updates:', updates);
  console.log('  BEFORE - Total elements:', elements.length);
  console.log('  BEFORE - Element IDs:', elements.map(el => el.id));

  const newElements = elements.map((el) => {
    if (el.id === id) {
      return { ...el, ...updates } as CanvasElement;
    }
    return el;
  });

  console.log('  AFTER - Total elements:', newElements.length);
  console.log('  AFTER - Element IDs:', newElements.map(el => el.id));
  console.log('=== [updateElement] END ===');

  setElements(newElements);
  saveToHistory(newElements);
}, [elements, setElements, saveToHistory]);
```

#### 2. BannerEditor.tsx - handleElementUpdate
```typescript
// Line 477
const handleElementUpdate = (id: string, updates: Partial<CanvasElement>) => {
  console.log('=== [handleElementUpdate] START ===');
  console.log('  Element ID:', id);
  console.log('  Updates:', updates);
  console.log('  Current local elements:', elements.length);
  console.log('=== [handleElementUpdate] END ===');

  elementOps.updateElement(id, updates);
};
```

#### 3. Canvas.tsx - onDragEnd
```typescript
// Canvas.tsx内のドラッグ終了ハンドラー
const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
  const id = e.target.id();
  const node = e.target;

  console.log('=== [Canvas] Drag End ===');
  console.log('  Element ID:', id);
  console.log('  New position:', { x: node.x(), y: node.y() });
  console.log('=== [Canvas] Drag End ===');

  onElementUpdate?.(id, {
    x: node.x(),
    y: node.y(),
  });
};
```

#### 4. BannerEditor.tsx - elementsステートの監視
```typescript
// useEffectで常時監視
useEffect(() => {
  console.log('>>> [BannerEditor] Elements state CHANGED <<<');
  console.log('    Total elements:', elements.length);
  console.log('    Element IDs:', elements.map(el => `${el.type}-${el.id.substring(0, 8)}`));
}, [elements]);
```

---

## 📍 Phase 2: React Query の完全追跡

### 目的
キャッシュの自動更新が問題を引き起こしていないか確認

### 実施内容

#### 1. staleTimeを無限に設定
```typescript
// useBanners.ts
export function useBanner(id: string | undefined) {
  return useQuery({
    queryKey: bannerKeys.detail(id || ''),
    queryFn: async () => { ... },
    enabled: !!id,
    staleTime: Infinity, // 自動再取得を無効化
    gcTime: Infinity,     // キャッシュを永続化
  });
}
```

#### 2. onSuccessログの追加
```typescript
export function useBatchSaveBanner(id: string) {
  return useMutation({
    mutationFn: async (updates) => {
      console.log('[useBatchSaveBanner] Mutation START');
      await bannerStorage.batchSave(id, updates);
      console.log('[useBatchSaveBanner] Mutation END');
      return updates;
    },
    onSuccess: () => {
      console.log('[useBatchSaveBanner] onSuccess - Invalidating cache');
      queryClient.invalidateQueries({ queryKey: bannerKeys.detail(id) });
    },
  });
}
```

#### 3. React Query DevToolsの有効化
```typescript
// main.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

## 📍 Phase 3: Konva レイヤーの検証

### 目的
ステートは残っているのに、レンダリングされていない可能性を検証

### 実施内容

#### 1. Canvas.tsx にレイヤー確認ログ
```typescript
// Canvas.tsx
useEffect(() => {
  if (!stageRef.current) return;

  const stage = stageRef.current;
  const layer = stage.getLayers()[0];

  if (layer) {
    const children = layer.getChildren();
    console.log('[Canvas] Konva Layer Info:');
    console.log('  Total children:', children.length);
    console.log('  Children types:', children.map(c => c.getClassName()));
  }
}, [elements]);
```

#### 2. TextRenderer/ShapeRenderer の描画確認
```typescript
// TextRenderer.tsx
export const TextRenderer = ({ element, ... }) => {
  console.log('[TextRenderer] Rendering:', element.id);

  return (
    <Text
      id={element.id}
      // ...
    />
  );
};
```

---

## 📍 Phase 4: 最小再現コードの作成

### 目的
問題を切り分けて、原因を特定する

### 手順

1. **新しいブランチを作成**
```bash
git checkout -b debug/element-disappear
```

2. **最小限のコードで再現**
   - React Query削除
   - 自動保存削除
   - シンプルなローカルステートのみ

3. **問題が再現するか確認**
   - 再現しない → React Queryが原因
   - 再現する → Konvaまたはステート管理が原因

---

## 📍 Phase 5: ステートのスナップショット記録

### 目的
要素が消える前後のステート全体を記録

### 実施内容

```typescript
// BannerEditor.tsx
const debugSnapshot = useRef<{
  timestamp: number;
  elements: CanvasElement[];
  banner: Banner | null;
  action: string;
}[]>([]);

// すべてのステート変更時に記録
useEffect(() => {
  debugSnapshot.current.push({
    timestamp: Date.now(),
    elements: JSON.parse(JSON.stringify(elements)),
    banner: JSON.parse(JSON.stringify(banner)),
    action: 'elements_changed',
  });

  // 最新10件のみ保持
  if (debugSnapshot.current.length > 10) {
    debugSnapshot.current.shift();
  }
}, [elements, banner]);

// グローバルに公開（デバッグ用）
useEffect(() => {
  (window as any).debugSnapshot = debugSnapshot.current;
}, []);

// コンソールで確認: window.debugSnapshot
```

---

## 📍 Phase 6: ブレークポイントデバッグ

### 目的
Chrome DevToolsでリアルタイム追跡

### 手順

1. Chrome DevToolsを開く
2. Sourcesタブで以下にブレークポイント設定：
   - `BannerEditor.tsx` の `setElements` 呼び出し
   - `useElementOperations.ts` の `updateElement`
   - `Canvas.tsx` の `onDragEnd`

3. デフォルトテキストを移動
4. **どのブレークポイントが呼ばれるか確認**
5. **呼び出しスタックを追跡**

---

## 🎬 実行計画

### Day 1: ログの網羅
- [ ] Phase 1のログをすべて追加
- [ ] デフォルトテキスト移動時のログを記録
- [ ] ログから消失のパターンを特定

### Day 2: React Query検証
- [ ] Phase 2の設定変更
- [ ] DevToolsで状態確認
- [ ] キャッシュ無効化で問題が解決するか検証

### Day 3: Konva検証
- [ ] Phase 3のログ追加
- [ ] ステート vs レンダリングの不一致を確認

### Day 4: 最小再現
- [ ] Phase 4のシンプル版作成
- [ ] 問題の切り分け

### Day 5: 根本原因特定
- [ ] すべての情報を統合
- [ ] 原因を特定
- [ ] 修正方針を決定

---

## 🚨 デバッグ時の注意事項

1. **ログは削除しない**
   - すべてのログを残して、パターンを見つける

2. **1つずつ検証**
   - 複数の変更を同時にしない

3. **再現性を確認**
   - 毎回同じ手順で問題が発生するか確認

4. **ブラウザキャッシュをクリア**
   - スーパーリロード（Cmd+Shift+R）を毎回実行

5. **記録を残す**
   - 何を試して、何がわかったかをドキュメント化

---

## 📊 期待される成果

このデバッグ計画を完了すると：
- ✅ 要素が消える**正確なタイミング**が判明
- ✅ 要素が消える**根本原因**が特定
- ✅ **確実な修正方法**が見つかる

または：
- ✅ 技術的に解決不可能であることが証明される
- ✅ アーキテクチャ全面見直しの必要性が明確になる
