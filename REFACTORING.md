# REFACTORING.md - 今後のリファクタリング計画

最終更新: 2025-12-17

---

## 📊 現状

Phase 0（緊急修正）とPhase 1（React Query導入）が完了しました。

**達成した改善**:
- 初回ロード: 30-120秒 → **3秒**（90-97%改善）
- 重複リクエスト: **完全排除**
- コード削減: **-166行**

詳細は`README.md`の「Performance Optimizations」セクションを参照してください。

---

## 🚀 今後のリファクタリング計画

### 次に実装する価値があるもの（優先度順）

---

## 📋 Phase 1.2: IndexedDB永続化（推奨度: ★★★☆☆）

### 目的
ページリロード時の初回ロードをゼロにする（オフライン対応）

### 現在の問題
- ページリロード時は毎回Supabaseから取得（3秒）
- オフライン時は何も表示できない

### 実装内容

```typescript
// src/db/database.ts
import Dexie, { Table } from 'dexie';

class BanalistDB extends Dexie {
  banners!: Table<Banner, string>;

  constructor() {
    super('BanalistDB');
    this.version(1).stores({
      banners: 'id, userId, updatedAt',
    });
  }
}

export const db = new BanalistDB();
```

```typescript
// React Query Persisterと統合
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const persister = createSyncStoragePersister({
  storage: window.localStorage, // またはIndexedDB
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24時間
});
```

### 期待効果
- ページリロード: **0ms**（IndexedDBから即座に表示）
- オフライン対応
- ネットワーク通信量80%削減

### 実装コスト
- **時間**: 3-4時間
- **難易度**: 中
- **依存関係**:
  ```bash
  npm install dexie dexie-react-hooks
  npm install @tanstack/query-sync-storage-persister
  ```

---

## 📋 Phase 1.3: Supabase Realtime統合（推奨度: ★★☆☆☆）

### 目的
複数タブ・複数デバイス間でのリアルタイム同期

### 現在の問題
- タブAで編集してもタブBには反映されない
- 手動リロードが必要

### 実装内容

```typescript
// src/hooks/useRealtimeSync.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

export function useRealtimeSync(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('banners-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'banners',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // キャッシュを自動更新
          queryClient.invalidateQueries(['banners', userId]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, queryClient]);
}
```

### 期待効果
- タブ間同期: **即座**
- 複数デバイス同期: **リアルタイム**

### 実装コスト
- **時間**: 2-3時間
- **難易度**: 低
- **依存関係**: なし（Supabase標準機能）

---

## 📋 Phase 2: 状態管理の統一（推奨度: ★★★★☆）

### 目的
BannerEditor.tsxの複雑さを解消（687行 → 200行）

### 現在の問題
- 11個のuseStateが1コンポーネントに散在
- props drillingが4レベル以上
- 状態の同期が複雑

### 実装内容

```typescript
// src/stores/editorStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface EditorStore {
  // State
  elements: CanvasElement[];
  selectedIds: Set<string>;
  canvasColor: string;
  selectedFont: string;
  selectedSize: number;
  // ... その他の状態

  // Actions
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElements: (ids: string[]) => void;
  // ... その他のアクション
}

export const useEditorStore = create<EditorStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 実装
      })),
      { name: 'editor-store' }
    )
  )
);
```

### 使用例（Before/After）

**Before (687行)**:
```typescript
function BannerEditor() {
  const [elements, setElements] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [canvasColor, setCanvasColor] = useState('#FFF');
  // ... 8個のuseState

  const handleAddElement = (el) => {
    setElements([...elements, el]);
    setSelectedIds([el.id]);
    // ... 複雑なロジック
  };

  return (
    <Canvas
      elements={elements}
      onUpdate={handleUpdate}
      onSelect={handleSelect}
      // ... 15個のprops
    />
  );
}
```

**After (200行)**:
```typescript
function BannerEditor() {
  const { elements, addElement, selectedIds } = useEditorStore();

  return <Canvas />; // Zustandから直接取得
}
```

### 期待効果
- コード量: **687行 → 200行**
- props drilling: **完全削除**
- Redux DevToolsで状態監視可能

### 実装コスト
- **時間**: 1-2日
- **難易度**: 中〜高
- **破壊的変更**: あり（全コンポーネントのprops変更）
- **依存関係**:
  ```bash
  npm install zustand immer
  ```

---

## 📋 Phase 3: Canvas最適化（推奨度: ★★★☆☆）

### 目的
100要素以上でも60fps維持

### 現在の問題
- 要素が増えるとFPS低下
- 全要素を常に再描画

