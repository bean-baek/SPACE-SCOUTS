// Dodge the Obstacles — game engine.
//
// Deliberately framework-free: this module knows nothing about React. It owns a
// canvas, runs its own rAF loop, and reports out through two callbacks. The React
// shell only creates it and destroys it, which is what makes StrictMode's
// double-mount harmless — destroy() tears everything down completely.
//
// All motion is expressed in px/second and multiplied by delta time, so speed is
// identical at 30fps and 144fps. All sizes are multiplied by `scale`, derived from
// the canvas width, so the game plays the same in a 320px frame and a 440px one.

import { OBSTACLE_KEYS } from "./dodgeAssets.js";

// Seconds to skip when a run starts. Set to 20 locally to drop straight into the
// boss fight. MUST be 0 in committed code.
const DEBUG_START_TIME = 0;

export const PHASE1_END = 20; // boss arrives
export const BOSS_HP = 20; // clean hits needed to bring it down — the only way to win

const REF_W = 400; // design width every size is authored against
const BG = "#3a39ff";

const PLAYER_BOX = 52; // sprite box, in design px
const PLAYER_KEY_SPEED = 285; // keyboard movement, design px/sec
const PLAYER_Y = 0.8; // the ship holds one lane — movement is left/right only
const PLAYER_HIT = 0.3; // hit radius as a fraction of the sprite box — deliberately
// smaller than the art so near-misses feel fair

const GAP_START = 0.9; // seconds between obstacle spawns at t=0
const GAP_END = 0.26; // ...and at t=PHASE1_END
const FALL_START = 130;
const FALL_END = 310;
const STAR_CHANCE = 0.28;

// Obstacles roll a size on spawn. The range is wide enough to read as genuine
// variety, and the ceiling is expressed against the boss rather than as a flat
// number, so nothing falling can ever rival the boss on screen.
const OB_SIZE_MIN = 0.55;
const OB_SIZE_MAX = 1.75;
const OB_MAX_VS_BOSS = 0.6;

const BOSS_SCALE = 0.38; // boss sprite box as a share of canvas width

const BULLET_BOX = 18;
const BULLET_SPEED = 215;
const GUN_INTERVAL = 0.2; // machine-gun cadence

// The twin stream is aimed to straddle the player rather than hit dead-centre, so
// holding position under the boss — the only place you can return fire from — is
// survivable. The boss slides side to side, so that pocket keeps moving.
const GUN_SPREAD = 0.13; // radians either side of the aim line
const GUN_JITTER = 0.05;

const BURST_INTERVAL = 2.4;
const BURST_COUNT = 10;

// The player's machine gun. Auto-fires once the boss shows up — there is no fire
// button, because the ship is already being steered by drag on touch.
const SHOT_INTERVAL = 0.12;
const SHOT_SPEED = 540; // design px/sec, upward
const SHOT_LEN = 15; // tracer length
const SHOT_HIT = 0.4; // boss damage radius as a fraction of its sprite box

const HP_OUTLINE = "#211ea4"; // reads as a dark blue against the #3a39ff field
const HP_FILL = "#cbff88";

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// Frame-rate independent smoothing: the fraction to move toward a target this
// frame, given a rate. Equivalent to an exponential decay, unlike a raw
// `x += (t - x) * 0.3` which speeds up on faster displays.
const approach = (rate, dt) => 1 - Math.exp(-rate * dt);

// Fit a sprite inside a square box without distorting it.
function fit(img, box) {
  const a = (img.naturalWidth || 1) / (img.naturalHeight || 1);
  return a >= 1 ? { w: box, h: box / a } : { w: box * a, h: box };
}

function overlaps(ax, ay, ar, bx, by, br) {
  const dx = ax - bx;
  const dy = ay - by;
  const rr = ar + br;
  return dx * dx + dy * dy < rr * rr;
}

