/**
 * Mining Descent (深潜矿工) Canvas typing game engine.
 *
 * Vertical shaft descent:
 * Player stands above layers of earth & ores, swinging pickaxe on correct keypresses.
 * Shatters blocks into pixel debris, descends layer-by-layer down to -64m bedrock & diamond cache!
 */

import { playTypingSfx } from './sounds';
import type { GameConfig, GameResult, GameCallbacks } from './game-engine';
import type { TypingTarget } from './lessons';

const W = 960;
const H = 540;
const SHAFT_X = 240;
const SHAFT_W = 480;
const BLOCK_H = 120;

interface MinerBlock {
  id: number;
  depthMeter: number;
  oreType: 'stone' | 'coal' | 'iron' | 'redstone' | 'gold' | 'diamond' | 'bedrock';
  target: TypingTarget;
  progress: number; // characters typed
  shattered: boolean;
  shatterT: number;
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

interface XpOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export class MinerGame {
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
  private blocks: MinerBlock[] = [];
  private currentBlockIdx = 0;
  private cameraY = 0;
  private targetCameraY = 0;
  private steveSwingT = 0;
  private steveHopY = 0;
  private lavaY = -180; // Ceiling lava in challenge mode
  private particles: PixelParticle[] = [];
  private orbs: XpOrb[] = [];
  private dpr = 1;

  constructor(canvas: HTMLCanvasElement, config: GameConfig, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.config = config;
    this.callbacks = callbacks;
    this.hearts = config.practice ? 5 : config.hearts;

    this.dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    canvas.width = W * this.dpr;
    canvas.height = H * this.dpr;
    this.ctx = canvas.getContext('2d')!;

    this.initBlocks();
  }

  private initBlocks() {
    // Generate total blocks based on waves / mobs count
    const totalBlocks = this.config.mobsPerWave.reduce((a, b) => a + b, 0);
    const exclude = new Set<string>();

    this.blocks = [];
    for (let i = 0; i < totalBlocks; i++) {
      const ratio = i / Math.max(1, totalBlocks - 1);
      let ore: MinerBlock['oreType'] = 'stone';

      if (i === totalBlocks - 1) {
        ore = 'diamond';
      } else if (ratio > 0.8) {
        ore = 'gold';
      } else if (ratio > 0.55) {
        ore = 'redstone';
      } else if (ratio > 0.35) {
        ore = 'iron';
      } else if (ratio > 0.15) {
        ore = 'coal';
      }

      // Height from 64m down to -64m
      const depth = Math.round(64 - ratio * 128);

      const target =
        i === totalBlocks - 1
          ? this.config.bossTarget()
          : this.config.nextTarget(exclude);
      exclude.add(target.answer);

      this.blocks.push({
        id: i,
        depthMeter: depth,
        oreType: ore,
        target,
        progress: 0,
        shattered: false,
        shatterT: 0,
      });
    }

    this.currentBlockIdx = 0;
    this.targetCameraY = 0;
    this.cameraY = 0;
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
    const cur = this.blocks[this.currentBlockIdx];
    if (cur && !cur.shattered) {
      const nextChar = cur.target.answer[cur.progress];
      this.callbacks.onNextKey?.(nextChar || null);
    } else {
      this.callbacks.onNextKey?.(null);
    }
  }

