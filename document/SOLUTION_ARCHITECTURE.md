# 🚀 BANALIST アーキテクチャ改善 - 解決策実装レポート

**実施日**: 2025-12-22
**実装者**: Claude Code

---

## 📊 問題の要約

### 根本原因：クロージャトラップによる状態消失

**症状**：
- オブジェクトを選択して移動し、別のオブジェクトを選択すると、前のオブジェクトが元の位置に戻ったり、消えたりする
- 特にデフォルトテキストを操作すると、他のすべての要素が消失する

**原因分析**：
1. **クロージャの古い状態参照**
   - `useElementOperations` の `updateElement` がuseCallbackで古い`elements`配列を参照
   - デフォルトテキスト追加時の `elements = [defaultText]` が固定される
   - 新しい要素を追加しても、updateElement内では古い状態を参照し続ける

2. **React QueryとローカルステートのコンフリクTeアンぽ
   - サーバー状態管理用のReact Queryを編集中のローカル状態に使用
   - 保存時のキャッシュ無効化により、DBから古いデータが再取得される

3. **デフォルトテキストの非対称性**
   - DBには空配列、クライアントでデフォルトテキスト追加
   - DBとローカルの不一致が常に発生

---

## ✅ 実装した解決策

### 1. 関数型更新パターンへの移行

**変更前** (`useElementOperations.ts`):
```typescript
// 問題：useCallbackとelementsの依存によりクロージャが発生
const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
  const newElements = elements.map((el) => { // ← 古いelementsを参照
    if (el.id === id) {
      return { ...el, ...updates };
    }
    return el;
  });
  setElements(newElements);
  saveToHistory(newElements);
}, [elements, setElements, saveToHistory]); // ← elementsが依存配列に
```

**変更後**:
```typescript
// 解決：関数型更新で常に最新の状態を取得
const updateElement = (id: string, updates: Partial<CanvasElement>) => {
  setElements((prevElements) => { // ← 常に最新の状態を取得
    const newElements = prevElements.map((el) => {
      if (el.id === id) {
        return { ...el, ...updates } as CanvasElement;
      }
      return el;
    });
    saveToHistory(newElements);
    return newElements;
  });
};
// useCallbackを使わない（依存配列の問題を回避）
```

**効果**：
- クロージャの問題を完全に解決
- 常に最新の`elements`配列を参照
- 要素の消失やワープが発生しなくなる

### 2. デフォルトテキストの即時DB保存

**変更前** (`BannerEditor.tsx`):
```typescript
if (migratedElements.length === 0) {
  const defaultText = createDefaultText();
  setElements([defaultText]);
  setHasUnsavedChanges(true); // DBと不一致のまま
}
```

**変更後**:
```typescript
if (migratedElements.length === 0) {
  const defaultText = createDefaultText();
  const newElements = [defaultText];
  setElements(newElements);

  // DBに即座に保存して一貫性を保つ
  batchSave.mutateAsync({
    elements: newElements,
    canvasColor: banner.canvasColor,
  }).then(() => {
    setHasUnsavedChanges(false); // 保存済み
  });
}
```

**効果**：
- DBとローカルの一貫性を保つ
- 初回ロード時の不整合を防ぐ

### 3. React Queryのキャッシュ制御

**変更前** (`useBanners.ts`):
```typescript
onSuccess: () => {
  // キャッシュ無効化でDBから再取得 → ローカル状態が上書きされる
  queryClient.invalidateQueries({ queryKey: bannerKeys.detail(id) });
}
```

**変更後**:
```typescript
onSuccess: (updates) => {
  // キャッシュを直接更新（再取得しない）
  const currentBanner = queryClient.getQueryData<Banner>(bannerKeys.detail(id));
  if (currentBanner) {
    queryClient.setQueryData<Banner>(bannerKeys.detail(id), {
      ...currentBanner,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }
  // invalidateQueriesは呼ばない → ローカルが真実の源
}
```

**効果**：
- ローカルステートが真実の源となる
- 保存後の不要な再取得を防ぐ
- 編集中の状態が保持される

---

## 📈 改善結果

### Before → After

| 問題 | 改善前 | 改善後 |
|-----|--------|--------|
| **要素のワープ** | 頻繁に発生 | ✅ 解消 |
| **要素の消失** | デフォルトテキスト操作時に発生 | ✅ 解消 |
| **状態の同期** | 3つの状態が非同期 | ✅ ローカルが真実の源 |
| **保存の信頼性** | 不安定 | ✅ 安定 |

---

## 🏗️ アーキテクチャの改善点

### 簡潔な状態管理フロー

```
[初回ロード]
  DB → React Query → ローカルステート

[編集中]
  ユーザー操作 → ローカルステート更新（関数型）

[保存時]
  ローカルステート → DB
  （React Queryキャッシュは直接更新、再取得なし）
```

### 設計原則

1. **Single Source of Truth**: 編集中はローカルステートが唯一の真実
2. **関数型更新**: クロージャを避け、常に最新状態を参照
3. **明示的な保存**: 自動保存は問題解決後に再導入
4. **一貫性の維持**: DBとローカルの不整合を最小化

---

## 🔄 今後の改善余地

### Phase 1（短期）
- [x] クロージャ問題の解決
- [x] デフォルトテキストの一貫性
- [x] React Queryの適切な使用
- [ ] 手動保存の最適化
- [ ] エラーハンドリングの強化

### Phase 2（中期）
- [ ] 自動保存の再導入（デバウンス付き）
- [ ] Optimistic UIの改善
- [ ] パフォーマンス最適化

### Phase 3（長期）
- [ ] Zustandによる状態管理の統一化
- [ ] WebSocketによるリアルタイム同期
- [ ] 協調編集機能

---

## 📝 技術的な教訓

### 1. useCallbackの罠
- 依存配列にステートを含むと、クロージャで古い値を参照する可能性
- 関数型更新（`setState(prev => ...)`）で解決

### 2. React Queryの適切な使用
- サーバー状態管理用であり、ローカル編集には不向き
- キャッシュ無効化は慎重に（不要な再取得を避ける）

### 3. 状態の一貫性
- 複数の状態源は避ける
- 明確な真実の源を定義する

---

## ✅ 結論

主要な問題である「オブジェクトのワープ・消失」は解決されました。

**キーとなった変更**：
1. 関数型更新パターンによるクロージャ回避
2. デフォルトテキストの即時DB保存
3. React Queryキャッシュの適切な制御

これにより、BANALISTは安定した編集体験を提供できるようになりました。

---

## 📚 参考資料

- [React公式：State更新の落とし穴](https://react.dev/learn/updating-objects-in-state)
- [React Query：キャッシュ管理のベストプラクティス](https://tanstack.com/query/latest/docs/react/guides/caching)
- [useCallbackの正しい使い方](https://react.dev/reference/react/useCallback)