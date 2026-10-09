/**
 * Minecart Runner (矿车大狂飙) Canvas typing game engine.
 *
 * Horizontal runner on rails:
 * Minecart speeds forward, tracks and cavern scroll by with parallax.
 * Obstacles (TNT blocks, switches, golden apples) appear ahead on the track.
 * Typing correctly smashes obstacles, switches rails, and triggers rocket boost!
 */

import { playTypingSfx } from './sounds';
import type { GameConfig, GameResult, GameCallbacks } from './game-engine';
import type { TypingTarget } from './lessons';

const W = 960;
const H = 540;
const RAIL_Y = 380;
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

  private dpr = 1;
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
    this.config = config;
    this.callbacks = callbacks;
    this.hearts = config.practice ? 5 : config.hearts;
    this.baseSpeed = config.baseSpeed * 2.4;

    this.dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    canvas.width = W * this.dpr;
    canvas.height = H * this.dpr;
    this.ctx = canvas.getContext('2d')!;

    this.initNodes();
  }

  private initNodes() {
    const totalItems = this.config.mobsPerWave.reduce((a, b) => a + b, 0);
    const exclude = new Set<string>();

    this.nodes = [];
    const nodeTypes: TrackNode['type'][] = ['obstacle', 'switch', 'golden_apple'];

    // Obstacles spawn off on the right, providing ample reaction runway (860px to 225px = 635px runway)
    let currentSpawnX = 860;
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
      this.cartHopY = -8;
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
        } else {
          this.notifyNextKey();
        }
      } else {
        playTypingSfx('hit');
        this.notifyNextKey();
      }
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
      obstacle: ['#EF4444', '#DC2626', '#FFFFFF', '#1E293B'], // TNT colors
      switch: ['#78350F', '#B45309', '#EF4444', '#D97706'], // Oak & redstone
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
    const curSpeed = this.isBoosting ? this.baseSpeed * 1.35 : this.baseSpeed;

    // Cart hop damping
    if (this.cartHopY < 0) this.cartHopY += dt * 30;
    else this.cartHopY = 0;

    const cur = this.nodes[this.currentNodeIdx];
    // In practice mode, if current obstacle has arrived at cart (CART_X + 110), cart halts to wait for player
    const isWaiting = Boolean(this.config.practice && cur && cur.x <= CART_X + 110);
    const effectiveSpeed = isWaiting ? 0 : curSpeed;

    // Move track texture
    this.trackOffset = (this.trackOffset + effectiveSpeed * dt) % 60;

    // Move obstacles towards cart (from right to left)
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node.cleared) continue;

      if (this.config.practice && node === cur && node.x <= CART_X + 110) {
        node.x = CART_X + 110;
      } else {
        node.x -= effectiveSpeed * dt;
      }

      // Check collision with minecart in challenge mode
      if (!this.config.practice && node === cur && node.x <= CART_X + 45) {
        // Crash into obstacle!
        playTypingSfx('hurt');
        this.hearts--;
        this.combo = 0;
        this.isBoosting = false;
        node.cleared = true;
        this.spawnObstacleShards(node.x, RAIL_Y - 40, node.type);

        this.currentNodeIdx++;
        this.notifyNextKey();
        if (this.hearts <= 0) {
          this.finishGame(false);
          return;
        }
        if (this.currentNodeIdx >= this.nodes.length) {
          this.finishGame(true);
          return;
        }
      }
    }

    // Rocket boost fire particles from back of cart
    if (this.isBoosting) {
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          x: CART_X - 28,
          y: RAIL_Y - 18 + (Math.random() - 0.5) * 8,
          vx: -240 - Math.random() * 80,
          vy: (Math.random() - 0.5) * 40,
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
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, W, H);

    // Cavern background with parallax
    this.renderCavernBackground(ctx);

    // Rails & track ties
    this.renderRails(ctx);

    // Track obstacles
    this.renderObstacles(ctx);

    // Steve in Minecart
    this.renderMinecart(ctx, CART_X, RAIL_Y - 14 + this.cartHopY);

    // Particles
    this.renderParticles(ctx);

    // HUD
    this.renderHUD(ctx);

    // Pause overlay
    if (this.paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 36px "Microsoft YaHei", "Arial Black", "VT323", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('游戏暂停 (PAUSED)', W / 2, H / 2 - 10);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px "Microsoft YaHei", "Arial Black", "VT323", sans-serif';
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

    // Torch lanterns on cave walls
    const torchXPositions = [80, 280, 480, 680, 880];
    for (const tx of torchXPositions) {
      // Wood handle
      ctx.fillStyle = '#78350F';
      ctx.fillRect(tx, RAIL_Y - 95, 6, 22);
      // Flame core
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(tx - 3, RAIL_Y - 105, 12, 10);
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(tx - 1, RAIL_Y - 103, 8, 6);

      // Warm radial glow
      const glowGrad = ctx.createRadialGradient(tx + 3, RAIL_Y - 100, 2, tx + 3, RAIL_Y - 100, 48);
      glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.2)');
      glowGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(tx + 3, RAIL_Y - 100, 48, 0, Math.PI * 2);
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

    // Bedrock stone border
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, RAIL_Y + 28, W, 4);
  }

  private renderRails(ctx: CanvasRenderingContext2D) {
    // Gravel ballast foundation below rails
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, RAIL_Y - 6, W, 18);

    // Wooden cross ties moving backwards
    ctx.fillStyle = '#5A3825';
    const tieWidth = 14;
    const tieSpacing = 44;
    for (let x = -tieSpacing; x < W + tieSpacing; x += tieSpacing) {
      const drawX = x - (this.trackOffset % tieSpacing);
      ctx.fillRect(drawX, RAIL_Y - 10, tieWidth, 18);
      ctx.fillStyle = '#3E2415';
      ctx.fillRect(drawX, RAIL_Y + 6, tieWidth, 2);
      ctx.fillStyle = '#5A3825';
    }

    // Powered rail gold / redstone stripes every 260px
    for (let x = -260; x < W + 260; x += 260) {
      const drawX = x - (this.trackOffset % 260);
      ctx.fillStyle = '#EF4444'; // Redstone power
      ctx.fillRect(drawX + 8, RAIL_Y - 12, 6, 20);
      ctx.fillStyle = '#FBBF24'; // Gold rail
      ctx.fillRect(drawX + 10, RAIL_Y - 10, 4, 16);
    }

    // Upper and lower iron rails (grey metallic bars)
    ctx.fillStyle = '#64748B';
    ctx.fillRect(0, RAIL_Y - 10, W, 4);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(0, RAIL_Y - 8, W, 2);

    ctx.fillStyle = '#475569';
    ctx.fillRect(0, RAIL_Y + 4, W, 4);
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(0, RAIL_Y + 6, W, 2);
  }

  private renderObstacles(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node.cleared || node.x < -120 || node.x > W + 120) continue;

      const isCurrent = i === this.currentNodeIdx;
      const x = node.x;
      const y = RAIL_Y - 10;

      ctx.save();
      // Obstacle sprite
      if (node.type === 'obstacle') {
        // Red TNT Block
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(x - 22, y - 44, 44, 44);
        // TNT center white banner
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x - 22, y - 28, 44, 12);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TNT', x, y - 19);

        // Dark outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 22, y - 44, 44, 44);
      } else if (node.type === 'switch') {
        // Rail Switch Lever
        ctx.fillStyle = '#78350F';
        ctx.fillRect(x - 14, y - 22, 28, 22);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 14, y - 22, 28, 22);

        // Angled Redstone Lever
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x, y - 18);
        ctx.lineTo(x + 12, y - 44);
        ctx.stroke();
      } else {
        // Golden Apple
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(x, y - 32, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(x - 4, y - 36, 6, 0, Math.PI * 2);
        ctx.fill();

        // Green leaf
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(x + 4, y - 52, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Typing Billboard
      this.renderTargetBillboard(ctx, x, y - 82, node.target, node.progress, isCurrent);
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
    ctx.save();

    const text = target.display;
    const hasHint = Boolean(target.hint);
    const hasProgress = isCurrent && target.answer.length > 1;

    // Pick font size based on text length
    const fontSize = text.length <= 3 ? 34 : text.length <= 6 ? 30 : 26;
    const fontStack = '"Microsoft YaHei", "Arial Black", "VT323", sans-serif';
    ctx.font = `bold ${fontSize}px ${fontStack}`;

    const textMetrics = ctx.measureText(text);
    const textW = textMetrics.width;

    const tw = Math.max(120, textW + 44);
    const th = (hasHint && hasProgress) ? 74 : (hasHint || hasProgress) ? 64 : 54;

    // Hanging wooden post down to obstacle
    ctx.fillStyle = '#78350F';
    ctx.fillRect(x - 3, y + th / 2, 6, 26);

    // Glowing aura for current active target
    if (isCurrent) {
      ctx.shadowColor = 'rgba(250, 204, 21, 0.85)';
      ctx.shadowBlur = 12;
    }

    // Billboard box background
    ctx.fillStyle = isCurrent ? '#0F172A' : '#1E293B';
    ctx.fillRect(x - tw / 2, y - th / 2, tw, th);

    // Billboard border
    ctx.strokeStyle = isCurrent ? '#FACC15' : '#475569';
    ctx.lineWidth = isCurrent ? 3.5 : 2;
    ctx.strokeRect(x - tw / 2, y - th / 2, tw, th);

    // Reset shadow
    ctx.shadowBlur = 0;

    // Corner rivets
    ctx.fillStyle = isCurrent ? '#F59E0B' : '#334155';
    ctx.fillRect(x - tw / 2 + 4, y - th / 2 + 4, 4, 4);
    ctx.fillRect(x + tw / 2 - 8, y - th / 2 + 4, 4, 4);
    ctx.fillRect(x - tw / 2 + 4, y + th / 2 - 8, 4, 4);
    ctx.fillRect(x + tw / 2 - 8, y + th / 2 - 8, 4, 4);

    // Layout configuration
    let mainY = y;
    if (hasHint && hasProgress) {
      // 3-tier: Hint on top, Main text in middle, Progress at bottom
      ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isCurrent ? '#38BDF8' : '#94A3B8';
      ctx.fillText(target.hint!, x, y - th / 2 + 14);
      mainY = y + 2;
    } else if (hasHint) {
      // 2-tier: Hint on top, Main text in bottom
      ctx.font = 'bold 13px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isCurrent ? '#38BDF8' : '#94A3B8';
      ctx.fillText(target.hint!, x, y - th / 2 + 15);
      mainY = y + 12;
    } else if (hasProgress) {
      // 2-tier: Main text on top, Progress at bottom
      mainY = y - 10;
    }

    // Main display string (High contrast, bold, crystal clear)
    ctx.font = `bold ${fontSize}px ${fontStack}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isCurrent ? '#FFFFFF' : '#CBD5E1';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(text, x, mainY);
    ctx.shadowBlur = 0;

    // Typed progress indicator for multi-letter words (e.g. phonics, words)
    if (hasProgress) {
      const progY = y + th / 2 - 14;
      const ans = target.answer;
      const typed = ans.slice(0, progress);
      const remaining = ans.slice(progress);

      ctx.font = 'bold 18px "Arial Black", "Microsoft YaHei", monospace';
      const totalW = ctx.measureText(ans).width;
      let startX = x - totalW / 2;

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#4ADE80';
      ctx.fillText(typed, startX, progY);
      startX += ctx.measureText(typed).width;

      ctx.fillStyle = '#FDE047';
      ctx.fillText(remaining, startX, progY);
    }

    // Active downward arrow indicator for current target
    if (isCurrent) {
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.moveTo(x - 7, y + th / 2 + 2);
      ctx.lineTo(x + 7, y + th / 2 + 2);
      ctx.lineTo(x, y + th / 2 + 10);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private renderMinecart(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    // Rocket booster exhaust flame
    if (this.isBoosting) {
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.moveTo(-32, -4);
      ctx.lineTo(-60 - Math.random() * 16, 0);
      ctx.lineTo(-32, 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-32, -2);
      ctx.lineTo(-44, 0);
      ctx.lineTo(-32, 2);
      ctx.closePath();
      ctx.fill();
    }

    // Steve inside Minecart
    // Hair
    ctx.fillStyle = '#451A03';
    ctx.fillRect(-12, -44, 24, 8);
    // Face skin
    ctx.fillStyle = '#D4A373';
    ctx.fillRect(-12, -36, 24, 18);
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-7, -30, 4, 4);
    ctx.fillRect(4, -30, 4, 4);
    ctx.fillStyle = '#1D4ED8'; // Blue pupils
    ctx.fillRect(-5, -30, 2, 4);
    ctx.fillRect(6, -30, 2, 4);
    // Beard / Mouth
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-5, -23, 10, 3);

    // Steve Cyan Shirt
    ctx.fillStyle = '#06B6D4';
    ctx.fillRect(-14, -18, 28, 16);

    // Diamond Pickaxe in hand
    ctx.fillStyle = '#78350F';
    ctx.fillRect(10, -28, 4, 20);
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(6, -32, 16, 5);
    ctx.fillRect(18, -28, 4, 6);

    // Minecart Metal Tub (Minecraft Iron Minecart)
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(-30, -12, 60, 24);
    // 3D Inner shadow
    ctx.fillStyle = '#64748B';
    ctx.fillRect(-28, -10, 56, 4);
    // Bottom bevel
    ctx.fillStyle = '#475569';
    ctx.fillRect(-26, 8, 52, 4);
    // Tub border
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    ctx.strokeRect(-30, -12, 60, 24);

    // Minecart Wheels (rotating based on trackOffset)
    const wheelAngle = (this.trackOffset / 44) * Math.PI * 2;
    for (const wx of [-16, 16]) {
      ctx.save();
      ctx.translate(wx, 14);
      ctx.rotate(wheelAngle);

      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Wheel spoke cross
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 6);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.textBaseline = 'alphabetic';

    const fontStack = '"Microsoft YaHei", "Arial Black", "VT323", sans-serif';

    // Speedometer / Distance (Right Panel)
    ctx.fillStyle = '#1E232A';
    ctx.fillRect(W - 160, 16, 140, 68);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(W - 160, 16, 140, 68);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = `bold 12px ${fontStack}`;
    ctx.textAlign = 'center';
    ctx.fillText('狂飙时速', W - 90, 36);

    ctx.fillStyle = this.isBoosting ? '#38BDF8' : '#FACC15';
    ctx.font = `bold 22px ${fontStack}`;
    const currentKmh = Math.round((this.isBoosting ? this.baseSpeed * 1.35 : this.baseSpeed) * 0.45);
    ctx.fillText(this.isBoosting ? `⚡ ${currentKmh} km/h` : `🚂 ${currentKmh} km/h`, W - 90, 64);

    // Progress counter (Left Panel)
    ctx.fillStyle = '#1E232A';
    ctx.fillRect(20, 16, 140, 68);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 16, 140, 68);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = `bold 12px ${fontStack}`;
    ctx.textAlign = 'center';
    ctx.fillText('冲刺进度', 90, 36);

    ctx.fillStyle = '#4ADE80';
    ctx.font = `bold 22px ${fontStack}`;
    ctx.fillText(`${this.currentNodeIdx} / ${this.nodes.length}`, 90, 64);

    // ── Cockpit Focus Target Dashboard (中央静止目标台) ───────────
    const panelW = 440;
    const panelH = 76;
    const panelX = W / 2 - panelW / 2;
    const panelY = 12;

    const cur = this.nodes[this.currentNodeIdx];
    const isTargetLocked = Boolean(cur && !cur.cleared);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fillRect(panelX, panelY, panelW, panelH);

    ctx.strokeStyle = isTargetLocked ? '#FACC15' : '#334155';
    ctx.lineWidth = isTargetLocked ? 3.5 : 2;
    if (isTargetLocked) {
      ctx.shadowColor = 'rgba(250, 204, 21, 0.45)';
      ctx.shadowBlur = 8;
    }
    ctx.strokeRect(panelX, panelY, panelW, panelH);
    ctx.shadowBlur = 0;

    // Top Sub-Row: Combo & Hearts
    ctx.textAlign = 'left';
    ctx.font = `bold 13px ${fontStack}`;
    if (this.combo > 1) {
      ctx.fillStyle = this.isBoosting ? '#38BDF8' : '#F59E0B';
      ctx.fillText(this.isBoosting ? `🚀 超速 x${this.combo}！` : `🔥 连击 x${this.combo}`, panelX + 14, panelY + 20);
    } else {
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(isTargetLocked ? '🎯 前方障碍锁定' : '🏁 终点冲刺', panelX + 14, panelY + 20);
    }

    // Right: Hearts
    ctx.textAlign = 'right';
    ctx.font = '18px sans-serif';
    let heartsStr = '';
    for (let h = 0; h < 5; h++) {
      heartsStr += h < this.hearts ? '❤️' : '🖤';
    }
    ctx.fillText(heartsStr, panelX + panelW - 14, panelY + 20);

    // Center Target Display (Big, bold, stationary, zero motion blur)
    if (isTargetLocked && cur) {
      const tgt = cur.target;
      const text = tgt.display;
      const hasHint = Boolean(tgt.hint);
      const isMulti = tgt.answer.length > 1;

      ctx.textAlign = 'center';

      // Draw Main Target Word
      const targetFontSize = text.length <= 3 ? 34 : text.length <= 6 ? 30 : 26;
      ctx.font = `bold ${targetFontSize}px ${fontStack}`;
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      const targetCenterY = (hasHint || isMulti) ? panelY + 46 : panelY + 52;
      ctx.fillText(text, W / 2, targetCenterY);
      ctx.shadowBlur = 0;

      // Draw Hint and Typed Progress
      if (hasHint && isMulti) {
        ctx.font = `bold 13px ${fontStack}`;
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(tgt.hint!, W / 2, panelY + 20);

        const ans = tgt.answer;
        const typed = ans.slice(0, cur.progress);
        const nextChar = ans[cur.progress] || '';
        const remaining = ans.slice(cur.progress + 1);

        ctx.font = 'bold 16px "Arial Black", "Microsoft YaHei", monospace';
        const totalW = ctx.measureText(ans).width;
        let startX = W / 2 - totalW / 2;

        ctx.textAlign = 'left';
        ctx.fillStyle = '#4ADE80';
        ctx.fillText(typed, startX, panelY + 66);
        startX += ctx.measureText(typed).width;

        ctx.fillStyle = '#FDE047';
        ctx.fillText(nextChar, startX, panelY + 66);
        startX += ctx.measureText(nextChar).width;

        ctx.fillStyle = '#64748B';
        ctx.fillText(remaining, startX, panelY + 66);
      } else if (hasHint) {
        ctx.font = `bold 14px ${fontStack}`;
        ctx.fillStyle = '#FDE047';
        ctx.fillText(tgt.hint!, W / 2, panelY + 66);
      } else if (isMulti) {
        const ans = tgt.answer;
        const typed = ans.slice(0, cur.progress);
        const nextChar = ans[cur.progress] || '';
        const remaining = ans.slice(cur.progress + 1);

        ctx.font = 'bold 18px "Arial Black", "Microsoft YaHei", monospace';
        const totalW = ctx.measureText(ans).width;
        let startX = W / 2 - totalW / 2;

        ctx.textAlign = 'left';
        ctx.fillStyle = '#4ADE80';
        ctx.fillText(typed, startX, panelY + 66);
        startX += ctx.measureText(typed).width;

        ctx.fillStyle = '#FDE047';
        ctx.fillText(nextChar, startX, panelY + 66);
        startX += ctx.measureText(nextChar).width;

        ctx.fillStyle = '#64748B';
        ctx.fillText(remaining, startX, panelY + 66);
      }

      // Distance Gauge bar at the bottom of panel
      const dist = Math.max(0, cur.x - (CART_X + 45));
      const totalRunway = 635;
      const distRatio = Math.max(0, Math.min(1, dist / totalRunway));
      const barW = (panelW - 8) * distRatio;
      ctx.fillStyle = distRatio > 0.4 ? '#4ADE80' : distRatio > 0.2 ? '#FACC15' : '#EF4444';
      ctx.fillRect(panelX + 4, panelY + panelH - 4, barW, 3);
    } else {
      ctx.textAlign = 'center';
      ctx.font = `bold 24px ${fontStack}`;
      ctx.fillStyle = '#FACC15';
      ctx.fillText('🌟 全力冲刺，直达终点！', W / 2, panelY + 48);
    }

    ctx.restore();
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
