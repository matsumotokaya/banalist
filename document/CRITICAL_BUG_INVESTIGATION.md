# 🚨 重大バグ調査レポート：要素消失問題

**作成日**: 2025-12-22
**ステータス**: 🔴 未解決 - プロジェクト存続の危機
**優先度**: CRITICAL

---

## 📋 問題の概要

### 現象
バナーエディターで以下の操作を行うと、**追加した要素がすべて消える**

1. 新規バナーを作成（デフォルトテキスト「BANALISTでバナーをつくろう。」が表示）
2. テキスト、シェイプなどを追加（10個程度）
3. **デフォルトテキストを移動（または編集）**
4. **→ 追加した10個の要素がすべて消える**

### 重要な特徴
- **保存ボタンを押す必要はない**（保存せずとも発生）
- **デフォルトテキストを操作した瞬間**に発生
- 通常の要素（後から追加したテキスト）を操作しても発生しない
- **ログに痕跡が残らない**（useEffect再実行のログすら出ない）

---

## 🔍 これまでの調査経緯

### 試行1: ID衝突の仮説（❌ 失敗）

**仮説**:
- `Date.now()`でIDを生成しているため、同じミリ秒内で衝突する
- デフォルトテキストと新規要素のIDが同じになる

**検証**:
- テストコードで確認 → 高速実行時に衝突は発生する
- しかし、**ユーザーは1分以上かけて操作している**ため、この問題ではない

**結論**: 原因ではなかった

---

### 試行2: Optimistic Updateの仮説（❌ 失敗）

**仮説**:
- React QueryのOptimistic Updateが`banner`オブジェクトを更新
- `useEffect`が再実行され、DBの古い値で上書き

**実施した修正**:
1. Optimistic Updateを無効化
2. 自動保存を削除
3. 手動保存ボタンを追加

**結果**: 問題は解決せず

---

### 試行3: useEffectの依存配列の仮説（❌ 失敗）

**仮説**:
- `banner`が変更されるたびにuseEffectが実行され、ローカルが上書きされる
- `banner.id`が同じでも、`banner.template`の参照が変わると再実行される

**実施した修正**:
```typescript
// Before
useEffect(() => {
  setElements(banner.elements);
}, [banner]);

// After
useEffect(() => {
  if (banner.id !== currentBannerId) {
    setElements(banner.elements);
    setCurrentBannerId(banner.id);
  }
}, [banner?.id, banner?.template, ...]);
```

**結果**: 問題は解決せず

---

## 📊 現在のログ分析

### 正常起動時のログ
```
[BannerEditor] Loading NEW banner from DB: 255e66b4...
[BannerEditor] Banner elements from DB: 0 elements
[BannerEditor] Setting elements to: []
[BannerEditor] Banner is empty, adding default text on client side
[BannerEditor] Same banner, keeping local state. BannerID: 255e66b4...
```

### 問題発生時のログ
**ログに何も出力されない**

これは以下を意味する：
- `useEffect`は再実行されていない
- `setElements`は呼ばれていない
- **別のメカニズムで要素が消えている**

---

## 🤔 未検証の仮説

### 仮説4: Konva.jsのレイヤー管理の問題（要検証）

**可能性**:
- 要素のレンダリングはKonva.jsが担当
- `elements`ステート自体は残っているが、Konvaのレイヤーから消えている
- `canvas/TextRenderer.tsx`や`canvas/ShapeRenderer.tsx`に問題がある

**検証方法**:
```typescript
// デフォルトテキスト移動時に以下をログ出力
console.log('Current elements state:', elements);
console.log('Konva layer children:', layer.getChildren());
```

---

### 仮説5: useElementOperationsの問題（要検証）

**疑惑のコード**:
```typescript
// useElementOperations.ts
const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
  const newElements = elements.map((el) => {
    if (el.id === id) {
      return { ...el, ...updates } as CanvasElement;
    }
    return el;
  });
  setElements(newElements);
  saveToHistory(newElements);
}, [elements, setElements, saveToHistory]);
```

**可能性**:
- `elements`の依存配列がstaleになっている
- デフォルトテキスト移動時に、古い`elements`（1個だけ）を参照している

**検証方法**:
```typescript
const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
  console.log('[updateElement] Current elements:', elements.length);
  console.log('[updateElement] Updating element:', id);
  // ...
}, [elements, setElements, saveToHistory]);
```

