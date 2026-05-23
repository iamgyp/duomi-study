'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { generateEnglishSpeedQuestion, EnglishSpeedQuizConfig, EnglishSpeedQuestion } from '@/lib/english-speed-generator';

export type SpeedQuizState = 'idle' | 'running' | 'timeUp';

export interface EnglishSpeedQuizAnswer {
  questionIndex: number;
  question: EnglishSpeedQuestion;
  selectedOption: string;
  correct: boolean;
}

export function useEnglishSpeedQuiz(config: EnglishSpeedQuizConfig) {
  const [state, setState] = useState<SpeedQuizState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(config.timeLimitSeconds);
  const [currentQuestion, setCurrentQuestion] = useState<EnglishSpeedQuestion | null>(null);
  const [answers, setAnswers] = useState<EnglishSpeedQuizAnswer[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generateNextQuestion = useCallback(() => {
    const next = generateEnglishSpeedQuestion(config);
    setCurrentQuestion(next);
  }, [config]);

  const start = useCallback(() => {
    setState('running');
    setTimeRemaining(config.timeLimitSeconds);
    setAnswers([]);
    setCorrectCount(0);
    setFeedback(null);
    generateNextQuestion();

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setState('timeUp');
          setCurrentQuestion(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [config, generateNextQuestion]);

  const submitAnswer = useCallback((selectedOption: string) => {
    if (state !== 'running' || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.word;

    const answer: EnglishSpeedQuizAnswer = {
      questionIndex: answers.length,
      question: currentQuestion,
      selectedOption,
      correct: isCorrect,
    };

    setAnswers((prev) => [...prev, answer]);
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      generateNextQuestion();
    }, 500);
  }, [state, currentQuestion, answers.length, generateNextQuestion]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setState('idle');
    setTimeRemaining(config.timeLimitSeconds);
    setCurrentQuestion(null);
    setAnswers([]);
    setCorrectCount(0);
    setFeedback(null);
  }, [config.timeLimitSeconds]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  return {
    state,
    timeRemaining,
    currentQuestion,
    answers,
    correctCount,
    attemptedCount: answers.length,
    feedback,
    start,
    submitAnswer,
    reset,
  };
}
