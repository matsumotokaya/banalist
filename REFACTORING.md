# REFACTORING.md - パフォーマンス改善とリファクタリング課題

最終更新: 2025-12-16

## 🚨 重大な問題：パフォーマンス低下

**現状**: 1つの操作に約30秒かかる状態。実用不可能なレベル。

---

## 📋 確認された問題と原因

### 1. **Supabase profilesテーブルのクエリが異常に遅い（約2分）**

**症状**:
```
[AuthContext] fetchProfile called for userId: 9c1674eb-f053-4fe5-b99a-70805d2ccc59
// 約2分待機...
[AuthContext] Profile fetched successfully
```

**現在の対策（暫定）**:
- 30秒タイムアウトを設定
- プロファイルキャッシュを実装
- タイムアウト時はデフォルト値（admin/premium）を返す

**根本原因（要調査）**:
- [ ] Supabaseプロジェクトのリージョン（日本から遠い？）
- [ ] profilesテーブルにインデックスが不足
- [ ] RLSポリシーが非効率
- [ ] Supabaseの接続プール設定
- [ ] ネットワークレイテンシー

**調査方法**:
```sql
-- Supabaseダッシュボードで実行
-- 1. Slow queriesを確認
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- 2. profilesテーブルのインデックスを確認
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'profiles';

-- 3. 実行計画を確認
EXPLAIN ANALYZE
SELECT id, email, role, subscription_tier
FROM profiles
WHERE id = '9c1674eb-f053-4fe5-b99a-70805d2ccc59';
```

---

### 2. **React StrictModeによる重複実行**

**症状**:
- AuthContextのuseEffectが複数回実行される
- 同じprofilesクエリが4-5回も並行実行される

**現在の対策（暫定）**:
```typescript
const [isInitialized, setIsInitialized] = useState(false);

useEffect(() => {
  if (isInitialized) return; // 重複実行を防止
  setIsInitialized(true);
  // ...
}, [isInitialized]);
```

**根本的な解決策**:
- [ ] React QueryまたはSWRの導入を検討
- [ ] Supabase Clientのシングルトン化
- [ ] カスタムフックでデータフェッチを集約

---

### 3. **Auto-save処理が頻繁すぎる可能性**

**現在の実装**:
```typescript
// BannerEditor.tsx
saveTimeoutRef.current = setTimeout(async () => {
  await bannerStorage.batchSave(banner.id, updates);
}, 800); // 800msごとに保存判定
```

**潜在的な問題**:
- 要素を動かすたびにデバウンスタイマーがリセット
- 複数のuseEffectが同時にsaveをトリガー
- thumbnailの生成（canvas.exportImage()）が重い

**改善案**:
- [ ] デバウンス時間を1500ms〜2000msに延長
- [ ] サムネイル生成を別のタイミングに分離（5秒ごと、または明示的な保存時のみ）
- [ ] 要素のドラッグ中は保存を一時停止

---

### 4. **キャッシュマネージャーの非効率**

**現在の実装**:
```typescript
// cacheManager.ts
// 各クエリごとに5分間キャッシュ
cacheManager.set(cacheKey, banners, 5 * 60 * 1000);
```

**潜在的な問題**:
- [ ] キャッシュの無効化タイミングが不明確
- [ ] 複数タブで開いた場合の整合性問題
- [ ] メモリリークの可能性

**改善案**:
- [ ] localStorage/IndexedDBへの永続化を検討
- [ ] Service Workerでのキャッシュ制御
- [ ] Supabaseのリアルタイム機能でキャッシュ同期

---

### 5. **Konva.jsのレンダリングパフォーマンス**

**潜在的な問題**:
- 要素数が増えるとレンダリングが重くなる
- Transformerの更新が頻繁
- 不要なbatchDraw()呼び出し

**調査ポイント**:
- [ ] Konva.Stage のパフォーマンスプロファイリング
- [ ] useEffect内でのbatchDraw()呼び出し回数
- [ ] 画像要素の読み込みとキャッシュ

**改善案**:
- [ ] Konva.Layer の分離（背景/要素/UI）
- [ ] 仮想化（表示範囲外の要素は非表示）
- [ ] memo化とuseMemoの活用

---

## 🔧 提案するリファクタリング方針

### Phase 1: 緊急対応（パフォーマンス改善）

1. **Supabaseクエリの最適化**
   - インデックスの追加
   - RLSポリシーの見直し
   - クエリのバッチ化

2. **データフェッチの最適化**
   - React Query or SWR導入
   - グローバルステート管理（Zustand/Jotai）
   - 不要なre-renderの削減

3. **Auto-save処理の見直し**
   - デバウンス時間の調整
   - サムネイル生成の最適化
   - バッチ処理の改善

### Phase 2: アーキテクチャ改善

1. **状態管理の整理**
   ```
   現在: 各コンポーネントでuseState乱立
   改善後: Zustand/Jotaiで集約管理
   ```

