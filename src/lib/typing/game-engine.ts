/**
 * Keyboard Defender – canvas tower-defense typing game engine.
 *
 * Framework-agnostic: React only creates the canvas, forwards key presses and
 * listens to callbacks. Targets are generic (display + answer), so the same
 * engine serves key-position, English-word and pinyin modes.
 */

import { getSprites, renderBackground, MOB_COLORS, SCENE, MobKind, SpriteSet, type BiomeType } from './sprites';
import { playTypingSfx, TypingSfx } from './sounds';
import type { TypingTarget } from './lessons';

const { W, H, WALL_X, WALL_TOP, LANES } = SCENE;
const MOB_SCALE = 4;
const BOSS_SCALE = 7;
const SPAWN_X = W + 40;
const ARROW_ORIGIN = { x: 128, y: 248 };
const GRAVITY = 700;

export interface GameLabels {
  wave: (n: number, total: number) => string;
  bossWave: string;
  combo: (n: number) => string;
  paused: string;
  pausedHint: string;
  go: string;
  victory: string;
  defeat: string;
  tnt: string;
}

export interface GameConfig {
  nextTarget: (exclude: Set<string>) => TypingTarget;
  bossTarget: () => TypingTarget;
  /** Number of rounds/words required to defeat the Ender Dragon Boss (default: 4) */
  bossHp?: number;
  waves: number;
  /** number of normal mobs per wave (index = wave) */
  mobsPerWave: number[];
  practice: boolean;
  hearts: number;
  /** walking speed of wave 1 in px/s */
  baseSpeed: number;
  labels: GameLabels;
  pixelFont: string;
  biome?: BiomeType;
}

export interface GameResult {
  victory: boolean;
  correct: number;
  wrong: number;
  accuracy: number;
  durationSec: number;
  kpm: number;
  maxCombo: number;
  score: number;
  kills: number;
  heartsLost: number;
  escaped: number;
  /** expected key -> number of mistakes */
  missedKeys: Record<string, number>;
  xp: number;
}

export interface GameCallbacks {
  onNextKey?: (key: string | null) => void;
  onKeyResult?: (key: string, correct: boolean) => void;
  onWordDefeated?: (target: TypingTarget) => void;
  onEnd?: (result: GameResult) => void;
}

interface Mob {
  id: number;
  kind: MobKind;
  x: number;
  y: number;
  speed: number;
  target: TypingTarget;
  progress: number;
  dying: boolean;
  scale: number;
  damage: number;
  walkT: number;
  flash: number;
  shake: number;
  hissed: boolean;
  atWall: boolean;
  attackT: number;
  hopT: number;
  bossHp?: number;
  bossMaxHp?: number;
}

interface Arrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  flight: number;
  mobId: number;
  final: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity: number;
}

interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  font?: string;
  outline?: string;
}

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
}

interface Cloud {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
}

type Phase = 'countdown' | 'banner' | 'playing' | 'ending' | 'ended';

