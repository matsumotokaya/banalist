# Canvas Architecture - 描画レイヤー構造仕様書

## 概要

エディタのキャンバス描画領域は、Konva.js（react-konva）を使用した3層構造で構成されている。

## レイヤー構造

```
┌───────────────────────────────────────────────────┐
│  Stage                                            │
│  HTML <canvas> 要素そのもの                         │
│  サイズ: (artboard幅 + BLEED×2) × scale            │
│        × (artboard高 + BLEED×2) × scale            │
│                                                    │
│    ┌───────────────────────────────────┐           │
│    │                                   │           │
│    │  Artboard                         │           │
│    │  <Rect fill={canvasColor}>        │           │
│    │  サイズ: template.width × height   │           │
│    │  ユーザーに見える「キャンバス」      │           │
│    │                                   │           │
│    │  ┌─────────────────────────┐      │           │
│    │  │  Clip Group             │      │           │
│    │  │  要素の描画領域          │      │           │
│    │  │  artboardと同じ範囲      │      │           │
│    │  │  はみ出た部分は非表示    │      │           │
│    │  └─────────────────────────┘      │           │
│    │                                   │           │
│    └───────────────────────────────────┘           │
│                                                    │
│    ←── BLEED (200px) ──→                           │
│    Transformer等がはみ出せる余白                     │
└───────────────────────────────────────────────────┘
```

## 各レイヤーの詳細

### 1. Stage

- **実装**: Konva `<Stage>` → HTML `<canvas>` 要素
- **ファイル**: `src/components/Canvas.tsx`
- **サイズ計算**: `(template.width + BLEED * 2) * scale` × `(template.height + BLEED * 2) * scale`
- **見た目**: 透明（親要素の背景色が見える。エディタでは黒 `#1a1a1a`）
- **役割**: Konva の描画ルート。すべての描画要素のコンテナ

### 2. Artboard

- **実装**: `<Rect x={0} y={0} width={template.width} height={template.height} fill={canvasColor} />`
- **サイズ**: `template.width` × `template.height`（例: 1920×1080）
- **見た目**: ユーザーに見える「白いキャンバス」（色は `canvasColor` で変更可能）
- **役割**: デザインの作業領域を視覚的に示す背景
- **listening**: `false`（クリックイベントを受け取らない → Stage に伝播）

### 3. Clip Group

- **実装**: `<Group clipX={0} clipY={0} clipWidth={template.width} clipHeight={template.height}>`
- **範囲**: Artboard と同一
- **役割**: 要素（テキスト、画像、図形）の描画をArtboard内にクリップ。要素がArtboard外にはみ出た部分は非表示になる
- **子要素**: TextRenderer, ShapeRenderer, ImageRenderer

## BLEED（裁ち落とし余白）

- **定数**: `const BLEED = 200`（キャンバス座標単位）
- **目的**: Transformer（バウンディングボックスのハンドル）やドラッグ中の要素がArtboard外にはみ出ても視覚的に見えるようにする
- **配置**: Stage の `x`, `y` を `BLEED * scale` に設定し、Artboard を Stage の中心にオフセット

```typescript
<Stage
  width={(template.width + BLEED * 2) * scale}
  height={(template.height + BLEED * 2) * scale}
  x={BLEED * scale}
  y={BLEED * scale}
>
```

## 座標変換

### 画面座標 → キャンバス座標

```typescript
const canvasX = pointer.x / scale - BLEED;
const canvasY = pointer.y / scale - BLEED;
```

### エクスポート時

エクスポート（`exportImage`）では Artboard 部分のみを切り出して出力する。BLEED 領域は含まれない。

## Artboard のみ表示したい場合

Stage 全体を表示すると BLEED 余白が見えてしまう。Artboard 部分だけを見せるには：

1. **overflow: hidden + ネガティブマージン**: ラッパー要素で Stage を Artboard サイズにクリップし、BLEED 分をオフセット
2. **BLEED を 0 にする**: Transformer のはみ出しが不要な場合（読み取り専用表示など）

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/components/Canvas.tsx` | メインキャンバスコンポーネント（Stage, Artboard, Clip Group） |
| `src/components/canvas/TextRenderer.tsx` | テキスト要素の描画 |
| `src/components/canvas/ShapeRenderer.tsx` | 図形要素の描画 |
| `src/components/canvas/ImageRenderer.tsx` | 画像要素の描画 |
| `src/components/DemoCanvas.tsx` | トップページのデモ用キャンバス |
| `src/types/template.ts` | CanvasElement 型定義 |
