/**
 * Procedural Minecraft-style Chiptune BGM Synthesizer for Keyboard Defender.
 *
 * 100% Web Audio API - zero audio asset files, zero latency, pure synthesized music.
 * Each of the 3 gameplay modes has its own unique soundtrack:
 *   - 'archery': Heroic Medieval Fortress March (116 BPM, A minor)
 *   - 'miner':   Mysterious Crystal Cavern Lullaby (88 BPM, E minor)
 *   - 'runner':  High-Octane Rail Funk Rush (136 BPM, E minor / G major)
 */

export type BGMTrack = 'archery' | 'miner' | 'runner';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let duckGain: GainNode | null = null;
let currentTrack: BGMTrack | null = null;
let isPlaying = false;
let isPaused = false;
let timerId: ReturnType<typeof setInterval> | null = null;
let currentBeat = 0;
let nextNoteTime = 0;

const BGM_STORAGE_KEY = 'typing_bgm_enabled';

// Note frequencies in Hz
const NOTES: Record<string, number> = {
  // Octave 2
  E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  // Octave 3
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, 'F#3': 185.0, G3: 196.0, 'G#3': 207.65, A3: 220.0, 'A#3': 233.08, B3: 246.94,
  // Octave 4
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13, E4: 329.63, F4: 349.23, 'F#4': 369.99, G4: 392.0, 'G#4': 415.3, A4: 440.0, 'A#4': 466.16, B4: 493.88,
  // Octave 5
  C5: 523.25, 'C#5': 554.37, D5: 587.33, 'D#5': 622.25, E5: 659.25, F5: 698.46, 'F#5': 739.99, G5: 783.99, 'G#5': 830.61, A5: 880.0, 'A#5': 932.33, B5: 987.77,
  // Octave 6
  C6: 1046.5, D6: 1174.66, E6: 1318.51,
  _: 0, // Rest
};

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    try {
      audioCtx = new AudioContextClass();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

function initNodes(ctx: AudioContext) {
  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);

    duckGain = ctx.createGain();
    duckGain.gain.setValueAtTime(1.0, ctx.currentTime);

    masterGain.connect(duckGain);
    duckGain.connect(ctx.destination);
  }
}

// ── Synthesizer Voice Generators ──────────────────────────────────────────

/** Retro Lead Synth (soft square / pulse with lowpass filter) */
function playLeadNote(ctx: AudioContext, time: number, freq: number, duration: number, vol = 0.12) {
  if (freq <= 0) return;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);

  // Warm retro filter
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1600, time);
  filter.frequency.exponentialRampToValueAtTime(800, time + duration);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.02);
  gain.gain.setValueAtTime(vol * 0.85, time + duration * 0.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain!);

  osc.start(time);
  osc.stop(time + duration + 0.05);
}