export function createDodgeGame(canvas, { assets, onTick, onEnd }) {
  const ctx = canvas.getContext("2d", { alpha: false });

  let W = 0;
  let H = 0;
  let scale = 1;
  let raf = 0;
  let last = 0;
  let running = false;
  let destroyed = false;
  let stars = [];
  let s = null; // the whole mutable world

  const keys = new Set();
  // Only x is tracked: the ship is pinned to its lane, so the y of a drag is ignored.
  const pointer = { active: false, id: null, x: 0 };

  // ---------- sizing ----------

  function seedStars() {
    const n = Math.max(24, Math.round((W * H) / 9000));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.4,
      v: Math.random() * 42 + 14,
      a: Math.random() * 0.4 + 0.25,
    }));
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Cap DPR at 2 — beyond that the extra pixels cost more than they show.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = W / REF_W;

    seedStars();
    if (s) {
      const pr = (PLAYER_BOX * scale) / 2;
      s.player.x = clamp(s.player.x, pr, W - pr);
      s.player.y = H * PLAYER_Y; // the lane is proportional, so it survives a resize
    }
    if (!running) draw();
  }

  // ---------- lifecycle ----------

  function reset() {
    s = {
      t: DEBUG_START_TIME,
      over: false,
      player: { x: W / 2, y: H * PLAYER_Y, tilt: 0 },
      obstacles: [],
      bullets: [], // incoming, from the boss
      shots: [], // outgoing, from the player
      sparks: [],
      boss: null,
      spawn: 0,
      fire: 0,
    };
    pointer.active = false;
    pointer.id = null;
    keys.clear();
  }

  function end(status) {
    if (!s || s.over) return;
    s.over = true;
    stop();
    draw();
    onEnd?.({ status, time: s.t });
  }

  // ---------- spawning ----------

  function spawnObstacle(p) {
    const isStar = Math.random() < STAR_CHANCE;
    const key = isStar
      ? "star"
      : OBSTACLE_KEYS[(Math.random() * OBSTACLE_KEYS.length) | 0];
    const img = assets[key];

    const base = (isStar ? 30 : 54) * scale;
    const box = Math.min(
      base * lerp(OB_SIZE_MIN, OB_SIZE_MAX, Math.random()),
      W * BOSS_SCALE * OB_MAX_VS_BOSS
    );
    const { w, h } = fit(img, box);
    const speed =
      lerp(FALL_START, FALL_END, p) *
      scale *
      (isStar ? 1.6 : 1) *
      (0.9 + Math.random() * 0.2);

    s.obstacles.push({
      img,
      w,
      h,
      r: box * 0.4,
      x: box / 2 + Math.random() * (W - box),
      y: -box,
      vx: (Math.random() - 0.5) * 45 * scale,
      vy: speed,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 1.6,
    });
  }

  function spawnBullet(x, y, angle) {
    const box = BULLET_BOX * scale;
    const { w, h } = fit(assets.bullet, box);
    s.bullets.push({
      w,
      h,
      r: box * 0.34,
      x,
      y,
      vx: Math.cos(angle) * BULLET_SPEED * scale,
      vy: Math.sin(angle) * BULLET_SPEED * scale,
      rot: Math.random() * Math.PI,
      vrot: 4,
    });
  }

  function fireAimed() {
    const b = s.boss;
    const aim = Math.atan2(s.player.y - b.y, s.player.x - b.x);
    // A twin stream with jitter reads as a machine-gun rather than a laser line.
    for (const off of [-GUN_SPREAD, GUN_SPREAD]) {
      spawnBullet(
        b.x,
        b.y + b.box * 0.22,
        aim + off + (Math.random() - 0.5) * GUN_JITTER
      );
    }
  }

  function fireBurst() {
    const b = s.boss;
    const skew = Math.random() * Math.PI * 2;
    for (let i = 0; i < BURST_COUNT; i++) {
      spawnBullet(b.x, b.y + b.box * 0.22, skew + (i / BURST_COUNT) * Math.PI * 2);
    }
  }

  function firePlayer() {
    const p = s.player;
    s.shots.push({
      x: p.x + (Math.random() - 0.5) * 6 * scale, // slight scatter reads as recoil
      y: p.y - PLAYER_BOX * scale * 0.35,
      vy: -SHOT_SPEED * scale,
    });
  }

  function spawnSparks(x, y) {
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (60 + Math.random() * 90) * scale;
      s.sparks.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.28,
      });
    }
  }

  // ---------- update ----------

  function updatePlayer(dt) {
    const p = s.player;
    const prevX = p.x;

    // Horizontal only — the ship is pinned to its lane, so a drag anywhere on the
    // canvas steers by x and the y of the touch is ignored.
    if (pointer.active) {
      p.x += (pointer.x - p.x) * approach(45, dt);
    } else {
      let dx = 0;
      if (keys.has("l")) dx -= 1;
      if (keys.has("r")) dx += 1;
      if (dx) p.x += dx * PLAYER_KEY_SPEED * scale * dt;
    }

    const pr = (PLAYER_BOX * scale) / 2;
    p.x = clamp(p.x, pr, W - pr);
    p.y = H * PLAYER_Y;

    // Bank into the direction of travel — purely cosmetic, sells the movement.
    const vel = dt > 0 ? (p.x - prevX) / dt : 0;
    const want = clamp(vel / (620 * scale), -1, 1) * 0.28;
    p.tilt += (want - p.tilt) * approach(12, dt);
  }

  function updateBoss(dt) {
    const b = s.boss;
    b.age += dt;
    if (b.flash > 0) b.flash -= dt;
    b.y += (H * 0.18 - b.y) * approach(3, dt);
    b.x = W / 2 + Math.sin(b.age * 0.85) * W * 0.3;

    if (b.age < 0.8) return; // grace window while it flies in

    b.gun -= dt;
    if (b.gun <= 0) {
      b.gun = GUN_INTERVAL;
      fireAimed();
    }
    b.burst -= dt;
    if (b.burst <= 0) {
      b.burst = BURST_INTERVAL;
      fireBurst();
    }
  }

  function update(dt) {
    s.t += dt;

    for (const st of stars) {
      st.y += st.v * dt;
      if (st.y > H) {
        st.y = -2;
        st.x = Math.random() * W;
      }
    }

    updatePlayer(dt);

    const inBoss = s.t >= PHASE1_END;

    if (!inBoss) {
      const p = clamp(s.t / PHASE1_END, 0, 1);
      s.spawn -= dt;
      if (s.spawn <= 0) {
        s.spawn = lerp(GAP_START, GAP_END, p);
        spawnObstacle(p);
      }
    } else if (!s.boss) {
      const box = W * BOSS_SCALE;
      const { w, h } = fit(assets.boss, box);
      s.boss = {
        x: W / 2, y: -box, box, w, h,
        age: 0, gun: 0.5, burst: 1.2,
        hp: BOSS_HP,
        hurt: false, // the HP bar stays hidden until the first clean hit lands
        flash: 0,
      };
    }

    if (s.boss) updateBoss(dt);

    // The machine gun only runs during the fight — there is nothing to shoot
    // before that, and tracers over empty sky would imply obstacles are killable.
    if (s.boss && s.boss.age > 0.4) {
      s.fire -= dt;
      if (s.fire <= 0) {
        s.fire = SHOT_INTERVAL;
        firePlayer();
      }
    }

    const bossR = s.boss ? s.boss.box * SHOT_HIT : 0;
    for (let i = s.shots.length - 1; i >= 0; i--) {
      const sh = s.shots[i];
      sh.y += sh.vy * dt;
      if (sh.y + SHOT_LEN * scale < 0) {
        s.shots.splice(i, 1);
        continue;
      }
      if (s.boss && overlaps(sh.x, sh.y, 1, s.boss.x, s.boss.y, bossR)) {
        s.shots.splice(i, 1);
        s.boss.hp -= 1;
        s.boss.hurt = true;
        s.boss.flash = 0.12;
        spawnSparks(sh.x, sh.y);
        if (s.boss.hp <= 0) return end("clear");
      }
    }

    for (let i = s.sparks.length - 1; i >= 0; i--) {
      const k = s.sparks[i];
      k.x += k.vx * dt;
      k.y += k.vy * dt;
      k.life -= dt;
      if (k.life <= 0) s.sparks.splice(i, 1);
    }

    // Obstacles keep falling through the boss phase; spawning simply stops.
    for (let i = s.obstacles.length - 1; i >= 0; i--) {
      const o = s.obstacles[i];
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      o.rot += o.vrot * dt;
      if (o.y - o.h > H) s.obstacles.splice(i, 1);
    }

    for (let i = s.bullets.length - 1; i >= 0; i--) {
      const b = s.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.rot += b.vrot * dt;
      const pad = b.r * 3;
      if (b.x < -pad || b.x > W + pad || b.y < -pad || b.y > H + pad) {
        s.bullets.splice(i, 1);
      }
    }

    const p = s.player;
    const hitR = PLAYER_BOX * scale * PLAYER_HIT;
    for (const o of s.obstacles) {
      if (overlaps(p.x, p.y, hitR, o.x, o.y, o.r)) return end("over");
    }
    for (const b of s.bullets) {
      if (overlaps(p.x, p.y, hitR, b.x, b.y, b.r)) return end("over");
    }
  }

  // ---------- draw ----------

  function sprite(img, x, y, w, h, rot) {
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  function draw() {
    if (!W || !H) return;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#ffffff";
    for (const st of stars) {
      ctx.globalAlpha = st.a;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!s) return;

    for (const o of s.obstacles) sprite(o.img, o.x, o.y, o.w, o.h, o.rot);

    // Player tracers — short lines rather than a sprite, so outgoing fire never
    // reads as one of the boss's stars.
    if (s.shots.length) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(2, 2.6 * scale);
      ctx.lineCap = "round";
      ctx.beginPath();
      for (const sh of s.shots) {
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x, sh.y + SHOT_LEN * scale);
      }
      ctx.stroke();
    }

    if (s.boss) drawBoss();
    for (const b of s.bullets) sprite(assets.bullet, b.x, b.y, b.w, b.h, b.rot);

    if (s.sparks.length) {
      ctx.fillStyle = HP_FILL;
      for (const k of s.sparks) {
        ctx.globalAlpha = Math.max(0, k.life / 0.28);
        ctx.beginPath();
        ctx.arc(k.x, k.y, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    const pbox = PLAYER_BOX * scale;
    const pf = fit(assets.player, pbox);
    sprite(assets.player, s.player.x, s.player.y, pf.w, pf.h, s.player.tilt);
  }

  function drawBoss() {
    const b = s.boss;
    // A brief scale punch on hit — cheaper than a tint and reads just as clearly.
    const punch = b.flash > 0 ? 1 + b.flash * 0.35 : 1;
    sprite(assets.boss, b.x, b.y, b.w * punch, b.h * punch, 0);

    if (!b.hurt) return;

    const bw = b.box * 0.78;
    const bh = 8 * scale;
    const bx = b.x - bw / 2;
    const by = b.y - b.h / 2 - 16 * scale;
    const pct = clamp(b.hp / BOSS_HP, 0, 1);
    const r = bh / 2;

    ctx.save();
    ctx.lineWidth = Math.max(2, 2.4 * scale);
    ctx.strokeStyle = HP_OUTLINE;

    // track
    ctx.fillStyle = "rgba(20,18,120,0.55)";
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, r);
    ctx.fill();

    // remaining health
    if (pct > 0) {
      ctx.fillStyle = HP_FILL;
      ctx.beginPath();
      ctx.roundRect(bx, by, Math.max(bh, bw * pct), bh, r);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, r);
    ctx.stroke();
    ctx.restore();
  }

  // ---------- loop ----------

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    // Clamp dt so a backgrounded tab doesn't teleport everything on return.
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    update(dt);
    if (!running) return; // update() may have ended the run
    draw();
    onTick?.(s.t, s.boss ? "boss" : "dodge", s.boss ? s.boss.hp : 0);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function start() {
    if (destroyed) return;
    stop();
    reset();
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  // ---------- input ----------

  const KEYMAP = {
    ArrowLeft: "l", KeyA: "l",
    ArrowRight: "r", KeyD: "r",
  };

  // Up/down no longer steer, but they still have to be swallowed while playing —
  // otherwise they scroll the phone frame out from under the game.
  const SWALLOW = new Set([
    "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
    "KeyA", "KeyD", "KeyW", "KeyS", "Space",
  ]);

  function onKeyDown(e) {
    if (!running) return;
    const k = KEYMAP[e.code];
    if (k) keys.add(k);
    if (SWALLOW.has(e.code)) e.preventDefault();
  }

  function onKeyUp(e) {
    const k = KEYMAP[e.code];
    if (k) keys.delete(k);
  }

  // Without this a key held while tab-switching stays "down" forever.
  function onBlur() {
    keys.clear();
  }

  function trackPointer(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
  }

  function onPointerDown(e) {
    if (!running) return;
    pointer.active = true;
    pointer.id = e.pointerId;
    trackPointer(e);
    canvas.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!pointer.active || e.pointerId !== pointer.id) return;
    trackPointer(e);
    e.preventDefault();
  }

  function onPointerUp(e) {
    if (e.pointerId !== pointer.id) return;
    pointer.active = false;
    pointer.id = null;
    canvas.releasePointerCapture?.(e.pointerId);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  resize();
  reset();
  draw();

  return {
    start,
    destroy() {
      destroyed = true;
      stop();
      ro.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      s = null;
    },
  };
}
