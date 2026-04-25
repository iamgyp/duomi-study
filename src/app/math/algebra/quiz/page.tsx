'use client';

import { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { AlgebraConfig } from '@/lib/algebra-generator';
import { generateAlgebraQuizQuestions, saveQuizSession } from '@/lib/quiz-engine';
import { useQuiz } from '@/hooks/useQuiz';
import { useAchievements } from '@/hooks/useAchievements';
import { QuizProgressBar } from '@/components/QuizProgressBar';
import { QuizNav } from '@/components/QuizNav';
import { QuizResult } from '@/components/QuizResult';
import { AchievementToast } from '@/components/AchievementToast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

function getConfigFromUrl(): AlgebraConfig {
  if (typeof window === 'undefined') {
    return { difficulty: 2, count: 20, language: 'zh' };
  }
  const params = new URLSearchParams(window.location.search);
  const difficulty = parseInt(params.get('difficulty') || '2', 10);
  const count = parseInt(params.get('count') || '20', 10);
  const language = params.get('language') || 'zh';
  return {
    difficulty: [1, 2, 3].includes(difficulty) ? difficulty as 1 | 2 | 3 : 2,
    count: [10, 20, 50].includes(count) ? count as 10 | 20 | 50 : 20,
    language: language === 'en' ? 'en' : 'zh',
  };
}

const defaultConfig: AlgebraConfig = getConfigFromUrl();

export default function AlgebraQuizPage() {
  const [config] = useState<AlgebraConfig>(defaultConfig);
  const [started, setStarted] = useState(false);

  const { questions, itemSets } = useMemo(
    () => generateAlgebraQuizQuestions(config),
    [config],
  );

  const quiz = useQuiz(questions.length);
  const [results, setResults] = useState<{ correctCount: number; wrongAnswers: any[] } | null>(null);
  const { pendingUnlocks, checkAndUnlock, dismissPending } = useAchievements();

  const handleAnswer = useCallback((opt: string) => {
    quiz.setAnswer(quiz.currentQuestion, opt);
    if (quiz.currentQuestion < quiz.totalQuestions - 1) {
      setTimeout(() => quiz.nextQuestion(), 400);
    }
  }, [quiz]);

  const handleSubmit = () => {
    let correctCount = 0;
    const wrongAnswers: any[] = [];

    questions.forEach((q, i) => {
      const userAnswer = quiz.answers.get(i) || '';
      const correct = userAnswer === q.options[q.correctIndex];
      const itemDisplay = q.items.map(({ item, quantity }) => `${item.emoji}×${quantity}`).join(' + ');
      if (correct) {
        correctCount++;
      } else {
        wrongAnswers.push({
          questionIndex: i,
          questionText: itemDisplay,
          userAnswer: userAnswer || '未作答',
          correctAnswer: q.options[q.correctIndex],
        });
      }
    });

    const elapsed = quiz.getElapsedSeconds();

    saveQuizSession({
      subject: 'algebra',
      timestamp: new Date().toISOString(),
      totalQuestions: questions.length,
      correctCount,
      accuracy: questions.length > 0 ? correctCount / questions.length : 0,
      duration: elapsed,
      answers: questions.map((q, i) => ({
        questionId: q.id,
        userAnswer: quiz.answers.get(i) || '',
        correct: quiz.answers.get(i) === q.options[q.correctIndex],
      })),
    });

    setResults({ correctCount, wrongAnswers });
    checkAndUnlock();
  };

  if (results) {
    return (
      <>
        <QuizResult
          subject="代数在线挑战"
          totalQuestions={questions.length}
          correctCount={results.correctCount}
          elapsedSeconds={quiz.getElapsedSeconds()}
          wrongAnswers={results.wrongAnswers}
          onRetry={() => window.location.reload()}
        />
        {pendingUnlocks.length > 0 && (
          <AchievementToast unlocks={pendingUnlocks} onDismiss={dismissPending} />
        )}
      </>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
        <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-bold text-[#333] mb-2">代数在线挑战</h1>
          <p className="text-gray-600 mb-6">{questions.length} 道题目</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setStarted(true)} className="mc-btn bg-[#4CAF50] text-white flex-1 py-3">
              开始答题
            </button>
            <Link href="/math/algebra" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> 返回
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[quiz.currentQuestion];
  const answeredIndices = new Set(quiz.answers.keys());

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <Link href="/math/algebra" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回代数
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">代数在线挑战</h1>
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-4 relative">
          <QuizProgressBar answered={quiz.answeredCount} total={quiz.totalQuestions} />
        </div>

        <div className="mc-card bg-white p-6 sm:p-12 mb-6">
          {/* 当前题物品价格表 */}
          {currentQ.items.length > 0 && (
            <div className="mb-6 flex justify-center gap-6 flex-wrap">
              {currentQ.items.map(({ item, quantity }, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#F5F5DC] border-2 border-black px-4 py-2 rounded-sm">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-sm text-gray-500">=</span>
                  <span className="text-lg font-bold text-[#4CAF50]">{item.price}{config.language === 'zh' ? '元' : '$'}</span>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mb-6">
            <span className="text-sm text-gray-400">第 {quiz.currentQuestion + 1} / {quiz.totalQuestions} 题</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#333] mt-4">{currentQ.questionText}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className={`mc-btn py-6 text-lg sm:text-xl font-sans ${
                  quiz.answers.get(quiz.currentQuestion) === opt
                    ? 'bg-[#4CAF50] text-white border-black'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <QuizNav
            current={quiz.currentQuestion}
            total={quiz.totalQuestions}
            answeredIndices={answeredIndices}
            onGoTo={quiz.goToQuestion}
            onPrev={quiz.prevQuestion}
            onNext={quiz.nextQuestion}
          />
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!quiz.isAllAnswered}
            className="mc-btn bg-[#4CAF50] text-white py-4 px-12 text-xl disabled:opacity-40 flex items-center gap-2 mx-auto"
          >
            <CheckCircle className="h-5 w-5" /> 提交答案
          </button>
        </div>
      </div>
    </div>
  );
}
