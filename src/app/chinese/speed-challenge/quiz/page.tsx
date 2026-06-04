'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChineseSpeedQuizConfig } from '@/lib/chinese-speed-generator';
import { useChineseSpeedQuiz } from '@/hooks/useChineseSpeedQuiz';
import { saveQuizSession } from '@/lib/quiz-engine';
import { updateDifficultyProgression } from '@/lib/difficulty-progression';
import { useAchievements } from '@/hooks/useAchievements';
import { CountdownTimer } from '@/components/CountdownTimer';
import { AchievementToast } from '@/components/AchievementToast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { addScore } from '@/lib/leaderboard';
import { useTranslation } from '@/hooks/useTranslation';

const defaultConfig: ChineseSpeedQuizConfig = {
  timeLimitSeconds: 60,
  difficulty: 1,
};

export default function ChineseSpeedChallengeQuizPage() {
  return (
    <Suspense>
      <ChineseSpeedChallengeQuizContent />
    </Suspense>
  );
}

function ChineseSpeedChallengeQuizContent() {
  const searchParams = useSearchParams();
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);

  const config: ChineseSpeedQuizConfig = {
    timeLimitSeconds: (parseInt(searchParams.get('timeLimit') || '60', 10) as 30 | 60 | 120) || defaultConfig.timeLimitSeconds,
    difficulty: (parseInt(searchParams.get('difficulty') || '1', 10) as 1 | 2 | 3) || defaultConfig.difficulty,
  };

  const quiz = useChineseSpeedQuiz(config);
  const { pendingUnlocks, checkAndUnlock, dismissPending } = useAchievements();
  const { play } = useSoundEffects();

  useEffect(() => {
    if (quiz.state === 'timeUp' && !finished) {
      setFinished(true);

      const accuracy = quiz.attemptedCount > 0 ? quiz.correctCount / quiz.attemptedCount : 0;
      const qpm = config.timeLimitSeconds > 0 ? (quiz.correctCount / config.timeLimitSeconds) * 60 : 0;

      saveQuizSession({
        subject: 'chinese-speed',
        timestamp: new Date().toISOString(),
        totalQuestions: quiz.attemptedCount,
        correctCount: quiz.correctCount,
        accuracy,
        duration: config.timeLimitSeconds,
        answers: quiz.answers.map((a) => ({
          questionId: a.question.id,
          userAnswer: a.selectedOption,
          correct: a.correct,
          questionText: a.question.character ? a.question.character : a.question.id,
          correctAnswer: a.question.pinyin,
        })),
      });

      addScore('chinese-speed', { score: accuracy, totalQuestions: quiz.attemptedCount, duration: config.timeLimitSeconds, questionsPerMinute: qpm, date: new Date().toISOString() });

      updateDifficultyProgression('chinese-speed');
      if (quiz.correctCount > 0) play('complete');

      checkAndUnlock();
    }
  }, [quiz.state, finished, quiz.answers, quiz.attemptedCount, quiz.correctCount, config.timeLimitSeconds, checkAndUnlock]);

  // Play correct/incorrect sounds based on feedback
  useEffect(() => {
    if (quiz.feedback === 'correct') {
      play('correct');
    } else if (quiz.feedback === 'wrong') {
      play('incorrect');
    }
  }, [quiz.feedback, play]);

  const handleAnswer = useCallback((option: string) => {
    quiz.submitAnswer(option);
  }, [quiz]);

  const handleRetry = () => {
    quiz.reset();
    setFinished(false);
    setStarted(false);
  };

  if (finished) {
    const wrongAnswers = quiz.answers.filter((a) => !a.correct);
    const speedWrongAnswers = wrongAnswers.map(a => ({
      questionIndex: a.questionIndex,
      question: a.question,
      selectedOption: a.selectedOption,
      correct: false,
    }));
    return (
      <>
        <ChineseSpeedResult
          correctCount={quiz.correctCount}
          attemptedCount={quiz.attemptedCount}
          timeLimitSeconds={config.timeLimitSeconds}
          wrongAnswers={speedWrongAnswers}
          onRetry={handleRetry}
        />
        {pendingUnlocks.length > 0 && (
          <AchievementToast unlocks={pendingUnlocks} onDismiss={dismissPending} />
        )}
      </>
    );
  }

  if (!started) {
    const diffLabel = config.difficulty === 1 ? '⭐ 基础' : config.difficulty === 2 ? '⭐⭐ 进阶' : '⭐⭐⭐ 挑战';
    return (
      <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
        <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-[#333] mb-2">汉字速认挑战</h1>
          <p className="text-gray-600 mb-6">
            {config.timeLimitSeconds}秒 · {diffLabel}
          </p>
          <p className="text-gray-500 mb-6 text-sm">
            看汉字选择正确的拼音，答对自动进入下一题。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => { quiz.start(); setStarted(true); }} className="mc-btn bg-[#F59E0B] text-white flex-1 py-3">
              开始挑战
            </button>
            <Link href="/chinese/speed-challenge" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> 返回设置
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <Link href="/chinese/speed-challenge" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回设置
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">汉字速认挑战</h1>
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <CountdownTimer
            secondsRemaining={quiz.timeRemaining}
            totalSeconds={config.timeLimitSeconds}
            state={quiz.state}
          />
        </div>

        <div className="text-center mb-4">
          <span className="text-white/80 text-lg">
            已答对: <span className="text-green-400 font-bold text-2xl">{quiz.correctCount}</span> / {quiz.attemptedCount}
          </span>
        </div>

        <div className="mc-card bg-white p-6 sm:p-12 mb-6">
          {quiz.currentQuestion ? (
            <>
              <div className="text-center mb-8">
                <p className="text-gray-500 mb-4 text-lg">{quiz.currentQuestion.questionText}</p>
                <div className="text-7xl sm:text-9xl font-bold text-[#333] leading-tight" style={{ fontFamily: '"KaiTi", "楷体", serif' }}>
                  {quiz.currentQuestion.character}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                {quiz.currentQuestion.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className={`mc-btn py-6 text-2xl sm:text-3xl font-sans transition-colors ${
                      quiz.feedback && quiz.answers.length > 0 &&
                      quiz.answers[quiz.answers.length - 1].selectedOption === opt
                        ? quiz.feedback === 'correct'
                          ? 'bg-[#4CAF50] text-white border-black'
                          : 'bg-red-500 text-white border-black'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
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

function ChineseSpeedResult({
  correctCount,
  attemptedCount,
  timeLimitSeconds,
  wrongAnswers,
  onRetry,
}: {
  correctCount: number;
  attemptedCount: number;
  timeLimitSeconds: number;
  wrongAnswers: any[];
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const questionsPerMinute = timeLimitSeconds > 0
    ? ((correctCount / timeLimitSeconds) * 60).toFixed(1)
    : '0.0';
  const isPerfect = accuracy === 100 && attemptedCount > 0;

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
      <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-2xl w-full text-center">
        <div className="text-6xl mb-4">{isPerfect ? '🏆' : '📝'}</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#333] mb-2">
          {isPerfect ? t('ChineseSpeedChallenge.perfectComplete') : t('ChineseSpeedChallenge.timeUp')}
        </h1>
        <p className="text-lg text-gray-600 mb-6">{t('ChineseSpeedChallenge.title')}</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border-2 border-black p-4">
            <div className="text-4xl font-bold text-[#4CAF50]">{accuracy}%</div>
            <div className="text-sm text-gray-500 mt-1">{t('ChineseSpeedChallenge.accuracy')}</div>
            <div className="text-lg font-bold text-[#333] mt-1">{correctCount}/{attemptedCount}</div>
          </div>
          <div className="bg-white border-2 border-black p-4">
            <div className="text-4xl font-bold text-[#F59E0B]">{questionsPerMinute}</div>
            <div className="text-sm text-gray-500 mt-1">{t('ChineseSpeedChallenge.questionsPerMinute')}</div>
          </div>
          <div className="bg-white border-2 border-black p-4">
            <div className="text-4xl font-bold text-[#2196F3]">{timeLimitSeconds}s</div>
            <div className="text-sm text-gray-500 mt-1">{t('ChineseSpeedChallenge.timeUsed')}</div>
          </div>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="mb-8 text-left">
            <h2 className="text-xl font-bold text-[#333] mb-3 flex items-center gap-2">
              <span className="text-red-500">❌</span> {t('ChineseSpeedChallenge.wrongReview')}
            </h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {wrongAnswers.map((wa, i) => (
                <div key={i} className="bg-red-50 border-2 border-red-200 rounded p-3">
                  <div className="text-sm">
                    <span className="text-2xl" style={{ fontFamily: '"KaiTi", "楷体", serif' }}>{wa.question.character}</span>
                    <span className="ml-2 text-gray-500">{wa.question.questionText}</span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-red-600">{t('ChineseSpeedChallenge.yourAnswer')}: {wa.selectedOption}</span>
                    <span className="text-green-600 ml-3">{t('ChineseSpeedChallenge.correctPinyin')}: {wa.question.pinyin}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="mc-btn bg-[#4CAF50] text-white flex-1 py-3 flex items-center justify-center gap-2"
          >
            {t('ChineseSpeedChallenge.retry')}
          </button>
          <Link href="/chinese/speed-challenge" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> {t('ChineseSpeedChallenge.backToConfig')}
          </Link>
        </div>
      </div>
    </div>
  );
}
