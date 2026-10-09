/**
 * Minecart Runner (矿车大狂飙) Canvas typing game engine.
 *
 * Horizontal runner on rails:
 * Minecart speeds forward, tracks and cavern scroll by with parallax.
 * Obstacles (creeper blocks, switches, golden apples) appear ahead on the track.
 * Typing correctly smashes obstacles, switches rails, and triggers rocket boost!
 */

import { playTypingSfx } from './sounds';
import type { GameConfig, GameResult, GameCallbacks } from './game-engine';
import type { TypingTarget } from './lessons';

const W = 960;
const H = 540;
const RAIL_Y = 400;
const CART_X = 180;

interface TrackNode {
  id: number;
  x: number;
  type: 'obstacle' | 'switch' | 'golden_apple';
  target: TypingTarget;
  progress: number;
  cleared: boolean;
}

interface PixelParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export class RunnerGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: GameConfig;
  private callbacks: GameCallbacks;

  private running = false;
  private paused = false;
  private animId = 0;
  private lastTime = 0;

  // Stats
  private startTime = 0;
  private totalChars = 0;
  private correctChars = 0;
  private wrongChars = 0;
  private combo = 0;
  private maxCombo = 0;
  private hearts: number;
  private missedKeys: Record<string, number> = {};

  // World state
  private nodes: TrackNode[] = [];
  private currentNodeIdx = 0;
  private trackOffset = 0;
  private baseSpeed = 160;
  private cartHopY = 0;
  private isBoosting = false;
  private particles: PixelParticle[] = [];

  constructor(canvas: HTMLCanvasElement, config: GameConfig, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = config;
    this.callbacks = callbacks;
    this.hearts = config.practice ? 5 : config.hearts;
    this.baseSpeed = config.baseSpeed * 4.2;

    this.initNodes();
  }

  private initNodes() {
    const totalItems = this.config.mobsPerWave.reduce((a, b) => a + b, 0);
    const exclude = new Set<string>();

    this.nodes = [];
    const nodeTypes: TrackNode['type'][] = ['obstacle', 'switch', 'golden_apple'];

    let currentSpawnX = 850;
    const spacing = 480; // Distance between upcoming obstacles

    for (let i = 0; i < totalItems; i++) {
      const type =
        i === totalItems - 1
          ? 'golden_apple'
          : nodeTypes[i % nodeTypes.length];

      const target =
        i === totalItems - 1
          ? this.config.bossTarget()
          : this.config.nextTarget(exclude);
      exclude.add(target.answer);

      this.nodes.push({
        id: i,
        x: currentSpawnX,
        type,
        target,
        progress: 0,
        cleared: false,
      });

      currentSpawnX += spacing;
    }

    this.currentNodeIdx = 0;
  }

  public start() {
    this.running = true;
    this.paused = false;
    this.startTime = performance.now();
    this.lastTime = performance.now();

    this.notifyNextKey();
    this.loop(performance.now());
  }

  public destroy() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  public setPaused(paused: boolean) {
    this.paused = paused;
    if (!paused) {
      this.lastTime = performance.now();
    }
  }

  public isPaused(): boolean {
    return this.paused;
  }

  private notifyNextKey() {
    const cur = this.nodes[this.currentNodeIdx];
    if (cur && !cur.cleared) {
      const nextChar = cur.target.answer[cur.progress];
      this.callbacks.onNextKey?.(nextChar || null);
    } else {
      this.callbacks.onNextKey?.(null);
    }
  }

  public handleKey(key: string) {
    if (!this.running || this.paused) return;
    const cur = this.nodes[this.currentNodeIdx];
    if (!cur || cur.cleared) return;

    this.totalChars++;
    const expected = cur.target.answer[cur.progress];

    if (key === expected) {
      this.correctChars++;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      cur.progress++;
      this.cartHopY = -6;
      this.callbacks.onKeyResult?.(key, true);

      // Check if boosting (combo >= 4)
      if (this.combo >= 4 && !this.isBoosting) {
        this.isBoosting = true;
        playTypingSfx('boost');
      }

      if (cur.progress >= cur.target.answer.length) {
        // Cleared obstacle node!
        cur.cleared = true;
        this.callbacks.onWordDefeated?.(cur.target);

        if (cur.type === 'switch') {
          playTypingSfx('railSwitch');
        } else if (cur.type === 'golden_apple') {
          playTypingSfx('coin');
        } else {
          playTypingSfx('hit', Math.min(5, Math.floor(this.combo / 3)));
        }

        this.spawnObstacleShards(cur.x, RAIL_Y - 40, cur.type);

        this.currentNodeIdx++;
        if (this.currentNodeIdx >= this.nodes.length) {
          // Reached golden terminal!
          setTimeout(() => {
            this.finishGame(true);
          }, 800);
        }
      } else {
        playTypingSfx('hit');
      }

      this.notifyNextKey();
    } else {
      // Wrong key
      this.wrongChars++;
      this.combo = 0;
      this.isBoosting = false;
      this.missedKeys[expected] = (this.missedKeys[expected] || 0) + 1;
      this.callbacks.onKeyResult?.(key, false);
      playTypingSfx('wrong');
    }
  }

  private spawnObstacleShards(x: number, y: number, type: TrackNode['type']) {
    const colors: Record<TrackNode['type'], string[]> = {
      obstacle: ['#15803D', '#22C55E', '#166534', '#4ADE80'], // Creeper green
      switch: ['#78350F', '#B45309', '#F59E0B', '#D97706'], // Oak lever brown
      golden_apple: ['#FBBF24', '#F59E0B', '#FEF08A', '#FCD34D'], // Gold
    };
    const pool = colors[type];

    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 220;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        color: pool[Math.floor(Math.random() * pool.length)],
        size: 5 + Math.random() * 5,
        life: 0.5,
        maxLife: 0.5,
      });
    }
  }

  private finishGame(victory: boolean) {
    this.running = false;
    const duration = (performance.now() - this.startTime) / 1000;
    const totalTyped = this.correctChars + this.wrongChars;
    const accuracy = totalTyped > 0 ? this.correctChars / totalTyped : 1;
    const kpm = duration > 0 ? Math.round((this.correctChars / duration) * 60) : 0;
    const score = Math.max(0, this.correctChars * 25 - this.wrongChars * 10 + this.maxCombo * 60);

    const result: GameResult = {
      victory,
      correct: this.correctChars,
      wrong: this.wrongChars,
      accuracy,
      durationSec: Math.round(duration),
      kpm,
      maxCombo: this.maxCombo,
      score,
      kills: this.currentNodeIdx,
      heartsLost: (this.config.practice ? 5 : this.config.hearts) - this.hearts,
      escaped: 0,
      missedKeys: this.missedKeys,
      xp: Math.round(score * 0.45),
    };

    if (victory) playTypingSfx('victory');
    else playTypingSfx('defeat');

    this.callbacks.onEnd?.(result);
  }

  private update(dt: number) {
    const curSpeed = this.isBoosting ? this.baseSpeed * 1.4 : this.baseSpeed;

    // Cart hop damping
    if (this.cartHopY < 0) this.cartHopY += dt * 30;
    else this.cartHopY = 0;

    // Move track texture
    this.trackOffset = (this.trackOffset + curSpeed * dt) % 60;

    // Move obstacles towards cart (from right to left)
    const cur = this.nodes[this.currentNodeIdx];

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node.cleared) continue;

      // Obstacle stops at cart in practice mode
      if (this.config.practice && node === cur && node.x <= CART_X + 90) {
        node.x = CART_X + 90;
      } else {
        node.x -= curSpeed * dt;
      }

      // Check collision with minecart in challenge mode
      if (!this.config.practice && node === cur && node.x <= CART_X + 40) {
        // Crash into obstacle!
        playTypingSfx('hurt');
        this.hearts--;
        this.combo = 0;
        this.isBoosting = false;
        node.cleared = true;
        this.spawnObstacleShards(node.x, RAIL_Y - 40, node.type);

        this.currentNodeIdx++;
        if (this.hearts <= 0) {
          this.finishGame(false);
          return;
        }
      }
    }

    // Rocket boost fire particles from back of cart
    if (this.isBoosting) {
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          x: CART_X - 25,
          y: RAIL_Y - 15 + (Math.random() - 0.5) * 10,
          vx: -240 - Math.random() * 80,
          vy: (Math.random() - 0.5) * 60,
          color: Math.random() > 0.4 ? '#38BDF8' : '#818CF8',
          size: 4 + Math.random() * 4,
          life: 0.25,
          maxLife: 0.25,
        });
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt; // gravity
    }
  }

  private render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);

    // Cavern background with parallax
    this.renderCavernBackground(ctx);

    // Rails & track ties
    this.renderRails(ctx);

    // Track obstacles
    this.renderObstacles(ctx);

    // Steve in Minecart
    this.renderMinecart(ctx, CART_X, RAIL_Y - 20 + this.cartHopY);

    // Particles
    this.renderParticles(ctx);

    // HUD
    this.renderHUD(ctx);

    // Pause overlay
    if (this.paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#FDE047';
      ctx.font = `bold 36px ${this.config.pixelFont}`;
      ctx.textAlign = 'center';
      ctx.fillText('游戏暂停 (PAUSED)', W / 2, H / 2 - 10);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold 18px ${this.config.pixelFont}`;
      ctx.fillText('按 ESC 或 空格 继续', W / 2, H / 2 + 30);
    }
  }

  private renderCavernBackground(ctx: CanvasRenderingContext2D) {
    // Top gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, RAIL_Y);
    skyGrad.addColorStop(0, '#0F172A');
    skyGrad.addColorStop(1, '#1E293B');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, RAIL_Y);

    // Stalactite silhouettes hanging from ceiling
    ctx.fillStyle = '#111827';
    for (let x = 0; x < W; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 50, 0);
      ctx.lineTo(x + 25, 45 + ((x * 13) % 40));
      ctx.closePath();
      ctx.fill();
    }

    // Glow lichen specks in background
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(180, 120, 6, 6);
    ctx.fillRect(420, 90, 8, 8);
    ctx.fillRect(680, 140, 6, 6);
    ctx.fillRect(840, 110, 7, 7);

    // Ground bedrock below rails
    ctx.fillStyle = '#1E232A';
    ctx.fillRect(0, RAIL_Y, W, H - RAIL_Y);
  }

  private renderRails(ctx: CanvasRenderingContext2D) {
    // Gravel foundation below rails
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, RAIL_Y - 6, W, 8);

    // Wooden cross ties moving backwards
    ctx.fillStyle = '#78350F';
    const tieWidth = 14;
    const tieSpacing = 40;
    for (let x = -tieSpacing; x < W + tieSpacing; x += tieSpacing) {
      const drawX = x - this.trackOffset;
      ctx.fillRect(drawX, RAIL_Y - 8, tieWidth, 12);
    }

    // Upper and lower iron rails (grey bars)
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(0, RAIL_Y - 9, W, 4);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(0, RAIL_Y - 2, W, 3);
  }

  private renderObstacles(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node.cleared || node.x < -100 || node.x > W + 100) continue;

      const isCurrent = i === this.currentNodeIdx;
      const x = node.x;
      const y = RAIL_Y - 20;

      // Obstacle sprite
      if (node.type === 'obstacle') {
        // Creeper Face Block
        ctx.fillStyle = '#15803D';
        ctx.fillRect(x - 24, y - 48, 48, 48);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 24, y - 48, 48, 48);

        // Black Creeper mouth & eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 16, y - 40, 8, 8); // eye L
        ctx.fillRect(x + 8, y - 40, 8, 8);  // eye R
        ctx.fillRect(x - 8, y - 28, 16, 14); // mouth
      } else if (node.type === 'switch') {
        // Rail Switch Lever
        ctx.fillStyle = '#78350F';
        ctx.fillRect(x - 14, y - 24, 28, 24);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 14, y - 24, 28, 24);

        // Angled Redstone Lever
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x, y - 20);
        ctx.lineTo(x + 12, y - 48);
        ctx.stroke();
      } else {
        // Golden Apple Ring
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(x, y - 35, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(x - 4, y - 39, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Typing Billboard Billboard
      this.renderTargetBillboard(ctx, x, y - 75, node.target, node.progress, isCurrent);
    }
  }

  private renderTargetBillboard(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    target: TypingTarget,
    progress: number,
    isCurrent: boolean,
  ) {
    const text = target.display;
    ctx.font = `bold 24px ${this.config.pixelFont}`;
    const tw = Math.max(80, ctx.measureText(text).width + 30);
    const th = 44;

    // Billboard box
    ctx.fillStyle = isCurrent ? 'rgba(30, 35, 42, 0.95)' : 'rgba(20, 24, 30, 0.75)';
    ctx.fillRect(x - tw / 2, y - th / 2, tw, th);
    ctx.strokeStyle = isCurrent ? '#FACC15' : '#475569';
    ctx.lineWidth = isCurrent ? 3 : 2;
    ctx.strokeRect(x - tw / 2, y - th / 2, tw, th);

    // Display string
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, x, y + 8);

    // Typed progress indicator
    if (isCurrent && target.answer.length > 1) {
      const ans = target.answer;
      const typed = ans.slice(0, progress);
      const remaining = ans.slice(progress);

      ctx.font = `bold 16px ${this.config.pixelFont}`;
      const totalW = ctx.measureText(ans).width;
      let startX = x - totalW / 2;

      ctx.textAlign = 'left';
      ctx.fillStyle = '#4ADE80';
      ctx.fillText(typed, startX, y + th / 2 + 16);
      startX += ctx.measureText(typed).width;

      ctx.fillStyle = '#FDE047';
      ctx.fillText(remaining, startX, y + th / 2 + 16);
    }
  }

  private renderMinecart(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    // Steve inside Minecart
    ctx.fillStyle = '#C68642'; // Head
    ctx.fillRect(-12, -42, 24, 20);
    ctx.fillStyle = '#4A2A0C'; // Hair
    ctx.fillRect(-12, -42, 24, 6);
    // Steve Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-8, -32, 5, 4);
    ctx.fillRect(3, -32, 5, 4);
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(-6, -32, 3, 4);
    ctx.fillRect(5, -32, 3, 4);

    // Cyan Shirt Body
    ctx.fillStyle = '#06B6D4';
    ctx.fillRect(-14, -22, 28, 16);

    // Minecart Metal Tub (Grey Iron)
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(-28, -14, 56, 22);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-28, 4, 56, 4);

    // Iron Rivets & Outline
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    ctx.strokeRect(-28, -14, 56, 22);

    // Minecart Wheels (rotating)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(-16, 12, 6, 0, Math.PI * 2);
    ctx.arc(16, 12, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D) {
    // Speedometer / Distance (Right Panel)
    ctx.fillStyle = '#1E232A';
    ctx.fillRect(W - 150, 20, 130, 60);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(W - 150, 20, 130, 60);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = `bold 12px ${this.config.pixelFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('狂飙时速', W - 85, 40);

    ctx.fillStyle = this.isBoosting ? '#38BDF8' : '#FACC15';
    ctx.font = `bold 20px ${this.config.pixelFont}`;
    ctx.fillText(this.isBoosting ? '⚡ 85 km/h' : '🚂 45 km/h', W - 85, 68);

    // Progress counter (Left Panel)
    ctx.fillStyle = '#1E232A';
    ctx.fillRect(20, 20, 130, 60);
    ctx.strokeRect(20, 20, 130, 60);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = `bold 12px ${this.config.pixelFont}`;
    ctx.fillText('冲刺进度', 85, 40);

    ctx.fillStyle = '#4ADE80';
    ctx.font = `bold 20px ${this.config.pixelFont}`;
    ctx.fillText(`${this.currentNodeIdx} / ${this.nodes.length}`, 85, 68);

    // Hearts (Top center)
    ctx.textAlign = 'left';
    ctx.font = '22px sans-serif';
    for (let h = 0; h < 5; h++) {
      ctx.fillText(h < this.hearts ? '❤️' : '🖤', W / 2 - 65 + h * 26, 38);
    }

    // Boost & Combo Indicator
    if (this.combo > 2) {
      ctx.fillStyle = this.isBoosting ? '#38BDF8' : '#F59E0B';
      ctx.font = `bold 18px ${this.config.pixelFont}`;
      ctx.textAlign = 'center';
      ctx.fillText(
        this.isBoosting ? `🚀 超速狂飙连击 x${this.combo}！` : `🔥 连击 x${this.combo}`,
        W / 2,
        72,
      );
    }
  }

  private loop = (time: number) => {
    if (!this.running) return;
    const dt = Math.min(0.1, (time - this.lastTime) / 1000);
    this.lastTime = time;

    if (!this.paused) {
      this.update(dt);
    }
    this.render();

    this.animId = requestAnimationFrame(this.loop);
  };
}
