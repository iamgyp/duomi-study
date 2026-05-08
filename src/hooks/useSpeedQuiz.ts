import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSpeedQuestion, SpeedQuizConfig, SpeedQuestion } from '@/lib/speed-generator';

export type SpeedQuizState = 'idle' | 'running' | 'timeUp';

export interface SpeedQuizAnswer {
  questionIndex: number;
  question: SpeedQuestion;
  userAnswer: string;
  correct: boolean;
}

export interface UseSpeedQuizReturn {
  state: SpeedQuizState;
  timeRemaining: number;
  currentQuestion: SpeedQuestion | null;
  answers: SpeedQuizAnswer[];
  correctCount: number;
  attemptedCount: number;
  questionInput: string;
  feedback: 'correct' | 'wrong' | null;

  start: () => void;
  submitAnswer: (input: string) => void;
  reset: () => void;
  setQuestionInput: (value: string) => void;
}

export function useSpeedQuiz(config: SpeedQuizConfig): UseSpeedQuizReturn {
  const [state, setState] = useState<SpeedQuizState>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(config.timeLimitSeconds);
  const [currentQuestion, setCurrentQuestion] = useState<SpeedQuestion | null>(null);
  const [answers, setAnswers] = useState<SpeedQuizAnswer[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionInput, setQuestionInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generateNextQuestion = useCallback(() => {
    const next = generateSpeedQuestion(config);
    setCurrentQuestion(next);
    setQuestionInput('');
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

  const submitAnswer = useCallback((input: string) => {
    if (state !== 'running' || !currentQuestion) return;

    const trimmed = input.trim();
    if (trimmed === '') return;

    const isCorrect = parseInt(trimmed, 10) === currentQuestion.answer;

    const answer: SpeedQuizAnswer = {
      questionIndex: answers.length,
      question: currentQuestion,
      userAnswer: trimmed,
      correct: isCorrect,
    };

    setAnswers((prev) => [...prev, answer]);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

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
    setQuestionInput('');
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
    questionInput,
    feedback,
    start,
    submitAnswer,
    reset,
    setQuestionInput,
  };
}
