# D·Lo · 3D カード回転ヒーロー

> ロード時にカードの扇が 3D で組み上がり、放置中はゆっくり回頭。カーソルで向きが追従し、ドラッグすれば慣性付きで自由に回せるヒーロー。perspective と transform だけで、WebGL なし。

**Live demo**: `./index.html`

## 概要

| 項目 | 内容 |
|---|---|
| ジャンル | D · 3D・空間 |
| 用途 | Lo · ローディング / ヒーロー |
| 主な参考 | Apple, Vercel |
| 依存 | なし（Pure HTML + CSS + Vanilla JS。JS は REPLAY のみ） |
| 推奨配置 | ファーストビュー、プロダクト／機能のショーケース |

## 仕組み

`.slot`（3D の定位置）と `.card`（登場アニメ）で transform を**親子に分離**して合成する。

| 要素 | 担当 transform |
|---|---|
| `.deck` | 回転（JS が `rotateY`/`rotateX` を毎フレーム駆動） |
| `.slot` | 各カードの定位置（`translateX` / `translateZ` / `rotateY`） |
| `.card` | 登場（`opacity` + `translateY` + `rotateX`、load 時 1 回・CSS） |

1. `.scene` に `perspective`、`.deck` に `transform-style: preserve-3d`
2. `.slot--1/2/3` が左・中央・右の 3D 定位置。**左右は `translateZ(-30px)` で後退、中央は `translateZ(60px)` で前進**させ、実 Z で前後を確定（回転カードが中央を貫通するのを防ぐ）
3. `.card` がロード時に下から起き上がって組み上がる（CSS、`animation-delay` で staggered）
4. 登場後は JS の 1 ループが `.deck` の回転を統合制御

### 回転の 3 モード（JS で合成）

| モード | 条件 | 動き |
|---|---|---|
| idle | 放置（非操作・慣性ほぼ 0） | `rotateY` をゆっくり往復（重み `idleW` をフェード） |
| follow | カーソルが `.scene` 内 | カーソル位置へ `rotateY`/`rotateX` が傾く |
| spin | ドラッグ中 / 離した直後 | `spin += dx`、離すと `vel*=0.93` の慣性で減衰 |

最終 `rotateY = spin + follow + idle`。登場（`.card`）と回転（`.deck`）が別要素なので干渉しない。横ドラッグはスマホでも有効（`.scene` に `touch-action:pan-y`）。

## 組み込み手順

### 1. 2 ファイルをコピー

`style.css` / `script.js` を移植先へ。JS は REPLAY ボタン用のみ（不要なら省略可、登場・回頭は CSS だけで動く）。

### 2. マークアップ

```html
<section class="hero" data-card-rotate>
  <div class="hero-text">…見出し・本文・<button data-replay>REPLAY</button>…</div>
  <div class="scene">
    <div class="deck">
      <div class="slot slot--1"><div class="card card--a">…</div></div>
      <div class="slot slot--2"><div class="card card--b">…</div></div>
      <div class="slot slot--3"><div class="card card--c">…</div></div>
    </div>
  </div>
</section>
<script src="./card-rotate.js"></script>
```

- カードは 3 枚想定。増やす場合は `.slot--n` を足し、`translateX` / `rotateY` / `animation-delay` を割り当てる
- カードの中身・配色は自由（デモは `.card--a/b/c` でグラデーション）

## カスタマイズ可能な CSS 変数

| 変数 | 役割 | デフォルト |
|---|---|---|
| `--cr-perspective` | 遠近の強さ（小さいほど誇張） | `1400px` |
| `--cr-spread` | 左右カードの開き（`translateX`） | `52%` |
| `--cr-turn` | 左右カードの回頭角（`rotateY`） | `26deg` |
| `--cr-in` | 登場 1 枚の時間 | `900ms` |

> idle / follow / spin の強さ・感度は `script.js` 冒頭の `MAX_YAW` / `MAX_PITCH` / `DRAG_K` で調整。
> 合成 `rotateY` は `ROT_LIMIT`（既定 52°）でクランプし、左右カードのオフセット（`--cr-turn` ≈26°）を足しても 90° 未満＝**カード裏面が見えない**ようにしている（保険で `.card{backface-visibility:hidden}` も指定）。`--cr-turn` を上げたら `ROT_LIMIT` を下げて合わせる。

### よくある調整例

```css
/* 開きを大きく・誇張を強く */
.hero{ --cr-spread:64%; --cr-turn:34deg; --cr-perspective:1000px; }

/* 回頭を止めて静的なヒーローに */
.deck{ animation:none; }
```

## アクセシビリティ

`prefers-reduced-motion: reduce` のとき、登場・回頭・REPLAY のドット点滅を止め、カードを定位置で静止表示する。

## 制約 / 既知の挙動

- `.slot` の `rotateY` で側面カードは斜めになる。中身の可読性が要る場合は `--cr-turn` を控えめに
- `box-shadow` を 3D 変形した要素に掛けているため、枚数が多いと描画負荷が上がる
- REPLAY は `.card` のアニメを消す → reflow → 再付与で再生する（`is-replay` クラス）

## ライセンス

ANIMATION DESIGN STUDY の一部として公開（コピペ自由）。