  public handleKey(key: string) {
    if (!this.running || this.paused) return;
    const cur = this.blocks[this.currentBlockIdx];
    if (!cur || cur.shattered) return;

    this.totalChars++;
    const expected = cur.target.answer[cur.progress];

    if (key === expected) {
      this.correctChars++;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      cur.progress++;
      this.steveSwingT = 0.22;
      this.steveHopY = -8;

      this.callbacks.onKeyResult?.(key, true);

      // Spawn hit sparks
      this.spawnHitSparks(SHAFT_X + SHAFT_W / 2, 280);

      if (cur.progress >= cur.target.answer.length) {
        // Shattered the block!
        cur.shattered = true;
        this.callbacks.onWordDefeated?.(cur.target);

        if (cur.oreType === 'diamond') {
          playTypingSfx('diamond');
        } else {
          playTypingSfx('mine', Math.min(5, Math.floor(this.combo / 4)));
        }

        this.spawnBlockDebris(SHAFT_X + SHAFT_W / 2, 330, cur.oreType);
        this.spawnXpOrbs(SHAFT_X + SHAFT_W / 2, 320);

        // Advance to next block
        this.currentBlockIdx++;
        this.targetCameraY = this.currentBlockIdx * BLOCK_H;

        if (this.currentBlockIdx >= this.blocks.length) {
          // Reached the diamond vault! Victory!
          setTimeout(() => {
            this.finishGame(true);
          }, 600);
        } else {
          // Push lava back on success
          if (!this.config.practice) {
            this.lavaY = Math.max(-180, this.lavaY - 30);
          }
        }
      } else {
        playTypingSfx('hit');
      }

      this.notifyNextKey();
    } else {
      // Wrong key
      this.wrongChars++;
      this.combo = 0;
      this.missedKeys[expected] = (this.missedKeys[expected] || 0) + 1;
      this.callbacks.onKeyResult?.(key, false);
      playTypingSfx('wrong');
    }
  }