/** Warm Pluck / Bell (crystalline sine/triangle for cavern & notes) */
function playPluckNote(ctx: AudioContext, time: number, freq: number, duration: number, vol = 0.15) {
  if (freq <= 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  osc.connect(gain);
  gain.connect(masterGain!);

  osc.start(time);
  osc.stop(time + duration + 0.05);
}

/** Deep Bass (triangle / sine wave for foundation) */
function playBassNote(ctx: AudioContext, time: number, freq: number, duration: number, vol = 0.2) {
  if (freq <= 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  osc.connect(gain);
  gain.connect(masterGain!);

  osc.start(time);
  osc.stop(time + duration + 0.05);
}

/** Chiptune percussion click / rail joint sound */
function playClick(ctx: AudioContext, time: number, vol = 0.04, isRail = false) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = isRail ? 'triangle' : 'square';
  osc.frequency.setValueAtTime(isRail ? 280 : 800, time);
  osc.frequency.exponentialRampToValueAtTime(80, time + 0.04);

  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

  osc.connect(gain);
  gain.connect(masterGain!);

  osc.start(time);
  osc.stop(time + 0.05);
}

// ── Compositions ─────────────────────────────────────────────────────────

interface StepData {
  lead?: keyof typeof NOTES;
  bass?: keyof typeof NOTES;
  pluck?: keyof typeof NOTES;
  click?: boolean;
  rail?: boolean;
}

/** 1. 城墙弓手 (Archery): 庄重坚毅的要塞守卫进行曲 (16 步 4/4 拍, BPM 116) */
const ARCHERY_PATTERN: StepData[] = [
  // Bar 1 (Am)
  { lead: 'A4', bass: 'A2', pluck: 'E4', click: true },
  { lead: '_', pluck: 'A4' },
  { lead: 'C5', bass: 'A2', pluck: 'C5', click: false },
  { lead: 'B4', pluck: 'E4' },
  // Bar 2 (F)
  { lead: 'A4', bass: 'F2', pluck: 'C4', click: true },
  { lead: 'F4', pluck: 'F4' },
  { lead: 'A4', bass: 'F2', pluck: 'A4', click: false },
  { lead: 'G4', pluck: 'C5' },
  // Bar 3 (C)
  { lead: 'E4', bass: 'C3', pluck: 'G4', click: true },
  { lead: 'G4', pluck: 'C5' },
  { lead: 'C5', bass: 'C3', pluck: 'E5', click: false },
  { lead: 'D5', pluck: 'G4' },
  // Bar 4 (G -> Em)
  { lead: 'E5', bass: 'G2', pluck: 'B4', click: true },
  { lead: 'D5', pluck: 'D5' },
  { lead: 'B4', bass: 'E2', pluck: 'G4', click: false },
  { lead: 'E4', pluck: 'B4' },
];

/** 2. 深潜矿工 (Miner): 空灵深邃的晶洞采矿回想曲 (16 步, BPM 88) */
const MINER_PATTERN: StepData[] = [
  // Bar 1 (Em - 晶莹水滴声与深层低音)
  { lead: 'E5', bass: 'E2', pluck: 'B4', click: true },
  { pluck: 'G5' },
  { lead: 'G5', pluck: 'E5' },
  { pluck: 'B5' },
  // Bar 2 (C)
  { lead: 'D5', bass: 'C3', pluck: 'G4', click: false },
  { pluck: 'E5' },
  { lead: 'C5', pluck: 'C5' },
  { pluck: 'G5' },
  // Bar 3 (Am)
  { lead: 'A4', bass: 'A2', pluck: 'E4', click: true },
  { pluck: 'C5' },
  { lead: 'C5', pluck: 'E5' },
  { pluck: 'A5' },
  // Bar 4 (B -> Em)
  { lead: 'B4', bass: 'B2', pluck: 'D#4', click: false },
  { pluck: 'F#4' },
  { lead: 'E4', bass: 'E2', pluck: 'B4' },
  { pluck: 'E5' },
];

/** 3. 矿车狂飙 (Runner): 热血动感的铁轨飞驰狂想曲 (16 步, BPM 136, 带铁轨咔哒震动节拍) */
const RUNNER_PATTERN: StepData[] = [
  // Bar 1 (Em 飞速律动)
  { lead: 'E4', bass: 'E2', rail: true },
  { lead: 'G4', rail: true },
  { lead: 'E4', bass: 'E3', rail: true, click: true },
  { lead: 'B4', rail: true },
  // Bar 2 (C 高能突进)
  { lead: 'C5', bass: 'C3', rail: true },
  { lead: 'B4', rail: true },
  { lead: 'G4', bass: 'C2', rail: true, click: true },
  { lead: 'A4', rail: true },
  // Bar 3 (D 极速跨轨)
  { lead: 'D5', bass: 'D3', rail: true },
  { lead: 'E5', rail: true },
  { lead: 'D5', bass: 'D2', rail: true, click: true },
  { lead: 'B4', rail: true },
  // Bar 4 (B -> Em 狂飙冲刺)
  { lead: 'G4', bass: 'B2', rail: true },
  { lead: 'A4', rail: true },
  { lead: 'B4', bass: 'E2', rail: true, click: true },
  { lead: 'E5', rail: true },
];

function getTrackBpm(track: BGMTrack): number {
  switch (track) {
    case 'miner':
      return 88;
    case 'runner':
      return 136;
    case 'archery':
    default:
      return 116;
  }
}

function getTrackPattern(track: BGMTrack): StepData[] {
  switch (track) {
    case 'miner':
      return MINER_PATTERN;
    case 'runner':
      return RUNNER_PATTERN;
    case 'archery':
    default:
      return ARCHERY_PATTERN;
  }
}

// ── Scheduler Engine ──────────────────────────────────────────────────────

function scheduleStep(ctx: AudioContext, track: BGMTrack, stepIdx: number, time: number, stepDuration: number) {
  const pattern = getTrackPattern(track);
  const step = pattern[stepIdx % pattern.length];
  if (!step) return;

  // Lead melody
  if (step.lead && NOTES[step.lead] > 0) {
    const freq = NOTES[step.lead];
    if (track === 'runner') {
      playLeadNote(ctx, time, freq, stepDuration * 0.85, 0.11);
    } else if (track === 'miner') {
      playPluckNote(ctx, time, freq, stepDuration * 1.4, 0.14);
    } else {
      playLeadNote(ctx, time, freq, stepDuration * 0.9, 0.1);
    }
  }

  // Pluck harmony
  if (step.pluck && NOTES[step.pluck] > 0) {
    const freq = NOTES[step.pluck];
    playPluckNote(ctx, time, freq, stepDuration * (track === 'miner' ? 1.6 : 0.8), track === 'miner' ? 0.12 : 0.07);
  }

  // Bass line
  if (step.bass && NOTES[step.bass] > 0) {
    const freq = NOTES[step.bass];
    playBassNote(ctx, time, freq, stepDuration * 1.1, track === 'runner' ? 0.18 : 0.16);
  }

  // Click & Rail percussion
  if (step.click) {
    playClick(ctx, time, 0.04, false);
  }
  if (step.rail) {
    playClick(ctx, time, 0.025, true);
  }
}

function tickScheduler() {
  const ctx = getAudioContext();
  if (!ctx || !isPlaying || isPaused || !currentTrack) return;

  const bpm = getTrackBpm(currentTrack);
  const stepDuration = 60 / bpm / 2; // 8th note per step

  // Lookahead window: schedule notes up to 120ms ahead
  while (nextNoteTime < ctx.currentTime + 0.12) {
    scheduleStep(ctx, currentTrack, currentBeat, nextNoteTime, stepDuration);
    nextNoteTime += stepDuration;
    currentBeat++;
  }
}

// ── Public API ───────────────────────────────────────────────────────────

/** Check whether user has BGM turned on in preferences (default: true) */
export function isBgmEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem(BGM_STORAGE_KEY);
  return val === null ? true : val === 'true';
}

