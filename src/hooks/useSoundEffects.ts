import { useRef, useCallback } from 'react';

type SoundType =
  | 'correct'
  | 'incorrect'
  | 'achievement'
  | 'click'
  | 'complete'
  | 'timer_warning'
  | 'countdown_beep';

const AudioContextClass =
  typeof window !== 'undefined'
    ? window.AudioContext || (window as any).webkitAudioContext
    : null;

function createAudioContext(): AudioContext | null {
  if (!AudioContextClass) return null;
  try {
    return new AudioContextClass();
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue = 0.15,
  delay = 0,
) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

  gainNode.gain.setValueAtTime(gainValue, ctx.currentTime + delay);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime + delay);
  oscillator.stop(ctx.currentTime + delay + duration);
}

function playNoise(ctx: AudioContext, duration: number, gainValue = 0.05, delay = 0) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(gainValue, ctx.currentTime + delay);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1000;

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start(ctx.currentTime + delay);
  source.stop(ctx.currentTime + delay + duration);
}

export function useSoundEffects() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioContext();
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const play = useCallback(
    (type: SoundType) => {
      const ctx = getCtx();
      if (!ctx) return;

      switch (type) {
        case 'correct':
          playTone(ctx, 523.25, 0.12, 'sine', 0.15, 0);
          playTone(ctx, 659.25, 0.18, 'sine', 0.15, 0.08);
          break;

        case 'incorrect':
          playTone(ctx, 220, 0.25, 'square', 0.08, 0);
          playNoise(ctx, 0.15, 0.04, 0);
          playTone(ctx, 165, 0.2, 'sawtooth', 0.06, 0.1);
          break;

        case 'achievement':
          playTone(ctx, 523.25, 0.15, 'sine', 0.12, 0);
          playTone(ctx, 659.25, 0.15, 'sine', 0.12, 0.1);
          playTone(ctx, 783.99, 0.15, 'sine', 0.12, 0.2);
          playTone(ctx, 1046.5, 0.35, 'sine', 0.15, 0.3);
          playTone(ctx, 1318.5, 0.2, 'triangle', 0.06, 0.4);
          break;

        case 'click':
          playTone(ctx, 800, 0.04, 'square', 0.06, 0);
          break;

        case 'complete':
          playTone(ctx, 523.25, 0.15, 'triangle', 0.12, 0);
          playTone(ctx, 659.25, 0.15, 'triangle', 0.12, 0.12);
          playTone(ctx, 783.99, 0.15, 'triangle', 0.12, 0.24);
          playTone(ctx, 1046.5, 0.15, 'triangle', 0.12, 0.36);
          playTone(ctx, 1318.5, 0.15, 'triangle', 0.12, 0.48);
          playTone(ctx, 1567.98, 0.4, 'sine', 0.15, 0.6);
          break;

        case 'timer_warning':
          playTone(ctx, 880, 0.1, 'square', 0.1, 0);
          playTone(ctx, 880, 0.1, 'square', 0.1, 0.15);
          break;

        case 'countdown_beep':
          playTone(ctx, 440, 0.3, 'sine', 0.12, 0);
          playTone(ctx, 440, 0.3, 'sine', 0.12, 0.35);
          playTone(ctx, 880, 0.5, 'sine', 0.15, 0.7);
          break;
      }
    },
    [getCtx],
  );

  return { play };
}
