import { useEffect, useCallback } from 'react';

interface UseKeyboardQuizOptions {
  totalOptions: number;  // Number of answer options (usually 4)
  onAnswer: (optionIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function useKeyboardQuiz({
  totalOptions,
  onAnswer,
  onNext,
  onPrev,
  onSubmit,
  disabled = false,
}: UseKeyboardQuizOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled) return;
    
    // Ignore if typing in an input field
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    // Number keys 1-4 for options
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= totalOptions) {
      e.preventDefault();
      onAnswer(num - 1);
    }

    // Arrow keys for navigation
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onNext();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onPrev();
    }

    // Enter to submit
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  }, [totalOptions, onAnswer, onNext, onPrev, onSubmit, disabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
