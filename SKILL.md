---
name: anim-card-rotate
description: "3d / spatial loading / hero animation (pure HTML/CSS/JS, no deps). Use when you need a loading / hero effect with a 3D / spatial feel — e.g. ファーストビュー、プロダクト／機能のショーケース. ロード時にカードの扇が 3D で組み上がり、放置中はゆっくり回頭。カーソルで向きが追従し、ドラッグすれば慣性付きで自由に回せるヒーロー。perspective と transform だけで、WebGL なし。"
---

# anim-card-rotate (D·Lo · 3D カード回転ヒーロー)

Pure HTML + CSS + vanilla JS, **zero dependencies**. ロード時にカードの扇が 3D で組み上がり、放置中はゆっくり回頭。カーソルで向きが追従し、ドラッグすれば慣性付きで自由に回せるヒーロー。perspective と transform だけで、WebGL なし。

## When to use / 使いどころ
- **EN:** a *loading / hero* effect with a *3D / spatial* feel.
- **JP:** 3D・空間 × ローディング／ヒーロー。推奨配置: ファーストビュー、プロダクト／機能のショーケース

## Bundled assets / 同梱アセット
This skill folder is the reference implementation — copy from these files:
- `index.html` — full working demo (open to preview)
- `style.css` — component styles
- `script.js` — the self-contained logic
- `README.md` — full human-facing doc (JP): mechanism, accessibility, constraints

## How to apply / 組み込み手順
Copy the component CSS block from `style.css` and the script from `script.js` (no build step), then follow the markup/parameters below.

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

## Customize / カスタマイズ
### カスタマイズ可能な CSS 変数
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

---
> Full mechanism, accessibility and known constraints: see **`README.md`** / 詳細・機構・アクセシビリティは README.md 参照。
