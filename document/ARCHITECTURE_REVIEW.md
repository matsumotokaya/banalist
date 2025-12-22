# 🏗️ アーキテクチャレビュー：現在の問題点と改善案

**作成日**: 2025-12-22

---

## 📊 現在の技術スタック

```
┌─────────────────────────────────────┐
│         BannerEditor (React)         │
│  - Local State (elements[])          │
│  - useElementOperations              │
│  - useHistory (undo/redo)            │
└──────────────┬──────────────────────┘
               │
               ├─────────────┐
               │             │
       ┌───────▼──────┐  ┌──▼────────────┐
       │ React Query  │  │   Konva.js    │
       │  - useBanner │  │  - Canvas     │
       │  - Cache     │  │  - Layer      │
       └───────┬──────┘  └──┬────────────┘
               │             │
       ┌───────▼─────────────▼──────┐
       │      Supabase (DB)          │
       └─────────────────────────────┘
```

---

## 🚨 現在のアーキテクチャの問題点

### 1. 状態管理の複雑性

**問題**: 3つの異なる状態が存在する

1. **ローカルステート** (`elements`)
   - ユーザーの編集中の状態
   - React stateで管理

2. **React Query キャッシュ** (`banner.elements`)
   - DBから取得したデータのキャッシュ
   - React Queryが自動管理

3. **Konva レイヤー** (実際のDOMノード)
   - 画面に表示されている要素
   - Konvaライブラリが管理

**リスク**:
- 3つの状態が同期しない可能性
- どれが「真実」かが不明確
- デバッグが非常に困難

---

### 2. React Queryの誤用

**問題**: React Queryは**サーバー状態管理**のためのライブラリ

**本来の用途**:
- サーバーからデータを取得
- キャッシュして再利用
- バックグラウンドで自動再取得

**現在の誤用**:
- **編集中のローカル状態**をReact Queryで管理しようとしている
- キャッシュ無効化 → 自動再取得 → ローカル編集が消える

**類似プロジェクトの正しい設計**:
```typescript
// Figma/Canvaのような編集ツール
const [elements, setElements] = useState([]);  // ローカル編集
const saveToServer = () => {                   // 明示的な保存
  api.save(elements);
};
```

---

### 3. デフォルトテキストの特殊扱い

**問題**: デフォルトテキストだけが特別

- **DB作成時**: 空の配列で作成
- **クライアント側**: デフォルトテキストを追加
- **結果**: DBとローカルの不整合

**理想**:
- すべての要素を平等に扱う
- デフォルトテキストも通常の要素と同じライフサイクル

---

### 4. useElementOperationsのクロージャ問題

**疑惑のコード**:
```typescript
const updateElement = useCallback((id, updates) => {
  const newElements = elements.map(...);  // ← elementsはクロージャ
  setElements(newElements);
}, [elements, setElements, saveToHistory]);
```

**問題**:
- `useCallback`の依存配列に`elements`がある
- React Queryのキャッシュ更新で`banner`が変わる
- `useEffect`が再実行される（はずだが、ログに出ない？）
- **古い`elements`を参照している可能性**

---

## 💡 解決策の選択肢

### Option 1: React Queryを完全に削除（推奨）

**変更内容**:
```typescript
// Before
const { data: banner } = useBanner(id);
useEffect(() => {
  setElements(banner.elements);
}, [banner]);

// After
const [banner, setBanner] = useState<Banner | null>(null);
useEffect(() => {
  loadBanner(id).then(setBanner);
}, [id]);
```

**メリット**:
- シンプル
- 状態管理が明確
- デバッグしやすい

**デメリット**:
- キャッシュ機能がなくなる（毎回DBから取得）
- 自動再取得がない

**開発期間**: 3-5日

---

### Option 2: React Queryを正しく使う

**変更内容**:
```typescript
// 読み込みのみReact Query
const { data: banner } = useBanner(id);

// 編集は完全にローカル
const [elements, setElements] = useState([]);

// 初回のみDBから読み込み
useEffect(() => {
  if (banner && elements.length === 0) {
    setElements(banner.elements);
  }
}, [banner]);

// 保存は手動
const handleSave = () => {
  saveBanner(id, elements);  // React Queryを経由しない
};
```

**メリット**:
- キャッシュ機能を維持
- ローカル編集は独立

**デメリット**:
- 中途半端な設計
- 複雑性は残る

**開発期間**: 1-2日

---

### Option 3: Zustandで状態管理を統一

**変更内容**:
```typescript
// store/bannerStore.ts
const useBannerStore = create((set) => ({
  currentBanner: null,
  elements: [],

  loadBanner: async (id) => {
    const banner = await api.getBanner(id);
    set({ currentBanner: banner, elements: banner.elements });
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      )
    }));
  },

  saveBanner: async () => {
    await api.save(get().elements);
  },
}));
```

**メリット**:
- 状態管理が統一される
- グローバルステートで管理しやすい
- デバッグツールが充実

**デメリット**:
- 新しいライブラリの学習コスト
- 全体的なリファクタリングが必要

**開発期間**: 1-2週間

---

### Option 4: ローカルステート + 手動保存のみ（最もシンプル）

**変更内容**:
```typescript
// すべてローカルステートで完結
const [elements, setElements] = useState([]);

// 初回読み込み
useEffect(() => {
  loadBanner(id).then(data => {
    setElements(data.elements);
  });
}, [id]);

// 手動保存ボタン
const handleSave = () => {
  api.save(id, elements);
};
```

**メリット**:
- 最もシンプル
- 動作が予測可能
- バグが起きにくい

**デメリット**:
- キャッシュなし
- 自動保存なし
- 協調編集不可

**開発期間**: 1日

---

## 🎯 推奨アプローチ

### 短期（1週間以内）: Option 4

**理由**:
- プロジェクト存続が最優先
- まず動くものを作る
- シンプルで確実

**実装手順**:
1. React Queryを読み込み専用にする
2. 編集はローカルステートのみ
3. 保存は手動ボタンのみ
4. デフォルトテキストをDB側で作成

---

### 中期（1-2ヶ月）: Option 1 または Option 3

**理由**:
- ユーザー体験を向上
- 自動保存を実装
- スケーラブルな設計

**選択基準**:
- Option 1: シンプルさ重視
- Option 3: 将来の拡張性重視（協調編集など）

---

## 📝 まとめ

### 現在の問題の根本原因（仮説）

1. **React Queryとローカルステートの競合**
   - キャッシュ無効化 → 自動再取得 → ローカル上書き

2. **useCallbackのクロージャ問題**
   - 古い`elements`を参照している

3. **3つの状態の不整合**
   - ローカル、キャッシュ、Konvaレイヤー

### 解決に向けて

1. **まず、徹底的なデバッグ**（DEBUG_PLAN.md参照）
2. **原因特定後、アーキテクチャ選択**
3. **段階的な移行**

### プロジェクト存続のために

- ❌ これ以上の場当たり的修正は禁止
- ✅ 徹底的な原因究明
- ✅ アーキテクチャレベルの見直し
- ✅ シンプルで確実な設計への移行