2. **カスタムフックの整理**
   ```
   現在: useElementOperations, useHistory, useZoomControl などバラバラ
   改善後: useBannerEditor として統合
   ```

3. **TypeScript型の整備**
   - 型の一貫性確保
   - union typeの見直し
   - Zodでのランタイムバリデーション

### Phase 3: コード品質向上

1. **テストの追加**
   - ユニットテスト（Vitest）
   - E2Eテスト（Playwright）

2. **エラーハンドリングの強化**
   - Error Boundary
   - トースト通知
   - リトライ機能

3. **パフォーマンスモニタリング**
   - React DevTools Profiler
   - Lighthouse CI
   - Sentry導入

---

## 📊 パフォーマンス計測方法

### ブラウザDevTools

```javascript
// Consoleで実行
performance.mark('start');
// 操作を実行
performance.mark('end');
performance.measure('operation', 'start', 'end');
console.table(performance.getEntriesByType('measure'));
```

### React DevTools Profiler

1. React DevTools → Profiler
2. 録画開始
3. 操作を実行
4. コミットごとのレンダリング時間を確認

### Network分析

1. F12 → Network
2. Throttling: Fast 3G に設定
3. リクエストの待機時間（Waiting）を確認

---

## 🎯 優先順位

### P0 (最優先・今すぐ対応)
- [ ] Supabase profilesクエリの根本原因特定
- [ ] インデックス追加（profiles.id）
- [ ] Auto-save頻度の削減（800ms → 2000ms）

### P1 (重要・1週間以内)
- [ ] React Queryの導入
- [ ] Supabaseクライアントのシングルトン化
- [ ] サムネイル生成の最適化

### P2 (改善・2週間以内)
- [ ] 状態管理ライブラリ導入（Zustand）
- [ ] カスタムフックの整理
- [ ] キャッシュ戦略の見直し

### P3 (今後の課題)
- [ ] テストの追加
- [ ] パフォーマンスモニタリング
- [ ] エラーハンドリング強化

---

## 🔍 デバッグコマンド

```bash
# 開発サーバー起動（デバッグモード）
VITE_LOG_LEVEL=debug npm run dev

# Supabaseログ確認
# Supabase Dashboard → Logs → Postgres Logs

# パフォーマンスプロファイル（Chrome）
# DevTools → Performance → 録画
```

---

## 📝 次のエンジニアへの引き継ぎ事項

### 現状の理解

1. **AuthContext.tsx**が最大のボトルネック
   - profilesテーブルのクエリが2分かかる
   - 30秒タイムアウト + キャッシュで暫定対応中
   - `profileCache` がメモリ上に保存

2. **BannerEditor.tsx**のAuto-saveが頻繁
   - 800msデバウンス
   - サムネイル生成が重い
   - 複数のuseEffectが独立動作

3. **Supabaseの設定確認が必要**
   - RLSポリシー
   - インデックス
   - リージョン

### 調査の進め方

1. まずSupabase Dashboardで「Database → Performance」を確認
2. `profiles`テーブルの実行計画を確認（上記SQLを実行）
3. ブラウザのNetworkタブで実際のレイテンシーを計測
4. React DevTools Profilerでコンポーネントのレンダリング時間を計測

### コードを触る前に

- `REFACTORING.md`（このファイル）を読む
- `README.md`で全体像を把握
- `CLAUDE.md`でプロジェクトルールを確認
- コンソールログで`[AuthContext]`のタイミングを確認

---

## ⚠️ 暫定対策の副作用

### 現在のコードに含まれる「技術的負債」

1. **30秒タイムアウト**
   - 本来2分かかるクエリを強制中断
   - タイムアウト時はデフォルト値を返す（admin/premium）
   - 実際のデータと不一致の可能性

2. **profileCache**
   - モジュールスコープのMap（メモリリーク注意）
   - ページリロードでクリア
   - 複数タブで共有されない

3. **isInitialized フラグ**
   - StrictModeの重複実行を防ぐための苦肉の策
   - 本来はクリーンアップ処理で対応すべき

これらは**応急処置**であり、根本的な解決ではありません。

---

## 📚 参考資料

- [React Query公式ドキュメント](https://tanstack.com/query/latest)
- [Supabaseパフォーマンスガイド](https://supabase.com/docs/guides/database/performance)
- [Konva.jsパフォーマンス最適化](https://konvajs.org/docs/performance/All_Performance_Tips.html)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools#profiler)

---

## 💡 最後に

**このプロジェクトは機能追加を優先したため、パフォーマンスが犠牲になっています。**

次のステップは「動く」から「速く動く」への移行です。
焦らず、計測→特定→修正のサイクルを回してください。

必要に応じてSupabaseプロジェクトのアップグレード（リージョン変更やプラン変更）も検討してください。