---

### 仮説6: Canvas.tsxのドラッグ処理の問題（要検証）

**疑惑のコード**:
```typescript
// Canvas.tsx
const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
  const id = e.target.id();
  const node = e.target;
  onElementUpdate?.(id, {
    x: node.x(),
    y: node.y(),
  });
};
```

**可能性**:
- `onElementUpdate`が呼ばれたときに、不正な状態更新が発生している
- BannerEditorの`handleElementUpdate`に問題がある

---

### 仮説7: React Query キャッシュの自動再取得（要検証）

**可能性**:
- `staleTime: 5 * 60 * 1000`が切れたタイミングで自動再取得
- デフォルトテキストを移動した瞬間に、たまたま再取得が発生
- DBには1個しかないので、1個で上書き

**検証方法**:
- `staleTime`を無限に設定してテスト
- またはReact Query DevToolsで確認

---

## 🎯 次のアクションプラン

### Step 1: 詳細ログの追加（最優先）

以下の箇所にログを追加：

1. **useElementOperations.ts**
```typescript
const updateElement = useCallback((id: string, updates) => {
  console.log('[updateElement] BEFORE - elements:', elements.length);
  const newElements = elements.map(...);
  console.log('[updateElement] AFTER - newElements:', newElements.length);
  setElements(newElements);
}, [elements, setElements, saveToHistory]);
```

2. **BannerEditor.tsx - handleElementUpdate**
```typescript
const handleElementUpdate = (id: string, updates: Partial<CanvasElement>) => {
  console.log('[handleElementUpdate] id:', id, 'updates:', updates);
  console.log('[handleElementUpdate] Current elements:', elements.length);
  elementOps.updateElement(id, updates);
};
```

3. **Canvas.tsx - onDragEnd**
```typescript
const handleDragEnd = (e) => {
  console.log('[Canvas] Drag end - element:', e.target.id());
  console.log('[Canvas] New position:', { x: node.x(), y: node.y() });
  onElementUpdate?.(id, { x: node.x(), y: node.y() });
};
```

---

### Step 2: React Queryの動作を完全に理解

1. React Query DevToolsを有効化
2. デフォルトテキスト移動時のキャッシュ状態を確認
3. 自動再取得が発生しているか確認

---

### Step 3: Konvaレイヤーの状態確認

1. `elements`ステート vs Konvaレイヤーの要素数を比較
2. 不一致があれば、レンダリング問題と判明

---

## 📝 技術的な制約と懸念

### 現在のアーキテクチャの問題点

1. **状態管理が複雑すぎる**
   - ローカルステート（elements）
   - React Queryキャッシュ（banner.elements）
   - Konvaレイヤー（実際のDOM）
   - 3つの状態が同期していない可能性

2. **React Queryの役割が不明確**
   - 本来はサーバー状態管理のためのライブラリ
   - ローカル編集中の状態には不向き

3. **デバッグが困難**
   - ログに残らない = 何が起きているかわからない
   - React DevToolsでステートを追跡する必要

---

## ⚠️ プロジェクト存続への影響

### 最悪のシナリオ

もしこの問題が技術的に解決不可能な場合：
- ユーザーは編集した内容を失う
- サービスとして成立しない
- プロジェクト中止の可能性

### 解決できない場合の代替案

1. **全面的なアーキテクチャ見直し**
   - React Queryを削除
   - シンプルなローカルステート + 手動保存のみ
   - 開発期間：2-3週間

2. **一時的な回避策**
   - デフォルトテキストを廃止
   - 空のバナーから始める
   - ユーザー体験は悪化するが、動作はする

---

## 🔧 推奨される調査手順

1. **まず、ログを完全に網羅する**
2. **React Query DevToolsで状態を可視化**
3. **Konvaレイヤーとステートの同期を確認**
4. **最小再現コードを作成**
5. **根本原因を特定してから修正**

---

## 📅 タイムライン

- **調査開始**: 2025-12-22
- **期限**: 未定（ただし、長期化するとプロジェクト存続に影響）
- **現在の状況**: 原因不明のまま

---

## 📞 サポート

この問題の解決には、以下が必要になる可能性：
- React Query専門家のレビュー
- Konva.js専門家のレビュー
- フルスタックアーキテクトによる設計見直し