### 実装内容

#### 3.1 レイヤー分離

```typescript
<Stage>
  <Layer name="background" listening={false}>
    <Rect fill={canvasColor} />
  </Layer>

  <Layer name="elements">
    {visibleElements.map(el => <MemoizedElement />)}
  </Layer>

  <Layer name="ui" listening={false}>
    <Transformer />
  </Layer>
</Stage>
```

#### 3.2 仮想化

```typescript
const visibleElements = useMemo(() => {
  const viewport = getViewportBounds();
  return elements.filter(el => isInViewport(el, viewport));
}, [elements, viewport]);
```

### 期待効果
- 背景変更時の再描画: **0要素**
- 100要素でも: **60fps維持**
- メモリ使用量: **50%削減**

### 実装コスト
- **時間**: 1週間
- **難易度**: 中
- **依存関係**: なし

---

## 🔥 Phase 4: 過激な構造改革（推奨度: ★☆☆☆☆）

### これらは「可能性」として記載。実装するかは要検討。

#### 4.1 Rust/WASMでCanvasエンジン

**目的**: レンダリング速度10倍

**コスト**:
- 学習コスト高
- バンドルサイズ増加
- メンテナンス難易度上昇

**推奨**: ❌ 現時点では不要

---

#### 4.2 Supabase Edge Functionsでサーバーサイドレンダリング

**目的**: サムネイル生成をサーバー側で実行

**コスト**:
- Edge Functionsの課金
- デプロイ・管理コスト

**推奨**: ❌ 現時点では不要

---

#### 4.3 CRDTで完全リアルタイム共同編集

**目的**: Googleドキュメント風の共同編集

**コスト**:
- Yjs学習コスト
- 複雑性増大
- デバッグ困難

**推奨**: ❌ ユーザー数が増えてから検討

---

#### 4.4 SQLiteをブラウザに埋め込み

**目的**: ローカルでSQL実行

**コスト**:
- バンドルサイズ+500KB
- 複雑性増大

**推奨**: ❌ IndexedDBで十分

---

## 🎯 推奨する次のステップ

### 選択肢1: このまま完了とする（推奨）

**理由**:
- 初回ロード3秒は実用上十分
- React Queryで重複リクエスト問題は解決済み
- 現時点でユーザー数は限定的

**次にやること**: 新機能開発に集中

---

### 選択肢2: Phase 2（Zustand）を実装

**理由**:
- BannerEditor.tsxの複雑さが将来のメンテナンスリスク
- 状態管理の統一でバグ減少
- 実装コストは1-2日と妥当

**次にやること**: Zustand導入 → 新機能開発

---

### 選択肢3: Phase 1.2（IndexedDB）を実装

**理由**:
- ページリロード時の体感速度が劇的改善（3秒→0秒）
- オフライン対応は差別化要素
- 実装コストは3-4時間と小さい

**次にやること**: IndexedDB永続化 → 新機能開発

---

## 📊 実装優先度マトリクス

| Phase | 効果 | コスト | 推奨度 | 実装タイミング |
|-------|------|--------|--------|--------------|
| Phase 0 | ★★★★★ | 低 | - | ✅ **完了** |
| Phase 1 | ★★★★★ | 中 | - | ✅ **完了** |
| Phase 1.2 (IndexedDB) | ★★★☆☆ | 低 | ★★★☆☆ | ユーザー増加後 |
| Phase 1.3 (Realtime) | ★★☆☆☆ | 低 | ★★☆☆☆ | 複数デバイス利用時 |
| Phase 2 (Zustand) | ★★★★☆ | 中 | ★★★★☆ | 新機能追加前 |
| Phase 3 (Canvas) | ★★★☆☆ | 高 | ★★★☆☆ | 要素100個超える時 |
| Phase 4 | ★☆☆☆☆ | 極高 | ★☆☆☆☆ | 不要 |

---

## 💡 結論

**現状でパフォーマンス問題はほぼ解決済み**です。

次のステップは以下のいずれか：
1. **このまま完了** → 新機能開発へ
2. **Phase 2実装** → コード品質向上 → 新機能開発へ
3. **Phase 1.2実装** → 体感速度さらに改善 → 新機能開発へ

どれを選ぶかは、**次に追加する機能の複雑さ**で判断することを推奨します。

- 複雑な機能を追加予定 → **Phase 2（Zustand）を先に実装**
- シンプルな機能のみ → **このまま完了**
- オフライン対応が必須 → **Phase 1.2（IndexedDB）を実装**
