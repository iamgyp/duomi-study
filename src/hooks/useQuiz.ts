import { useState, useCallback, useRef } from 'react';

export interface QuizAnswerRecord {
  questionIndex: number;
  answer: string;
}

export function useQuiz(totalQuestions: number) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestion(index);
    }
  }, [totalQuestions]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion, totalQuestions]);

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const setAnswer = useCallback((questionIndex: number, answer: string) => {
    setAnswers(prev => {
      const next = new Map(prev);
      next.set(questionIndex, answer);
      return next;
    });
  }, []);

  const answeredCount = answers.size;
  const isAllAnswered = answeredCount >= totalQuestions;

  const submit = useCallback(() => {
    setIsComplete(true);
  }, []);

  const reset = useCallback(() => {
    setCurrentQuestion(0);
    setAnswers(new Map());
    setIsComplete(false);
    startTimeRef.current = Date.now();
  }, []);

  const getElapsedSeconds = useCallback(() => {
    return Math.round((Date.now() - startTimeRef.current) / 1000);
  }, []);

  return {
    currentQuestion,
    answers,
    isComplete,
    totalQuestions,
    answeredCount,
    isAllAnswered,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    setAnswer,
    submit,
    reset,
    getElapsedSeconds,
  };
}
