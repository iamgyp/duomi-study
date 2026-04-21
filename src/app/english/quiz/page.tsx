'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { generateEnglishQuizQuestions, saveQuizSession } from '@/lib/quiz-engine';
import { useQuiz } from '@/hooks/useQuiz';
import { useAchievements } from '@/hooks/useAchievements';
import { QuizProgressBar } from '@/components/QuizProgressBar';
import { QuizNav } from '@/components/QuizNav';
import { QuizResult } from '@/components/QuizResult';
import { AchievementToast } from '@/components/AchievementToast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const DEFAULT_WORDS = ['Apple', 'Banana', 'Cat', 'Dog', 'Elephant', 'Fish', 'Grape', 'Hat', 'Ice', 'Jump'];

export default function EnglishQuizPage() {
  const [words] = useState(() => DEFAULT_WORDS);
  const [started, setStarted] = useState(false);

  const questions = useState(() =>
    generateEnglishQuizQuestions(words)
  )[0];

  const quiz = useQuiz(questions.length);
  const [results, setResults] = useState<{ correctCount: number; wrongAnswers: any[] } | null>(null);
  const { pendingUnlocks, checkAndUnlock, dismissPending } = useAchievements();

  const handleSubmit = () => {
    let correctCount = 0;
    const wrongAnswers: any[] = [];

    questions.forEach((q, i) => {
      const userAnswer = quiz.answers.get(i) || '';
      const isCorrect = userAnswer.trim().toLowerCase() === q.word.toLowerCase();
      if (isCorrect) {
        correctCount++;
      } else {
        wrongAnswers.push({
          questionIndex: i,
          questionText: `拼写: ${q.hint}`,
          userAnswer: userAnswer || '未作答',
          correctAnswer: q.word,
        });
      }
    });

    const elapsed = quiz.getElapsedSeconds();

    saveQuizSession({
      subject: 'english',
      timestamp: new Date().toISOString(),
      totalQuestions: questions.length,
      correctCount,
      accuracy: questions.length > 0 ? correctCount / questions.length : 0,
      duration: elapsed,
      answers: questions.map((q, i) => ({
        questionId: q.id,
        userAnswer: quiz.answers.get(i) || '',
        correct: quiz.answers.get(i)?.trim().toLowerCase() === q.word.toLowerCase(),
      })),
    });

    setResults({ correctCount, wrongAnswers });
    checkAndUnlock();
  };

  if (results) {
    return (
      <>
        <QuizResult
          subject="英语在线拼写练习"
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
          <div className="text-6xl mb-4">🔤</div>
          <h1 className="text-3xl font-bold text-[#333] mb-2">英语拼写在线练习</h1>
          <p className="text-gray-600 mb-6">{questions.length} 个单词</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setStarted(true)} className="mc-btn bg-[#3B82F6] text-white flex-1 py-3">
              开始答题
            </button>
            <Link href="/english" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
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
        <Link href="/english" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回英语
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">英语拼写在线练习</h1>
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-4 relative">
          <QuizProgressBar answered={quiz.answeredCount} total={quiz.totalQuestions} />
        </div>

        <div className="mc-card bg-white p-6 sm:p-12 mb-6">
          <div className="text-center mb-6">
            <span className="text-sm text-gray-400">第 {quiz.currentQuestion + 1} / {quiz.totalQuestions} 题</span>
            <div className="mt-4">
              <p className="text-gray-500 mb-2">提示:</p>
              <p className="text-3xl sm:text-5xl font-bold text-[#333] tracking-widest font-mono">{currentQ.hint}</p>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={quiz.answers.get(quiz.currentQuestion) || ''}
              onChange={(e) => quiz.setAnswer(quiz.currentQuestion, e.target.value)}
              placeholder="输入单词..."
              className="w-full border-2 border-black p-4 text-2xl text-center focus:outline-none focus:ring-2 focus:ring-[#3B82F6] font-sans"
            />
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
            className="mc-btn bg-[#3B82F6] text-white py-4 px-12 text-xl disabled:opacity-40 flex items-center gap-2 mx-auto"
          >
            <CheckCircle className="h-5 w-5" /> 提交答案
          </button>
          {!quiz.isAllAnswered && (
            <p className="text-white/60 mt-2 text-sm">
              还有 {quiz.totalQuestions - quiz.answeredCount} 题未完成
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
