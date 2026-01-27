# ドラッグ & Shift 固定 仕様（現状・次の課題）

## 1. 目的
デザイン編集画面におけるドラッグ時の Shift 固定を、一般的なデザインツール相当の UX に近づける。

---

## 2. 現在の仕様（2026-01-27 時点）

### 単体ドラッグ + Shift
- Shift 押下時に軸が固定される
- **一度固定された軸は、ドラッグ終了まで変更されない**
- Shift を離すと固定解除

### マルチドラッグ + Shift
- multi-drag 中は dragBoundFunc を無効化
- Canvas 側の dx/dy により軸固定
- Star/Circle の中心座標は描画時のみ変換

---

## 3. 現在の実装上の前提

- **Canvas は scale 表示**（例: 0.4）
- Konva の dragBoundFunc は **スケール後座標**を渡す
- そのため **Shift 固定は座標を scale で逆変換して計算**し、戻り値は再度 scale する

---

## 4. 現在の達成状態

- Shift 押下時にオブジェクトが画面外へワープする問題は改善
- 固定軸はドラッグ中維持され、安定している
- ただし **X/Y の切り替えはできない**（最初に固定された軸が最後まで維持）

---

## 5. 次の課題（改善ポイント）

### 5.1 軸固定の再判定（閾値導入）
- Shift 押下後、移動距離の差が一定値を超えたら軸を再判定
- 例: |dx| - |dy| が 20px 以上で軸ロック

### 5.2 軸切り替え UX
- 方向が明確に変わった場合のみロック軸を切り替える
- 小さな揺れでは切り替わらない（スナップ感を維持）

---

## 6. 実装の入口（変更対象）

- `src/components/canvas/ShapeRenderer.tsx`
- `src/components/canvas/TextRenderer.tsx`
- `src/components/canvas/ImageRenderer.tsx`
- `src/components/Canvas.tsx`

---

## 7. 次の実装に向けた仕様案

### 単体ドラッグ
1. Shift 押下時点で lockAxis を未確定にする
2. dragBoundFunc 内で |dx|/|dy| を比較
3. |dx - dy| >= threshold を満たした時点で lockAxis を確定
4. lockAxis 確定後は軸固定を継続

### マルチドラッグ
1. dx/dy 計算時に同じ threshold を 적용
2. lockAxis が未確定なら制約をかけない
3. lockAxis 確定後のみ axis 固定

---

## 8. 手動検証項目

1. 単体ドラッグ + Shift 押下 → 軸固定が一貫
2. Shift 押下後、方向を大きく変える → 閾値超過で軸が切り替わる
3. マルチドラッグ + Shift → ワープなし
4. Star/Circle 含む multi-drag でも安定


---

## 9. 再設計に向けた方針整理（ゼロベース）

### 9.1 問題の捉え直し
- ドラッグ＆ドロップは既に多数の実績・ベストプラクティスが存在する領域
- 現状は個別修正の積み重ねで不安定さが残っている
- 「車輪の再発明」を避けるため、設計の段階から再整理する必要がある

### 9.2 あるべき姿（ドラッグ制御の統一）
- すべての要素で同じドラッグ制御フローを通す
- **イベント → 座標変換 → 制約適用 → 反映** のパイプラインを共通化
- 単体/マルチ/特殊形状（Star/Circle）でロジックが分岐しない構成を目指す

### 9.3 DragController の導入案
- ドラッグ処理を Renderer から分離し、1つの制御層に集約
- 役割
  - dragStart: 開始座標の保存
  - dragMove: delta 計算 + 制約適用
  - dragEnd: dragMove と同一計算で確定

### 9.4 ライブラリ選択肢

**Option A: Konva 継続**
- 既存資産を活かし、DragController を導入して安定化
- dragBoundFunc の役割を最小限に縮小

**Option B: ライブラリ刷新**
- Fabric.js などデザインツール向けの既存基盤を検討
- ただし移行コストは高いため段階導入が前提

### 9.5 段階的移行プラン（現実解）
- Phase 1: Konva 継続 + DragController 導入で安定化
- Phase 2: UX を一般的なデザインツール水準へ整備
- Phase 3: 必要ならライブラリ刷新を検討

### 9.6 次の意思決定ポイント
1. Konva 継続が前提かどうか
2. DragController 層の導入を優先するか
3. 長期的にライブラリ変更の可能性を残すか