/** Toggle BGM on/off preference and persist */
export function setBgmEnabled(enabled: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BGM_STORAGE_KEY, enabled ? 'true' : 'false');
  }
  if (!enabled) {
    stopBGM();
  } else if (currentTrack && !isPlaying) {
    startBGM(currentTrack);
  }
}

/** Start or switch to a background music track */
export function startBGM(track: BGMTrack) {
  if (!isBgmEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  initNodes(ctx);

  if (isPlaying && currentTrack === track && !isPaused) {
    return; // Already playing same track
  }

  currentTrack = track;
  isPlaying = true;
  isPaused = false;
  currentBeat = 0;
  nextNoteTime = ctx.currentTime + 0.05;

  // Smooth fade-in
  masterGain!.gain.cancelScheduledValues(ctx.currentTime);
  masterGain!.gain.setValueAtTime(masterGain!.gain.value, ctx.currentTime);
  masterGain!.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.6);

  if (!timerId) {
    timerId = setInterval(tickScheduler, 40);
  }
}

/** Smoothly stop the background music */
export function stopBGM() {
  if (!isPlaying && !isPaused) return;

  const ctx = getAudioContext();
  if (ctx && masterGain) {
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
  }

  setTimeout(() => {
    if (!isPlaying) {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      currentTrack = null;
    }
  }, 450);

  isPlaying = false;
  isPaused = false;
}

/** Pause BGM when game is paused */
export function pauseBGM() {
  if (!isPlaying) return;
  isPaused = true;
  const ctx = getAudioContext();
  if (ctx && masterGain) {
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
  }
}

/** Resume BGM when game continues */
export function resumeBGM() {
  if (!isBgmEnabled() || !isPaused || !currentTrack) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  isPaused = false;
  nextNoteTime = ctx.currentTime + 0.05;

  masterGain.gain.cancelScheduledValues(ctx.currentTime);
  masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.4);
}

/** Temporarily duck BGM volume while TTS is speaking */
export function duckBGMForTts(durationSec = 1.2) {
  const ctx = getAudioContext();
  if (!ctx || !duckGain) return;

  duckGain.gain.cancelScheduledValues(ctx.currentTime);
  duckGain.gain.setValueAtTime(duckGain.gain.value, ctx.currentTime);
  duckGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.08);
  duckGain.gain.setValueAtTime(0.25, ctx.currentTime + durationSec);
  duckGain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + durationSec + 0.3);
}
