/**
 * Web Audio sound effects synthesizer for the Memory Temple module.
 * Zero external audio files required, purely synthesized in-browser.
 */

let audioCtx: AudioContext | null = null;

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

/** Call on any user gesture to unlock Web Audio API */
export function unlockMemoryAudio() {
  getAudioContext();
}

/** Note Block pitch frequencies (Do, Mi, Sol, High Do) */
export const NOTE_FREQUENCIES = [
  261.63, // C4 (Red - Redstone Lamp)
  329.63, // E4 (Blue - Lapis Lamp)
  392.0,  // G4 (Green - Emerald Lamp)
  523.25, // C5 (Yellow - Gold Lamp)
];

/**
 * Play a Minecraft Note Block style pluck sound.
 * @param index 0 to 3 corresponding to 4 note blocks
 */
export function playNoteSound(index: number, duration = 0.35) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const freq = NOTE_FREQUENCIES[index % NOTE_FREQUENCIES.length] || 300;
  const t0 = ctx.currentTime;

  // Primary tone (warm pluck)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, t0);

  // Attack & Decay
  gain.gain.setValueAtTime(0.001, t0);
  gain.gain.linearRampToValueAtTime(0.35, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  // Wooden percussive click knock
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  clickOsc.type = 'sine';
  clickOsc.frequency.setValueAtTime(freq * 2.2, t0);
  clickOsc.frequency.exponentialRampToValueAtTime(60, t0 + 0.04);
  clickGain.gain.setValueAtTime(0.2, t0);
  clickGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.04);

  clickOsc.connect(clickGain);
  clickGain.connect(ctx.destination);
  clickOsc.start(t0);
  clickOsc.stop(t0 + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration);
}

/** Card flip sound */
export function playCardFlipSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, t0);
  osc.frequency.exponentialRampToValueAtTime(580, t0 + 0.08);

  gain.gain.setValueAtTime(0.12, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.09);
}

/** Card match success chime (like Minecraft XP orb pickup) */
export function playMatchSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t0 = ctx.currentTime;
  const notes = [587.33, 880.0]; // D5 -> A5

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = t0 + idx * 0.09;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.001, noteTime);
    gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(noteTime);
    osc.stop(noteTime + 0.23);
  });
}

/** Card mismatch dull bump */
export function playMismatchSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(160, t0);
  osc.frequency.exponentialRampToValueAtTime(110, t0 + 0.16);

  gain.gain.setValueAtTime(0.18, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.17);
}

/** Level complete victory fanfare */
export function playVictorySound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t0 = ctx.currentTime;
  const melody = [
    { freq: 440, delay: 0, dur: 0.1 },     // A4
    { freq: 554.37, delay: 0.11, dur: 0.1 },// C#5
    { freq: 659.25, delay: 0.22, dur: 0.1 },// E5
    { freq: 880, delay: 0.33, dur: 0.35 },  // A5
  ];

  melody.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const time = t0 + note.delay;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(note.freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.3, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + note.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + note.dur + 0.05);
  });
}

/** Sequence error buzzer */
export function playSequenceErrorSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, t0);
  osc.frequency.linearRampToValueAtTime(90, t0 + 0.25);

  gain.gain.setValueAtTime(0.2, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.26);
}
