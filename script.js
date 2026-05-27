/* ────────────────────────────────────────────
   D·Lo · 3D Card Rotate Hero
   - 登場（組み上げ）は CSS。回転は JS の 1 ループで統合制御：
     · idle  … 放置中はゆっくり往復回頭
     · follow… カーソルが scene 内にある間は cursor へ向けて傾く
     · spin  … ドラッグで自由に回し、離すと慣性で減衰
   - REPLAY：登場を再生
   - prefers-reduced-motion なら回転を一切行わず静止
   ──────────────────────────────────────────── */

(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const init = (root) => {
    const scene = root.querySelector('.scene');
    const deck = root.querySelector('.deck');
    const replay = root.querySelector('[data-replay]');

    // REPLAY（reduce でも中身の再配置はしないが、ボタンは無害に残す）
    if (replay) {
      replay.addEventListener('click', () => {
        root.classList.add('is-replay');
        void root.offsetWidth;
        root.classList.remove('is-replay');
      });
    }

    if (!scene || !deck || reduce) return;

    // ── 状態 ──
    let spin = 0, vel = 0;        // ドラッグ由来のヨー＋慣性
    let fY = 0, fX = 0;           // カーソル追従（現在値）
    let tY = 0, tX = 0;           // カーソル追従（目標）
    let hovering = false, dragging = false, lastX = 0;
    let phase = Math.random() * 6.28, idleW = 0;

    const MAX_YAW = 14;           // 追従の最大ヨー(deg)
    const MAX_PITCH = 14;         // 追従の最大ピッチ(deg)
    const DRAG_K = 0.45;          // ドラッグ感度
    // 合成 rotateY をこの範囲に制限。左右カードのオフセット(--cr-turn ≈26°)を
    // 足しても 90° 未満に収まり、カード裏面が見えないようにする。
    const ROT_LIMIT = 52;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    scene.addEventListener('pointerenter', () => { hovering = true; });
    scene.addEventListener('pointerleave', () => { hovering = false; tY = 0; tX = 0; });

    scene.addEventListener('pointermove', (e) => {
      if (dragging) return;
      const r = scene.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tY = px * MAX_YAW;
      tX = -py * MAX_PITCH;
    });

    scene.addEventListener('pointerdown', (e) => {
      dragging = true; lastX = e.clientX; vel = 0;
      scene.classList.add('is-grabbing');
      scene.setPointerCapture?.(e.pointerId);
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      spin = clamp(spin + dx * DRAG_K, -ROT_LIMIT, ROT_LIMIT);
      // 上限に達したら慣性を殺す（壁で止める）
      vel = (spin <= -ROT_LIMIT || spin >= ROT_LIMIT) ? 0 : dx * DRAG_K;
    });
    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      scene.classList.remove('is-grabbing');
    });

    const frame = () => {
      phase += 0.01;

      // カーソル追従：hover 中のみ目標へ、その他は 0 へ戻す
      const wantFollow = hovering && !dragging;
      fY += ((wantFollow ? tY : 0) - fY) * 0.08;
      fX += ((wantFollow ? tX : 0) - fX) * 0.08;

      // ドラッグ慣性（上限で止める）
      if (!dragging) {
        spin = clamp(spin + vel, -ROT_LIMIT, ROT_LIMIT);
        vel *= 0.93;
        if (Math.abs(vel) < 0.02 || spin <= -ROT_LIMIT || spin >= ROT_LIMIT) vel = 0;
      }

      // idle の重み：操作していない & 慣性が小さいときだけ効かせる
      const interacting = hovering || dragging || Math.abs(vel) > 0.05;
      idleW += ((interacting ? 0 : 1) - idleW) * 0.03;
      const idle = Math.sin(phase) * 5 * idleW;

      // 合成後も上限でクランプ → 裏面が見えない
      const ry = clamp(spin + fY + idle, -ROT_LIMIT, ROT_LIMIT);
      deck.style.transform = `rotateY(${ry.toFixed(2)}deg) rotateX(${fX.toFixed(2)}deg)`;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  document.querySelectorAll('[data-card-rotate]').forEach(init);
})();
