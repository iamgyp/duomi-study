'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SpeedQuizConfig } from '@/lib/speed-generator';
import { useSpeedQuiz } from '@/hooks/useSpeedQuiz';
import { saveQuizSession } from '@/lib/quiz-engine';
import { updateDifficultyProgression } from '@/lib/difficulty-progression';
import { useAchievements } from '@/hooks/useAchievements';
import { CountdownTimer } from '@/components/CountdownTimer';
import { SpeedResult } from '@/components/SpeedResult';
import { AchievementToast } from '@/components/AchievementToast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { addScore } from '@/lib/leaderboard';

const defaultConfig: SpeedQuizConfig = {
  timeLimitSeconds: 60,
  max: 20,
  operation: 'mix',
};

export default function SpeedChallengeQuizPage() {
  return (
    <Suspense>
      <SpeedChallengeQuizContent />
    </Suspense>
  );
}

function SpeedChallengeQuizContent() {
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);

  const config: SpeedQuizConfig = {
    timeLimitSeconds: (parseInt(searchParams.get('timeLimit') || '60', 10) as 30 | 60 | 120) || defaultConfig.timeLimitSeconds,
    max: parseInt(searchParams.get('max') || '20', 10) || defaultConfig.max,
    operation: (searchParams.get('operation') as SpeedQuizConfig['operation']) || defaultConfig.operation,
  };

  const quiz = useSpeedQuiz(config);
  const { pendingUnlocks, checkAndUnlock, dismissPending } = useAchievements();

  // Auto-focus input when question changes
  useEffect(() => {
    if (quiz.state === 'running' && quiz.currentQuestion && inputRef.current) {
      inputRef.current.focus();
    }
  }, [quiz.currentQuestion, quiz.state]);

  // Save session and check achievements when time's up
  useEffect(() => {
    if (quiz.state === 'timeUp' && !finished) {
      setFinished(true);

      const accuracy = quiz.attemptedCount > 0 ? quiz.correctCount / quiz.attemptedCount : 0;
      const qpm = config.timeLimitSeconds > 0 ? (quiz.correctCount / config.timeLimitSeconds) * 60 : 0;

      saveQuizSession({
        subject: 'speed-challenge',
        timestamp: new Date().toISOString(),
        totalQuestions: quiz.attemptedCount,
        correctCount: quiz.correctCount,
        accuracy,
        duration: config.timeLimitSeconds,
        answers: quiz.answers.map((a) => ({
          questionId: a.question.id,
          userAnswer: a.userAnswer,
          correct: a.correct,
          questionText: a.question.questionText,
          correctAnswer: String(a.question.answer),
        })),
      });

      addScore('speed-challenge', { score: accuracy, totalQuestions: quiz.attemptedCount, duration: config.timeLimitSeconds, questionsPerMinute: qpm, date: new Date().toISOString() });

      updateDifficultyProgression('speed-challenge');

      checkAndUnlock();
    }
  }, [quiz.state, finished, quiz.answers, quiz.attemptedCount, quiz.correctCount, config.timeLimitSeconds, checkAndUnlock]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      quiz.submitAnswer(quiz.questionInput);
    }
  }, [quiz]);

  const handleRetry = () => {
    quiz.reset();
    setFinished(false);
    setStarted(false);
  };

  // Show result when time's up
  if (finished) {
    const wrongAnswers = quiz.answers.filter((a) => !a.correct);
    return (
      <>
        <SpeedResult
          correctCount={quiz.correctCount}
          attemptedCount={quiz.attemptedCount}
          timeLimitSeconds={config.timeLimitSeconds}
          wrongAnswers={wrongAnswers}
          onRetry={handleRetry}
        />
        {pendingUnlocks.length > 0 && (
          <AchievementToast unlocks={pendingUnlocks} onDismiss={dismissPending} />
        )}
      </>
    );
  }

  // Ready screen
  if (!started) {
    const opLabel = config.operation === 'mix' ? '混合' : config.operation === 'add' ? '加法' : config.operation === 'sub' ? '减法' : config.operation === 'div' ? '除法' : '乘法';
    return (
      <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
        <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">⚡</div>
          <h1 className="text-3xl font-bold text-[#333] mb-2">口算速算挑战</h1>
          <p className="text-gray-600 mb-6">
            {config.timeLimitSeconds}秒 · 最大值{config.max} · {opLabel}
          </p>
          <p className="text-gray-500 mb-6 text-sm">
            在限定时间内尽可能多地答题，输入答案后按 Enter 键确认。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setStarted(true);
                quiz.start();
              }}
              className="mc-btn bg-[#9C27B0] text-white flex-1 py-3"
            >
              开始挑战
            </button>
            <Link href="/math/speed-challenge" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> 返回设置
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz
  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      {/* Header */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <Link href="/math/speed-challenge" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回设置
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">口算速算挑战</h1>
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Countdown Timer */}
        <div className="mb-6">
          <CountdownTimer
            secondsRemaining={quiz.timeRemaining}
            totalSeconds={config.timeLimitSeconds}
            state={quiz.state as 'running' | 'timeUp'}
          />
        </div>

        {/* Score Display */}
        <div className="text-center mb-4">
          <span className="text-white/80 text-lg">
            已答对: <span className="text-green-400 font-bold text-2xl">{quiz.correctCount}</span> / {quiz.attemptedCount}
          </span>
        </div>

        {/* Question Card */}
        <div className="mc-card bg-white p-6 sm:p-12 mb-6">
          {quiz.currentQuestion ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-4xl sm:text-6xl font-bold text-[#333]">
                  {quiz.currentQuestion.questionText}
                </h2>
              </div>

              <div className="max-w-md mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={quiz.questionInput}
                  onChange={(e) => quiz.setQuestionInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入答案..."
                  disabled={quiz.state !== 'running'}
                  className={`w-full border-2 p-4 text-3xl text-center focus:outline-none focus:ring-2 font-sans transition-colors ${
                    quiz.feedback === 'correct'
                      ? 'border-green-500 bg-green-50 ring-green-400'
                      : quiz.feedback === 'wrong'
                      ? 'border-red-500 bg-red-50 ring-red-400'
                      : 'border-black focus:ring-[#9C27B0]'
                  }`}
                />
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 text-xl">准备中...</div>
          )}
        </div>
      </div>
    </div>
  );
}