/**
 * Synthesized game sound effects for the typing game (Web Audio, no asset files).
 */

export type TypingSfx =
  | 'shoot'
  | 'hit'
  | 'explode'
  | 'wrong'
  | 'hurt'
  | 'combo'
  | 'wave'
  | 'hiss'
  | 'victory'
  | 'defeat'
  | 'countdown'
  | 'go'
  | 'boss';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Cls =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Cls) return null;
    try {
      ctx = new Cls();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Call from a user gesture to unlock audio. */
export function unlockTypingAudio() {
  getCtx();
}

function tone(
  c: AudioContext,
  freq: number,
  dur: number,
  type: OscillatorType,
  gain: number,
  delay = 0,
  endFreq?: number,
) {
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(
  c: AudioContext,
  dur: number,
  gain: number,
  delay = 0,
  filterType: BiquadFilterType = 'lowpass',
  freq = 1200,
) {
  const t0 = c.currentTime + delay;
  const size = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, size, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

export function playTypingSfx(sfx: TypingSfx, comboLevel = 0) {
  const c = getCtx();
  if (!c) return;
  switch (sfx) {
    case 'shoot':
      // bow twang, pitch rises slightly with combo
      tone(c, 900 + comboLevel * 40, 0.09, 'square', 0.05, 0, 300);
      noise(c, 0.05, 0.04, 0, 'highpass', 3000);
      break;
    case 'hit':
      noise(c, 0.08, 0.12, 0, 'lowpass', 1800);
      tone(c, 220, 0.08, 'square', 0.05, 0, 120);
      break;
    case 'explode':
      noise(c, 0.45, 0.25, 0, 'lowpass', 900);
      tone(c, 120, 0.4, 'sawtooth', 0.08, 0, 40);
      break;
    case 'wrong':
      tone(c, 160, 0.15, 'square', 0.06, 0, 110);
      break;
    case 'hurt':
      tone(c, 440, 0.12, 'square', 0.1, 0, 220);
      tone(c, 330, 0.2, 'square', 0.1, 0.1, 140);
      noise(c, 0.3, 0.15, 0, 'lowpass', 600);
      break;
    case 'combo':
      [659, 784, 988, 1319].forEach((f, i) => tone(c, f, 0.1, 'triangle', 0.08, i * 0.05));
      break;
    case 'wave':
      tone(c, 196, 0.35, 'sawtooth', 0.06, 0);
      tone(c, 262, 0.35, 'sawtooth', 0.06, 0.3);
      tone(c, 392, 0.6, 'sawtooth', 0.07, 0.6);
      break;
    case 'boss':
      tone(c, 98, 0.6, 'sawtooth', 0.1, 0);
      tone(c, 92, 0.6, 'sawtooth', 0.1, 0.5);
      tone(c, 73, 1.0, 'sawtooth', 0.12, 1.0);
      noise(c, 1.2, 0.08, 0.2, 'lowpass', 300);
      break;
    case 'hiss':
      noise(c, 0.9, 0.06, 0, 'highpass', 4000);
      break;
    case 'countdown':
      tone(c, 523, 0.15, 'square', 0.07);
      break;
    case 'go':
      tone(c, 1047, 0.35, 'square', 0.08);
      break;
    case 'victory':
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
        tone(c, f, i === 6 ? 0.6 : 0.14, 'square', 0.07, i * 0.13),
      );
      break;
    case 'defeat':
      [392, 370, 349, 330].forEach((f, i) => tone(c, f, 0.35, 'triangle', 0.1, i * 0.3));
      break;
  }
}