export class TypingGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cfg: GameConfig;
  private cb: GameCallbacks;
  private sprites: SpriteSet;
  private bg: HTMLCanvasElement;
  private dpr: number;
  private raf = 0;
  private lastTs = 0;
  private time = 0;

  private phase: Phase = 'countdown';
  private phaseT = 3.2;
  private paused = false;
  private wave = 0;
  private toSpawn = 0;
  private bossPending = false;
  private tntSpawned = false;
  private spawnTimer = 0;
  private nextId = 1;

  private mobs: Mob[] = [];
  private arrows: Arrow[] = [];
  private particles: Particle[] = [];
  private texts: FloatText[] = [];
  private orbs: Orb[] = [];
  private clouds: Cloud[] = [];
  private lockedId: number | null = null;
  private lastNextKey: string | null | undefined = undefined;

  private hearts: number;
  private score = 0;
  private displayScore = 0;
  private combo = 0;
  private maxCombo = 0;
  private correct = 0;
  private wrong = 0;
  private kills = 0;
  private escaped = 0;
  private heartsLost = 0;
  private playTime = 0;
  private missedKeys: Record<string, number> = {};
  private shakeT = 0;
  private shakeMag = 0;
  private hurtFlash = 0;
  private steveRecoil = 0;
  private victory = false;
  private lastCountdown = 4;

  constructor(canvas: HTMLCanvasElement, cfg: GameConfig, cb: GameCallbacks = {}) {
    this.canvas = canvas;
    this.cfg = cfg;
    this.cb = cb;
    this.hearts = cfg.hearts;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * this.dpr;
    canvas.height = H * this.dpr;
    this.ctx = canvas.getContext('2d')!;
    this.sprites = getSprites();
    this.bg = renderBackground(this.dpr, cfg.biome ?? 'plains');
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: Math.random() * W,
        y: 30 + Math.random() * 140,
        w: 60 + Math.random() * 90,
        h: 18 + Math.random() * 16,
        speed: 6 + Math.random() * 10,
      });
    }
  }

  start() {
    this.lastTs = performance.now();
    const loop = (ts: number) => {
      const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
      this.lastTs = ts;
      this.update(dt);
      this.render();
      if (this.phase !== 'ended') this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.phase = 'ended';
  }

  isPaused() {
    return this.paused;
  }

  setPaused(p: boolean) {
    if (this.phase === 'ended' || this.phase === 'ending') return;
    this.paused = p;
    if (!p) this.lastTs = performance.now();
    // render once so the pause overlay shows up even though time stops
    this.render();
  }

  // ── Input ────────────────────────────────────────────────────────────────

  handleKey(raw: string) {
    if (this.paused || this.phase === 'countdown' || this.phase === 'ending' || this.phase === 'ended') return;
    const key = raw.toLowerCase();

    let mob = this.lockedId !== null ? this.mobs.find((m) => m.id === this.lockedId && !m.dying) : undefined;
    if (!mob) {
      this.lockedId = null;
      const candidates = this.visibleMobs().filter((m) => m.target.answer[0] === key);
      candidates.sort((a, b) => a.x - b.x);
      mob = candidates[0];
      if (mob) this.lockedId = mob.id;
    }

    if (mob && mob.target.answer[mob.progress] === key) {
      this.hitKey(mob, key);
    } else {
      this.missKey(key);
    }
    this.emitNextKey();
  }

  private visibleMobs() {
    return this.mobs.filter((m) => !m.dying && m.x < W - 10);
  }

  private hitKey(mob: Mob, key: string) {
    mob.progress++;
    this.correct++;
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    const wordCompleted = mob.progress >= mob.target.answer.length;
    let final = false;

    if (wordCompleted) {
      if (mob.kind === 'boss' && mob.bossHp && mob.bossHp > 1) {
        // Boss word completed, but boss still has more HP rounds left!
        final = false;
      } else {
        mob.dying = true;
        this.lockedId = null;
        final = true;
      }
    }

    this.fireArrow(mob, final);
    this.sfx('shoot', Math.min(10, Math.floor(this.combo / 5)));
    if (this.combo > 0 && this.combo % 5 === 0) {
      this.sfx('combo');
      const hot = this.combo >= 20 ? '#FF1744' : this.combo >= 10 ? '#FF9100' : '#FFD600';
      this.texts.push({
        x: W / 2, y: 140, text: this.cfg.labels.combo(this.combo),
        color: hot, size: 52, life: 1.25, maxLife: 1.25, outline: '#000000',
      });
      this.shake(6, 0.2);
    }
    this.cb.onKeyResult?.(key, true);
  }

  private missKey(key: string) {
    const expected = this.currentExpected();
    this.wrong++;
    this.combo = 0;
    if (expected) this.missedKeys[expected] = (this.missedKeys[expected] ?? 0) + 1;
    const locked = this.mobs.find((m) => m.id === this.lockedId);
    const nearest = locked ?? this.visibleMobs().sort((a, b) => a.x - b.x)[0];
    if (nearest) nearest.shake = 0.3;
    this.texts.push({
      x: ARROW_ORIGIN.x + 10, y: ARROW_ORIGIN.y - 50, text: '✗',
      color: '#FF5252', size: 36, life: 0.6, maxLife: 0.6,
    });
    this.sfx('wrong');
    this.cb.onKeyResult?.(key, false);
  }

  private currentExpected(): string | null {
    const locked = this.mobs.find((m) => m.id === this.lockedId && !m.dying);
    if (locked) return locked.target.answer[locked.progress] ?? null;
    const closest = this.visibleMobs().sort((a, b) => a.x - b.x)[0];
    return closest ? closest.target.answer[0] : null;
  }

  private emitNextKey() {
    const next = this.phase === 'playing' || this.phase === 'banner' ? this.currentExpected() : null;
    if (next !== this.lastNextKey) {
      this.lastNextKey = next;
      this.cb.onNextKey?.(next);
    }
  }

  // ── Spawning & waves ────────────────────────────────────────────────────

  private startWave(i: number) {
    this.wave = i;
    this.toSpawn = this.cfg.mobsPerWave[i] ?? 8;
    this.bossPending = i === this.cfg.waves - 1;
    this.tntSpawned = false;
    this.spawnTimer = 0.3;
    this.phase = 'banner';
    this.phaseT = 2.2;
    this.sfx(this.bossPending ? 'boss' : 'wave');
  }

  private waveSpeed() {
    const waveProgress = this.wave / Math.max(1, this.cfg.waves - 1);
    return this.cfg.baseSpeed * (1 + waveProgress * 0.55);
  }

  private spawnMob(boss = false) {
    const used = new Set(this.mobs.filter((m) => !m.dying).map((m) => m.target.answer[0]));
    let kind: MobKind;
    if (boss) kind = 'boss';
    else if (!this.tntSpawned && this.wave >= 1 && Math.random() < 0.12) {
      kind = 'tnt';
      this.tntSpawned = true;
    } else {
      const kinds: MobKind[] = ['zombie', 'creeper', 'skeleton'];
      kind = kinds[Math.floor(Math.random() * kinds.length)];
    }
    // pick a free lane if possible
    const laneBusy = (lane: number) =>
      this.mobs.some((m) => !m.dying && m.y === lane && m.x > SPAWN_X - 140);
    const freeLanes = LANES.filter((l) => !laneBusy(l));
    const y = boss ? LANES[1] : (freeLanes.length ? freeLanes : LANES)[Math.floor(Math.random() * (freeLanes.length || LANES.length))];

    const speed = this.waveSpeed() * (boss ? 0.55 : kind === 'tnt' ? 1.15 : 0.9 + Math.random() * 0.2);
    const bossMaxHp = boss ? (this.cfg.bossHp ?? 4) : undefined;
    this.mobs.push({
      id: this.nextId++,
      kind,
      x: SPAWN_X,
      y,
      speed,
      target: boss ? this.cfg.bossTarget() : this.cfg.nextTarget(used),
      progress: 0,
      dying: false,
      scale: boss ? BOSS_SCALE : MOB_SCALE,
      damage: boss ? 2 : 1,
      walkT: Math.random(),
      flash: 0,
      shake: 0,
      hissed: false,
      atWall: false,
      attackT: 0,
      hopT: Math.random() * Math.PI,
      bossHp: bossMaxHp,
      bossMaxHp,
    });
  }

  private maxAlive() {
    return Math.min(8, 4 + Math.floor(this.wave / 2));
  }

  // ── Combat ─────────────────────────────────────────────────────────────

  private mobCenter(m: Mob) {
    const spr = this.sprites.mobs[m.kind][0];
    return { x: m.x, y: m.y - (spr.height * m.scale) / 2 };
  }

  private fireArrow(mob: Mob, final: boolean) {
    const c = this.mobCenter(mob);
    const dx = c.x - ARROW_ORIGIN.x;
    const dy = c.y - ARROW_ORIGIN.y;
    const flight = Math.max(0.18, Math.hypot(dx, dy) / 1100);
    this.arrows.push({
      x: ARROW_ORIGIN.x,
      y: ARROW_ORIGIN.y,
      vx: dx / flight,
      vy: dy / flight - 0.5 * GRAVITY * flight,
      t: 0,
      flight,
      mobId: mob.id,
      final,
    });
    this.steveRecoil = 0.12;
  }

  private burst(x: number, y: number, colors: string[], count: number, power: number) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = power * (0.3 + Math.random() * 0.7);
      const life = 0.5 + Math.random() * 0.6;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - power * 0.4,
        size: 4 + Math.floor(Math.random() * 3) * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life, maxLife: life,
        gravity: 600,
      });
    }
  }

  private killMob(m: Mob, byTnt = false) {
    const c = this.mobCenter(m);
    const big = m.kind === 'boss';
    this.burst(c.x, c.y, MOB_COLORS[m.kind], big ? 90 : 28, big ? 520 : 320);
    this.burst(c.x, c.y, ['#FFFFFF', '#E0E0E0'], big ? 30 : 10, 160);
    const mult = 1 + Math.floor(this.combo / 5);
    const gained = (byTnt ? 5 : 10 * m.target.answer.length) * mult * (big ? 3 : 1);
    this.score += gained;
    this.kills++;
    this.texts.push({
      x: c.x, y: c.y - 30, text: `+${gained}`, color: '#FFEB3B',
      size: big ? 44 : 30, life: 0.9, maxLife: 0.9,
    });

    // 视觉反馈：连续击中/击败时，在敌人上方弹出直观的 Combo 动态连击标识与华丽彩光
    if (this.combo >= 2) {
      const comboColor =
        this.combo >= 20 ? '#FF1744' :
        this.combo >= 10 ? '#FF9100' :
        this.combo >= 5 ? '#FFD600' : '#00E676';
      const comboSize = this.combo >= 20 ? 38 : this.combo >= 10 ? 32 : this.combo >= 5 ? 26 : 22;
      this.texts.push({
        x: c.x,
        y: c.y - 65,
        text: `⚡ COMBO x${this.combo}!`,
        color: comboColor,
        size: comboSize,
        life: 0.95,
        maxLife: 0.95,
        outline: '#000000',
      });
      // 产生对应连击阶梯的华丽光点粒子
      this.burst(c.x, c.y, [comboColor, '#FFFFFF'], Math.min(24, 6 + Math.floor(this.combo / 2)), 240);
    }

    for (let i = 0; i < (big ? 12 : 3); i++) {
      this.orbs.push({ x: c.x, y: c.y, vx: (Math.random() - 0.5) * 300, vy: -150 - Math.random() * 200, t: 0 });
    }
    if (big || m.kind === 'tnt') {
      this.shake(big ? 16 : 12, 0.5);
      this.sfx('explode');
    } else {
      // 随着连击数增加，轻微屏幕微震增强打击爽快感
      if (this.combo >= 5) this.shake(Math.min(8, 2 + Math.floor(this.combo / 5)), 0.15);
      this.sfx('hit');
    }
    this.mobs = this.mobs.filter((x) => x !== m);
    this.cb.onWordDefeated?.(m.target);

    if (m.kind === 'tnt' && !byTnt) {
      // TNT clears the whole screen
      this.texts.push({ x: W / 2, y: 200, text: this.cfg.labels.tnt, color: '#FF7043', size: 56, life: 1.3, maxLife: 1.3 });
      this.burst(c.x, c.y, ['#FF7043', '#FFB300', '#FFEB3B', '#5D4037'], 80, 600);
      for (const other of [...this.mobs]) {
        if (other.x > W) continue;
        if (other.kind === 'boss') {
          other.x = Math.min(SPAWN_X - 60, other.x + 160);
          other.flash = 0.3;
        } else {
          this.killMob(other, true);
        }
      }
      if (this.lockedId !== null && !this.mobs.some((x) => x.id === this.lockedId)) this.lockedId = null;
    }
    if (this.mobs.filter((x) => !x.dying).length === 0) this.spawnTimer = Math.min(this.spawnTimer, 0.6);
  }

  private mobReachesWall(m: Mob) {
    if (this.cfg.practice) {
      m.atWall = true;
      m.x = WALL_X + (m.scale * 6);
      return;
    }
    const c = this.mobCenter(m);
    this.mobs = this.mobs.filter((x) => x !== m);
    if (this.lockedId === m.id) this.lockedId = null;
    const expected = m.target.answer[m.progress];
    if (expected) this.missedKeys[expected] = (this.missedKeys[expected] ?? 0) + 1;
    this.escaped++;
    this.combo = 0;
    const dmg = Math.min(this.hearts, m.damage);
    this.hearts -= dmg;
    this.heartsLost += dmg;
    this.hurtFlash = 0.4;
    if (m.kind === 'creeper' || m.kind === 'tnt') {
      this.burst(c.x, c.y, ['#FFFFFF', '#BDBDBD', '#757575', '#FF7043'], 60, 450);
      this.shake(14, 0.5);
      this.sfx('explode');
    } else {
      this.burst(c.x, c.y, MOB_COLORS[m.kind], 16, 220);
      this.shake(8, 0.3);
      this.sfx('hurt');
    }
    if (this.hearts <= 0) {
      this.victory = false;
      this.phase = 'ending';
      this.phaseT = 1.6;
      this.lockedId = null;
    }
    this.emitNextKey();
  }

  private shake(mag: number, t: number) {
    this.shakeMag = Math.max(this.shakeMag, mag);
    this.shakeT = Math.max(this.shakeT, t);
  }

  private sfx(s: TypingSfx, level = 0) {
    playTypingSfx(s, level);
  }

  // ── Update ─────────────────────────────────────────────────────────────

  private update(dt: number) {
    if (this.paused) return;
    this.time += dt;

    for (const c of this.clouds) {
      c.x -= c.speed * dt;
      if (c.x + c.w < 0) {
        c.x = W + Math.random() * 100;
        c.y = 30 + Math.random() * 140;
      }
    }

    switch (this.phase) {
      case 'countdown': {
        this.phaseT -= dt;
        const n = Math.ceil(this.phaseT - 0.2);
        if (n !== this.lastCountdown && n >= 0) {
          this.lastCountdown = n;
          this.sfx(n === 0 ? 'go' : 'countdown');
        }
        if (this.phaseT <= 0) this.startWave(0);
        break;
      }
      case 'banner':
        this.phaseT -= dt;
        if (this.phaseT <= 0) {
          this.phase = 'playing';
          if (this.bossPending) {
            this.spawnMob(true);
            this.bossPending = false;
          }
        }
        break;
      case 'playing':
        this.playTime += dt;
        this.spawnTimer -= dt;
        if (this.toSpawn > 0 && this.spawnTimer <= 0 && this.mobs.filter((m) => !m.dying).length < this.maxAlive()) {
          this.spawnMob();
          this.toSpawn--;
          const speedRatio = Math.min(1.8, Math.max(0.65, 45 / this.cfg.baseSpeed));
          const waveProgress = this.wave / Math.max(1, this.cfg.waves - 1);
          this.spawnTimer = Math.max(0.7, (2.6 - waveProgress * 1.3) * speedRatio);
        }
        if (this.toSpawn === 0 && !this.bossPending && this.mobs.length === 0 && this.arrows.length === 0) {
          if (this.wave >= this.cfg.waves - 1) {
            this.victory = true;
            this.phase = 'ending';
            this.phaseT = 1.5;
          } else {
            this.startWave(this.wave + 1);
          }
        }
        break;
      case 'ending':
        this.phaseT -= dt;
        if (this.phaseT <= 0) this.finish();
        break;
    }

    // mobs
    for (const m of [...this.mobs]) {
      m.flash = Math.max(0, m.flash - dt);
      m.shake = Math.max(0, m.shake - dt);
      if (m.dying || this.phase === 'ending') continue;
      if (m.atWall) {
        m.attackT += dt;
        continue;
      }
      m.walkT += dt * (m.speed / 18);
      m.hopT += dt * 8;
      m.x -= m.speed * dt;
      if (m.kind === 'creeper' && !m.hissed && m.x < WALL_X + 140) {
        m.hissed = true;
        this.sfx('hiss');
      }
      if (m.x - (this.sprites.mobs[m.kind][0].width * m.scale) / 2 <= WALL_X) this.mobReachesWall(m);
    }

    // arrows
    for (const a of [...this.arrows]) {
      a.t += dt;
      a.vy += GRAVITY * dt;
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      if (a.t >= a.flight) {
        this.arrows = this.arrows.filter((x) => x !== a);
        const mob = this.mobs.find((m) => m.id === a.mobId);
        if (!mob) continue;
        if (a.final) {
          this.killMob(mob);
        } else {
          mob.flash = 0.16;
          if (!mob.atWall) mob.x += mob.kind === 'boss' ? 12 : 6;
          this.burst(a.x, a.y, ['#FFFFFF', '#FFE082'], mob.kind === 'boss' ? 14 : 6, mob.kind === 'boss' ? 220 : 140);

          // Check if this hit completed a boss word stage
          if (mob.kind === 'boss' && mob.progress >= mob.target.answer.length && mob.bossHp && mob.bossHp > 1) {
            mob.bossHp--;
            const remaining = mob.bossHp;
            const maxHp = mob.bossMaxHp || remaining;
            const completedTarget = mob.target;
            mob.target = this.cfg.bossTarget();
            mob.progress = 0;
            mob.shake = 0.35;
            this.shake(8, 0.25);
            this.sfx('hit');
            const c = this.mobCenter(mob);
            this.burst(c.x, c.y, ['#D946EF', '#FF5252', '#FFEB3B'], 26, 340);
            this.texts.push({
              x: c.x,
              y: c.y - 45,
              text: `💥 BOSS 剩余生命: ${remaining}/${maxHp}`,
              color: '#FF5252',
              size: 26,
              life: 1.1,
              maxLife: 1.1,
              outline: '#000000',
            });
            this.cb.onWordDefeated?.(completedTarget);
            this.emitNextKey();
          }
        }
      }
    }

    // particles, texts, orbs
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.y > SCENE.PATH_BOTTOM) {
        p.y = SCENE.PATH_BOTTOM;
        p.vy *= -0.3;
        p.vx *= 0.6;
      }
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const t of this.texts) {
      t.life -= dt;
      t.y -= 40 * dt;
    }
    this.texts = this.texts.filter((t) => t.life > 0);
    const target = { x: W - 120, y: 30 };
    for (const o of this.orbs) {
      o.t += dt;
      if (o.t < 0.35) {
        o.vy += 600 * dt;
        o.x += o.vx * dt;
        o.y += o.vy * dt;
      } else {
        o.x += (target.x - o.x) * Math.min(1, dt * 8);
        o.y += (target.y - o.y) * Math.min(1, dt * 8);
      }
    }
    this.orbs = this.orbs.filter((o) => Math.hypot(o.x - target.x, o.y - target.y) > 12 || o.t < 0.35);

    this.displayScore += (this.score - this.displayScore) * Math.min(1, dt * 10);
    this.shakeT = Math.max(0, this.shakeT - dt);
    if (this.shakeT === 0) this.shakeMag = 0;
    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    this.steveRecoil = Math.max(0, this.steveRecoil - dt);

    this.emitNextKey();
  }

  private finish() {
    this.phase = 'ended';
    this.render();
    const total = this.correct + this.wrong;
    const accuracy = total > 0 ? this.correct / total : 0;
    const minutes = Math.max(this.playTime, 1) / 60;
    const result: GameResult = {
      victory: this.victory,
      correct: this.correct,
      wrong: this.wrong,
      accuracy,
      durationSec: Math.round(this.playTime),
      kpm: Math.round(this.correct / minutes),
      maxCombo: this.maxCombo,
      score: this.score,
      kills: this.kills,
      heartsLost: this.heartsLost,
      escaped: this.escaped,
      missedKeys: this.missedKeys,
      xp: this.kills + Math.round(this.score / 20),
    };
    this.sfx(this.victory ? 'victory' : 'defeat');
    this.cb.onNextKey?.(null);
    this.cb.onEnd?.(result);
  }

  // ── Render ─────────────────────────────────────────────────────────────

  private render() {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    ctx.save();
    if (this.shakeT > 0) {
      ctx.translate((Math.random() - 0.5) * this.shakeMag, (Math.random() - 0.5) * this.shakeMag);
    }
    ctx.drawImage(this.bg, 0, 0, W, H);

    // clouds
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (const c of this.clouds) {
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.fillRect(c.x + c.w * 0.2, c.y - c.h * 0.5, c.w * 0.5, c.h * 0.5);
    }

    this.drawTorch(70, WALL_TOP + 40);
    this.drawTorch(130, WALL_TOP + 40);

    // mobs sorted by depth
    const sorted = [...this.mobs].sort((a, b) => a.y - b.y);
    for (const m of sorted) this.drawMob(m);

    this.drawSteve();

    for (const a of this.arrows) this.drawArrow(a);

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    for (const o of this.orbs) {
      const pulse = 5 + Math.sin(this.time * 20 + o.x) * 1.5;
      ctx.fillStyle = '#C6FF00';
      ctx.fillRect(o.x - pulse / 2, o.y - pulse / 2, pulse, pulse);
      ctx.fillStyle = '#76FF03';
      ctx.fillRect(o.x - 2, o.y - 2, 4, 4);
    }

    // signs on top so they're always readable
    for (const m of sorted) if (!m.dying) this.drawSign(m);

    for (const t of this.texts) {
      const a = Math.min(1, t.life / (t.maxLife * 0.5));
      const pop = 1 + Math.max(0, (t.life - t.maxLife + 0.15) / 0.15) * 0.4;
      this.text(t.text, t.x, t.y, t.size * pop, t.color, a, t.font, t.outline);
    }
    ctx.restore();

    if (this.hurtFlash > 0) {
      ctx.fillStyle = `rgba(229,57,53,${this.hurtFlash * 0.7})`;
      ctx.fillRect(0, 0, W, H);
    }

    this.drawHud();
    this.drawOverlays();
  }

  private drawTorch(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#6D4C2F';
    ctx.fillRect(x, y, 6, 18);
    const f = Math.sin(this.time * 18 + x) * 2;
    ctx.fillStyle = '#FFB300';
    ctx.fillRect(x - 1, y - 8 - f / 2, 8, 9 + f / 2);
    ctx.fillStyle = '#FFF176';
    ctx.fillRect(x + 1, y - 5, 4, 5);
  }

  private drawMob(m: Mob) {
    const ctx = this.ctx;
    const frame = Math.floor(m.walkT) % 2;
    const flashOn = m.flash > 0 || (m.kind === 'creeper' && m.hissed && Math.floor(this.time * 8) % 2 === 0);
    const img = (flashOn ? this.sprites.mobsWhite : this.sprites.mobs)[m.kind][m.atWall ? 0 : frame];
    const w = img.width * m.scale;
    const h = img.height * m.scale;
    let x = m.x - w / 2;
    let y = m.y - h;
    if (m.kind === 'tnt') y -= Math.abs(Math.sin(m.hopT)) * 14;
    if (m.atWall) x += Math.sin(m.attackT * 10) * 4;
    if (m.shake > 0) x += Math.sin(m.shake * 80) * 5;

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(m.x - w * 0.4, m.y - 4, w * 0.8, 6);

    ctx.globalAlpha = m.dying ? 0.6 : 1;
    ctx.drawImage(img, x, y, w, h);
    ctx.globalAlpha = 1;

    if (m.kind === 'boss' && !m.dying) {
      // health bar = remaining rounds & word progress
      const maxHp = m.bossMaxHp || 1;
      const curHp = m.bossHp ?? 1;
      const wordRemain = Math.max(0, 1 - m.progress / Math.max(1, m.target.answer.length));
      const totalRatio = Math.max(0, Math.min(1, (curHp - 1 + wordRemain) / maxHp));

      ctx.fillStyle = '#000';
      ctx.fillRect(m.x - 55, y - 22, 110, 12);
      ctx.fillStyle = '#4A044E';
      ctx.fillRect(m.x - 53, y - 20, 106, 8);
      ctx.fillStyle = '#D946EF';
      ctx.fillRect(m.x - 53, y - 20, 106 * totalRatio, 8);

      // HP pip notches
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      for (let s = 1; s < maxHp; s++) {
        ctx.fillRect(m.x - 53 + (106 / maxHp) * s, y - 20, 2, 8);
      }
    }
  }

  private drawSign(m: Mob) {
    const ctx = this.ctx;
    const img = this.sprites.mobs[m.kind][0];
    const top = m.y - img.height * m.scale - (m.kind === 'boss' ? 30 : 12) - (m.kind === 'tnt' ? 14 : 0);
    const chars = m.target.display.split('');
    const size = m.kind === 'boss' ? 34 : chars.length > 1 ? 30 : 40;
    ctx.font = `bold ${size}px "Arial Black", "Microsoft YaHei", sans-serif`;
    const widths = chars.map((c) => Math.max(ctx.measureText(c).width, size * 0.55));
    const gap = chars.length > 1 ? 4 : 0;
    const textW = widths.reduce((s, w) => s + w, 0) + gap * (chars.length - 1);
    const padX = 12;
    const boxW = textW + padX * 2;
    const aligned = m.target.display.toLowerCase() === m.target.answer;
    const hasHint = !!m.target.hint;
    const showAnswerPreview = !aligned && !m.target.hideAnswerPreview;
    const boxH = size + 16 + (hasHint ? 22 : 0) + (showAnswerPreview ? 18 : 0);
    const bx = m.x - boxW / 2 + (m.shake > 0 ? Math.sin(m.shake * 80) * 5 : 0);
    const by = top - boxH;
    const locked = m.id === this.lockedId;

    ctx.fillStyle = locked ? 'rgba(255,193,7,0.95)' : 'rgba(0,0,0,0.65)';
    ctx.fillRect(bx - 3, by - 3, boxW + 6, boxH + 6);
    ctx.fillStyle = locked ? 'rgba(30,30,30,0.92)' : 'rgba(20,20,20,0.75)';
    ctx.fillRect(bx, by, boxW, boxH);
    // little pointer
    ctx.fillStyle = locked ? 'rgba(255,193,7,0.95)' : 'rgba(0,0,0,0.65)';
    ctx.fillRect(m.x - 5, by + boxH + 3, 10, 6);

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    let cx = bx + padX;
    const cy = by + 7 + size / 2;
    // answer and display may differ (e.g. Chinese or math), so only colour per char when they align
    chars.forEach((c, i) => {
      let color = '#FFFFFF';
      if (aligned) {
        if (i < m.progress) color = '#69F0AE';
        else if (i === m.progress && locked) color = '#FFD54F';
      } else if (locked) color = '#FFD54F';
      ctx.fillStyle = '#000';
      ctx.fillText(c, cx + 2, cy + 2);
      ctx.fillStyle = color;
      ctx.fillText(c, cx, cy);
      if (aligned && i === m.progress && locked) {
        ctx.fillRect(cx, cy + size / 2 - 2, widths[i], 3);
      }
      cx += widths[i] + gap;
    });

    if (m.target.hint) {
      ctx.font = `bold 15px "Microsoft YaHei", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFE082';
      ctx.fillText(m.target.hint, m.x, by + size + 15);
    }
    if (showAnswerPreview) {
      // Draw pinyin letters progress below
      const ans = m.target.answer;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      const ansW = 12;
      const startX = m.x - (ans.length * ansW) / 2 + ansW / 2;
      const pyY = by + boxH - 10;
      for (let i = 0; i < ans.length; i++) {
        const letter = ans[i];
        const isTyped = i < m.progress;
        const isCurrent = i === m.progress && locked;
        ctx.fillStyle = isTyped ? '#69F0AE' : isCurrent ? '#FFD54F' : '#9E9E9E';
        ctx.fillText(letter, startX + i * ansW, pyY);
        if (isCurrent) {
          ctx.fillRect(startX + i * ansW - 4, pyY + 7, 8, 2);
        }
      }
    }

    if (locked) {
      // crosshair over the mob
      const c = this.mobCenter(m);
      const r = 10 + Math.sin(this.time * 10) * 2;
      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 3;
      ctx.strokeRect(c.x - r, c.y - r, r * 2, r * 2);
    }
  }

  private drawSteve() {
    const img = this.sprites.steve;
    const s = 4;
    const x = 105 - (img.width * s) / 2 - this.steveRecoil * 30;
    const y = WALL_TOP - img.height * s;
    this.ctx.drawImage(img, x, y, img.width * s, img.height * s);
  }

  private drawArrow(a: Arrow) {
    const ctx = this.ctx;
    const ang = Math.atan2(a.vy, a.vx);
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(ang);
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(-18, -1.5, 30, 3);
    ctx.fillStyle = '#B0BEC5';
    ctx.fillRect(12, -3, 6, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-20, -4, 6, 3);
    ctx.fillRect(-20, 1, 6, 3);
    ctx.restore();
  }

  private text(str: string, x: number, y: number, size: number, color: string, alpha = 1, font?: string, outline?: string) {
    const ctx = this.ctx;
    ctx.globalAlpha = alpha;
    ctx.font = `${size}px ${font ?? this.cfg.pixelFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (outline) {
      ctx.strokeStyle = outline;
      ctx.lineWidth = Math.max(3, Math.floor(size / 8));
      ctx.strokeText(str, x, y);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillText(str, x + 3, y + 3);
    }
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
    ctx.globalAlpha = 1;
  }

  private drawHud() {
    const ctx = this.ctx;
    // hearts
    if (!this.cfg.practice) {
      const hs = 4;
      for (let i = 0; i < this.cfg.hearts; i++) {
        const img = i < this.hearts ? this.sprites.heart : this.sprites.heartEmpty;
        const bob = i < this.hearts && this.hearts <= 2 ? Math.sin(this.time * 12 + i) * 2 : 0;
        ctx.drawImage(img, 16 + i * 34, 14 + bob, img.width * hs, img.height * hs);
      }
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(16, 10, 160, 34);
      this.text('💚 练习模式 ∞', 96, 28, 22, '#69F0AE');
    }
    // wave
    const totalWaves = this.cfg.waves;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(W / 2 - 90, 10, 180, 34);
    this.text(this.cfg.labels.wave(Math.min(this.wave + 1, totalWaves), totalWaves), W / 2, 28, 30, '#FFFFFF');
    // score
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(W - 200, 10, 186, 34);
    ctx.fillStyle = '#C6FF00';
    ctx.fillRect(W - 190, 21, 12, 12);
    this.text(String(Math.round(this.displayScore)).padStart(6, '0'), W - 100, 28, 32, '#FFEB3B');
    // combo
    if (this.combo >= 3) {
      const hot = this.combo >= 20 ? '#FF5722' : this.combo >= 10 ? '#FF9800' : '#FFEB3B';
      const pulse = 1 + Math.sin(this.time * 12) * 0.05;
      this.text(`COMBO x${this.combo}`, W - 107, 66, 30 * pulse, hot);
    }

    // Ender Dragon Boss Bar
    const boss = this.mobs.find((m) => m.kind === 'boss' && !m.dying);
    if (boss) {
      const barW = 340;
      const barH = 14;
      const bx = W / 2 - barW / 2;
      const by = 56;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(bx - 3, by - 3, barW + 6, barH + 6);
      ctx.fillStyle = '#4A044E';
      ctx.fillRect(bx, by, barW, barH);

      const maxHp = boss.bossMaxHp || 1;
      const curHp = boss.bossHp ?? 1;
      // Overall progress: (curHp - 1 + (1 - progress/len)) / maxHp
      const wordRemain = Math.max(0, 1 - boss.progress / Math.max(1, boss.target.answer.length));
      const totalRatio = Math.max(0, Math.min(1, (curHp - 1 + wordRemain) / maxHp));

      ctx.fillStyle = '#D946EF';
      ctx.fillRect(bx, by, barW * totalRatio, barH);

      // Notches per HP round
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      for (let s = 1; s < maxHp; s++) {
        ctx.fillRect(bx + (barW / maxHp) * s, by, 2, barH);
      }
      this.text(`🐲 末影龙 BOSS (生命: ${curHp}/${maxHp})`, W / 2, by - 12, 18, '#F5D0FE');
    }
  }

  private drawOverlays() {
    const ctx = this.ctx;
    if (this.phase === 'countdown') {
      const n = Math.ceil(this.phaseT - 0.2);
      const frac = this.phaseT - 0.2 - Math.floor(this.phaseT - 0.2);
      const label = n > 0 ? String(n) : this.cfg.labels.go;
      this.text(label, W / 2, H / 2 - 40, 120 + frac * 60, n > 0 ? '#FFFFFF' : '#69F0AE');
    }
    if (this.phase === 'banner') {
      const isBoss = this.wave === this.cfg.waves - 1;
      const t = 2.2 - this.phaseT;
      const slide = Math.min(1, t / 0.3);
      ctx.fillStyle = isBoss ? 'rgba(80,0,0,0.6)' : 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, H / 2 - 110, W * slide, 90);
      const label = isBoss ? this.cfg.labels.bossWave : this.cfg.labels.wave(this.wave + 1, this.cfg.waves);
      this.text(label, W / 2, H / 2 - 65, 64, isBoss ? '#FF5252' : '#FFFFFF', slide);
    }
    if (this.phase === 'ending' || this.phase === 'ended') {
      const t = this.victory ? this.cfg.labels.victory : this.cfg.labels.defeat;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, W, H);
      this.text(t, W / 2, H / 2 - 40, 90, this.victory ? '#FFD54F' : '#FF5252');
    }
    if (this.paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, H);
      this.text(this.cfg.labels.paused, W / 2, H / 2 - 30, 80, '#FFFFFF');
      this.text(this.cfg.labels.pausedHint, W / 2, H / 2 + 40, 32, '#B0BEC5');
    }
  }
}