  private spawnHitSparks(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        color: '#FFD700',
        size: 3 + Math.random() * 3,
        life: 0.25,
        maxLife: 0.25,
      });
    }
  }

  private spawnBlockDebris(x: number, y: number, ore: MinerBlock['oreType']) {
    const colors: Record<MinerBlock['oreType'], string[]> = {
      stone: ['#7A7A7A', '#606060', '#909090', '#4A4A4A'],
      coal: ['#222222', '#111111', '#555555', '#7A7A7A'],
      iron: ['#D8AF93', '#B8866B', '#7A7A7A', '#E8C5A8'],
      redstone: ['#EF4444', '#DC2626', '#991B1B', '#FCA5A5'],
      gold: ['#FBBF24', '#F59E0B', '#D97706', '#FEF3C7'],
      diamond: ['#38BDF8', '#0EA5E9', '#7DD3FC', '#E0F2FE'],
      bedrock: ['#1F2937', '#111827', '#374151', '#030712'],
    };
    const pool = colors[ore];

    for (let i = 0; i < 32; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 260;
      this.particles.push({
        x: x + (Math.random() - 0.5) * SHAFT_W * 0.7,
        y: y + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 120,
        color: pool[Math.floor(Math.random() * pool.length)],
        size: 5 + Math.random() * 6,
        life: 0.6,
        maxLife: 0.6,
      });
    }
  }

  private spawnXpOrbs(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.orbs.push({
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 60,
        vy: -120 - Math.random() * 80,
        life: 0.8,
      });
    }
  }

  private finishGame(victory: boolean) {
    this.running = false;
    const duration = (performance.now() - this.startTime) / 1000;
    const totalTyped = this.correctChars + this.wrongChars;
    const accuracy = totalTyped > 0 ? this.correctChars / totalTyped : 1;
    const kpm = duration > 0 ? Math.round((this.correctChars / duration) * 60) : 0;
    const score = Math.max(0, this.correctChars * 25 - this.wrongChars * 10 + this.maxCombo * 50);

    const result: GameResult = {
      victory,
      correct: this.correctChars,
      wrong: this.wrongChars,
      accuracy,
      durationSec: Math.round(duration),
      kpm,
      maxCombo: this.maxCombo,
      score,
      kills: this.currentBlockIdx,
      heartsLost: (this.config.practice ? 5 : this.config.hearts) - this.hearts,
      escaped: 0,
      missedKeys: this.missedKeys,
      xp: Math.round(score * 0.4),
    };

    if (victory) playTypingSfx('victory');
    else playTypingSfx('defeat');

    this.callbacks.onEnd?.(result);
  }

  private update(dt: number) {
    // Camera smooth scrolling
    this.cameraY += (this.targetCameraY - this.cameraY) * Math.min(1, dt * 8);

    // Steve animations
    if (this.steveSwingT > 0) this.steveSwingT -= dt;
    if (this.steveHopY < 0) this.steveHopY += dt * 30;
    else this.steveHopY = 0;

    // Challenge lava movement
    if (!this.config.practice && this.running && !this.paused) {
      // Lava advances down toward Steve (at y = 140), scaled by baseSpeed and descent progress
      const progressRatio = this.currentBlockIdx / Math.max(1, this.blocks.length - 1);
      const lavaSpeed = (this.config.baseSpeed * 0.35) * (1 + progressRatio * 0.7);
      this.lavaY += dt * lavaSpeed;
      if (this.lavaY >= 140) {
        // Burned by lava!
        playTypingSfx('hurt');
        this.hearts--;
        this.lavaY = 40; // Push back
        if (this.hearts <= 0) {
          this.finishGame(false);
          return;
        }
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 450 * dt; // gravity
    }

    // XP orbs
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const orb = this.orbs[i];
      orb.life -= dt;
      if (orb.life <= 0) {
        this.orbs.splice(i, 1);
        continue;
      }
      orb.x += orb.vx * dt;
      orb.y += orb.vy * dt;
      orb.vy += 200 * dt;
    }
  }

  private render() {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, W, H);

    // Background gradient: Dark Cave Walls
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#1E232A');
    bgGrad.addColorStop(1, '#0C0F14');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Left & Right Rock Wall Textures
    this.renderCaveWalls(ctx);

    // Center Mine Shaft Cutout
    ctx.save();
    ctx.beginPath();
    ctx.rect(SHAFT_X, 0, SHAFT_W, H);
    ctx.clip();

    ctx.fillStyle = '#14181F';
    ctx.fillRect(SHAFT_X, 0, SHAFT_W, H);

    // Render Blocks with camera offset
    this.renderShaftBlocks(ctx);

    // Steve standing at the excavation platform (y ≈ 200)
    this.renderSteve(ctx, SHAFT_X + SHAFT_W / 2, 200 + this.steveHopY);

    // Lava in challenge mode
    if (!this.config.practice && this.lavaY > -160) {
      this.renderLava(ctx);
    }

    ctx.restore();

    // Render particles & orbs on top
    this.renderParticles(ctx);

    // Render HUD (Depth gauge, hearts, combo)
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

  private renderCaveWalls(ctx: CanvasRenderingContext2D) {
    // Left bedrock wall
    ctx.fillStyle = '#20252E';
    ctx.fillRect(0, 0, SHAFT_X, H);
    // Right bedrock wall
    ctx.fillRect(SHAFT_X + SHAFT_W, 0, W - (SHAFT_X + SHAFT_W), H);

    // Wall borders
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(SHAFT_X, 0);
    ctx.lineTo(SHAFT_X, H);
    ctx.moveTo(SHAFT_X + SHAFT_W, 0);
    ctx.lineTo(SHAFT_X + SHAFT_W, H);
    ctx.stroke();

    // Mining wooden support beams every 160px
    const beamSpacing = 160;
    const beamOffset = Math.floor(this.cameraY) % beamSpacing;
    ctx.fillStyle = '#5A3825';
    for (let y = -beamSpacing; y < H + beamSpacing; y += beamSpacing) {
      const drawY = y - beamOffset;
      ctx.fillRect(0, drawY, SHAFT_X - 10, 20);
      ctx.fillRect(SHAFT_X + SHAFT_W + 10, drawY, W - (SHAFT_X + SHAFT_W) - 10, 20);
    }
  }

  private renderShaftBlocks(ctx: CanvasRenderingContext2D) {
    const baseY = 260; // Starting block surface below Steve

    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      const blockY = baseY + i * BLOCK_H - this.cameraY;

      // Only render visible blocks
      if (blockY < -BLOCK_H || blockY > H + BLOCK_H) continue;

      if (!block.shattered) {
        this.renderSingleBlock(ctx, SHAFT_X + 10, blockY, SHAFT_W - 20, BLOCK_H - 12, block, i === this.currentBlockIdx);
      }
    }
  }

  private renderSingleBlock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    block: MinerBlock,
    isCurrent: boolean,
  ) {
    // Color palettes per ore
    const orePalettes: Record<MinerBlock['oreType'], { bg: string; border: string; ore: string; name: string }> = {
      stone: { bg: '#5E6572', border: '#424854', ore: '#828A98', name: '岩石层' },
      coal: { bg: '#424651', border: '#2B2F38', ore: '#181A1F', name: '煤炭矿脉' },
      iron: { bg: '#585C66', border: '#3E414A', ore: '#D4A373', name: '铁矿石层' },
      redstone: { bg: '#4A4D57', border: '#32353E', ore: '#EF4444', name: '红石能量层' },
      gold: { bg: '#474A54', border: '#30333C', ore: '#F59E0B', name: '黄金宝藏层' },
      diamond: { bg: '#2D3748', border: '#1A202C', ore: '#38BDF8', name: '💎 璀璨钻石层' },
      bedrock: { bg: '#1A1D24', border: '#0F1115', ore: '#4B5563', name: '基岩层' },
    };

    const pal = orePalettes[block.oreType];

    // Block body
    ctx.fillStyle = pal.bg;
    ctx.fillRect(x, y, w, h);

    // Pixel borders (3D block edge)
    ctx.strokeStyle = isCurrent ? '#FACC15' : pal.border;
    ctx.lineWidth = isCurrent ? 4 : 3;
    ctx.strokeRect(x, y, w, h);

    // Ore mineral speckles
    ctx.fillStyle = pal.ore;
    ctx.fillRect(x + 20, y + 20, 16, 16);
    ctx.fillRect(x + 50, y + 36, 12, 12);
    ctx.fillRect(x + w - 40, y + 25, 14, 14);
    ctx.fillRect(x + w - 70, y + 60, 18, 18);
    ctx.fillRect(x + 30, y + h - 35, 15, 15);
    ctx.fillRect(x + w - 45, y + h - 30, 16, 16);

    // Depth label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = `bold 12px ${this.config.pixelFont}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${block.oreType.toUpperCase()} | 深度 ${block.depthMeter}m`, x + 16, y + 20);

    // Central typing target text
    const displayStr = block.target.display;
    const answerStr = block.target.answer;
    const progress = block.progress;

    ctx.textAlign = 'center';

    // Target display (e.g. equation "7 × 8 =" or word)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold 28px ${this.config.pixelFont}`;
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText(displayStr, x + w / 2, y + h / 2 + 2);
    ctx.shadowBlur = 0;

    // Characters typed breakdown if answer is different from display
    if (answerStr !== displayStr || isCurrent) {
      const typedPart = answerStr.slice(0, progress);
      const remainingPart = answerStr.slice(progress);

      ctx.font = `bold 20px ${this.config.pixelFont}`;
      const totalWidth = ctx.measureText(answerStr).width;
      let startX = x + w / 2 - totalWidth / 2;

      ctx.textAlign = 'left';
      // Green typed
      ctx.fillStyle = '#4ADE80';
      ctx.fillText(typedPart, startX, y + h - 16);

      startX += ctx.measureText(typedPart).width;
      // Yellow remaining
      ctx.fillStyle = isCurrent ? '#FDE047' : '#9CA3AF';
      ctx.fillText(remainingPart, startX, y + h - 16);
    }

    // Active gold outline aura if currently mining this block
    if (isCurrent) {
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
    }
  }

  private renderSteve(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    // Steve Head
    ctx.fillStyle = '#C68642'; // Skin
    ctx.fillRect(-16, -56, 32, 28);
    ctx.fillStyle = '#4A2A0C'; // Brown Hair
    ctx.fillRect(-16, -56, 32, 8);
    ctx.fillRect(-16, -48, 6, 12);
    ctx.fillRect(10, -48, 6, 12);
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-10, -42, 6, 4);
    ctx.fillRect(4, -42, 6, 4);
    ctx.fillStyle = '#2563EB'; // Blue pupils
    ctx.fillRect(-8, -42, 4, 4);
    ctx.fillRect(6, -42, 4, 4);

    // Cyan Shirt
    ctx.fillStyle = '#06B6D4';
    ctx.fillRect(-14, -28, 28, 24);

    // Blue Pants
    ctx.fillStyle = '#1E40AF';
    ctx.fillRect(-12, -4, 10, 14);
    ctx.fillRect(2, -4, 10, 14);

    // Pickaxe swing animation
    ctx.save();
    const swingAngle = this.steveSwingT > 0 ? (this.steveSwingT / 0.22) * 1.2 - 0.3 : 0.4;
    ctx.translate(12, -20);
    ctx.rotate(swingAngle);

    // Pickaxe handle
    ctx.fillStyle = '#854D0E';
    ctx.fillRect(0, -2, 28, 5);
    // Pickaxe head (Iron / Diamond)
    const isDiamond = this.currentBlockIdx >= this.blocks.length - 2;
    ctx.fillStyle = isDiamond ? '#38BDF8' : '#D1D5DB';
    ctx.fillRect(24, -14, 8, 28);
    ctx.restore();

    ctx.restore();
  }

  private renderLava(ctx: CanvasRenderingContext2D) {
    const lavaGrad = ctx.createLinearGradient(0, this.lavaY - 80, 0, this.lavaY);
    lavaGrad.addColorStop(0, 'rgba(185, 28, 28, 0.95)');
    lavaGrad.addColorStop(1, 'rgba(239, 68, 68, 0.85)');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(SHAFT_X, 0, SHAFT_W, this.lavaY);

    // Lava dripping glow line
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(SHAFT_X, this.lavaY - 4, SHAFT_W, 6);
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    for (const orb of this.orbs) {
      ctx.fillStyle = '#84CC16';
      ctx.shadowColor = '#BEF264';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D) {
    // Current Depth Meter (Right Panel)
    const curBlock = this.blocks[this.currentBlockIdx] || this.blocks[this.blocks.length - 1];
    const depthStr = `${curBlock ? curBlock.depthMeter : -64}m`;

    ctx.fillStyle = '#1E232A';
    ctx.fillRect(W - 140, 20, 120, 60);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(W - 140, 20, 120, 60);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = `bold 12px ${this.config.pixelFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('当前深度', W - 80, 40);

    ctx.fillStyle = '#38BDF8';
    ctx.font = `bold 22px ${this.config.pixelFont}`;
    ctx.fillText(depthStr, W - 80, 68);

    // Progress counter (Left Panel)
    ctx.fillStyle = '#1E232A';
    ctx.fillRect(20, 20, 120, 60);
    ctx.strokeRect(20, 20, 120, 60);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = `bold 12px ${this.config.pixelFont}`;
    ctx.fillText('挖掘进度', 80, 40);

    ctx.fillStyle = '#FACC15';
    ctx.font = `bold 20px ${this.config.pixelFont}`;
    ctx.fillText(`${this.currentBlockIdx} / ${this.blocks.length}`, 80, 68);

    // Hearts (Top center)
    ctx.textAlign = 'left';
    ctx.font = '22px sans-serif';
    for (let h = 0; h < 5; h++) {
      ctx.fillText(h < this.hearts ? '❤️' : '🖤', W / 2 - 65 + h * 26, 38);
    }

    // Combo streak
    if (this.combo > 2) {
      ctx.fillStyle = '#F59E0B';
      ctx.font = `bold 18px ${this.config.pixelFont}`;
      ctx.textAlign = 'center';
      ctx.fillText(`🔥 挖掘连击 x${this.combo}`, W / 2, 70);
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
