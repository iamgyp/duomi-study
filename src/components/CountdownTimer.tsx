'use client';

import React, { useRef, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface CountdownTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
  state: 'idle' | 'running' | 'timeUp';
}

export function CountdownTimer({ secondsRemaining, totalSeconds, state }: CountdownTimerProps) {
  const { t } = useTranslation();
  const { play } = useSoundEffects();
  const ratio = totalSeconds > 0 ? secondsRemaining / totalSeconds : 0;

  let barColor = '#4CAF50'; // green
  if (ratio <= 0.25) {
    barColor = '#EF4444'; // red
  } else if (ratio <= 0.5) {
    barColor = '#F59E0B'; // yellow
  }

  const isFlashing = ratio <= 0.25 && state === 'running';
  const prevSecondsRef = useRef(secondsRemaining);

  // Play timer warning sound when entering final 10 seconds
  useEffect(() => {
    if (secondsRemaining <= 10 && secondsRemaining > 0 && prevSecondsRef.current > secondsRemaining) {
      play('timer_warning');
    }
    prevSecondsRef.current = secondsRemaining;
  }, [secondsRemaining, play]);

  if (state === 'timeUp') {
    return (
      <div className="w-full bg-black/30 rounded-sm border-2 border-white/20 h-12 overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center text-red-400 text-2xl font-bold animate-pulse">
          {t('SpeedChallenge.timeUp')}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black/30 rounded-sm border-2 border-white/20 h-12 overflow-hidden relative">
      <div
        className={`h-full transition-all duration-1000 ${isFlashing ? 'animate-pulse' : ''}`}
        style={{
          width: `${ratio * 100}%`,
          backgroundColor: barColor,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold drop-shadow-md">
        {secondsRemaining}s
      </div>
    </div>
  );
}
