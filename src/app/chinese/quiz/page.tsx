'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { PoemConfig } from '@/lib/poem-generator';
import { generateChineseQuizQuestions, saveQuizSession } from '@/lib/quiz-engine';
import { useQuiz } from '@/hooks/useQuiz';
import { useAchievements } from '@/hooks/useAchievements';
import { QuizProgressBar } from '@/components/QuizProgressBar';
import { QuizNav } from '@/components/QuizNav';
import { QuizResult } from '@/components/QuizResult';
import { AchievementToast } from '@/components/AchievementToast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const defaultConfig: PoemConfig = {
  difficulty: 1,
  count: 3,
  showAnswers: false,
  showPinyin: true,
};

export default function ChineseQuizPage() {
  const [config] = useState<PoemConfig>(defaultConfig);
  const [started, setStarted] = useState(false);

  const questions = useState(() =>
    generateChineseQuizQuestions(config)
  )[0];

  const quiz = useQuiz(questions.length);
  const [results, setResults] = useState<{ correctCount: number; wrongAnswers: { poemTitle: string; author: string; dynasty: string; lines: Array<{ text: string; wrongChars: Array<{ charIndex: number; userAnswer: string; correctAnswer: string }> }> }[] } | null>(null);
  const { pendingUnlocks, checkAndUnlock, dismissPending } = useAchievements();

  const handleSubmit = () => {
    let correctCount = 0;
    const wrongAnswers: { poemTitle: string; author: string; dynasty: string; lines: Array<{ text: string; wrongChars: Array<{ charIndex: number; userAnswer: string; correctAnswer: string }> }> }[] = [];

    questions.forEach((q, qi) => {
      const lineErrors = new Map<number, { text: string; wrongChars: Array<{ charIndex: number; userAnswer: string; correctAnswer: string }> }>();

      q.blanks.forEach((blank, bi) => {
        const blankKey = qi * 100 + bi;
        const userAnswer = quiz.answers.get(blankKey) || '';
        const isCorrect = userAnswer.trim() === blank.correctAnswer;
        if (isCorrect) {
          correctCount++;
        } else {
          if (!lineErrors.has(blank.lineIndex)) {
            lineErrors.set(blank.lineIndex, {
              text: q.poem.lines[blank.lineIndex].text,
              wrongChars: [],
            });
          }
          lineErrors.get(blank.lineIndex)!.wrongChars.push({
            charIndex: blank.charIndex,
            userAnswer: userAnswer || '未作答',
            correctAnswer: blank.correctAnswer,
          });
        }
      });

      if (lineErrors.size > 0) {
        wrongAnswers.push({
          poemTitle: q.poem.title,
          author: q.poem.author,
          dynasty: q.poem.dynasty,
          lines: Array.from(lineErrors.values()),
        });
      }
    });

    const totalBlanks = questions.reduce((sum, q) => sum + q.blanks.length, 0);
    const elapsed = quiz.getElapsedSeconds();

    saveQuizSession({
      subject: 'chinese-poem',
      timestamp: new Date().toISOString(),
      totalQuestions: totalBlanks,
      correctCount,
      accuracy: totalBlanks > 0 ? correctCount / totalBlanks : 0,
      duration: elapsed,
      answers: [],
    });

    setResults({ correctCount, wrongAnswers });
    checkAndUnlock();
  };

  if (results) {
    return (
      <>
        <QuizResult
          subject="语文在线古诗填空"
          totalQuestions={questions.reduce((sum, q) => sum + q.blanks.length, 0)}
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
    const diffLabel = config.difficulty === 1 ? '⭐ 初级' : config.difficulty === 2 ? '⭐⭐ 中级' : '⭐⭐⭐ 高级';
    return (
      <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
        <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-[#333] mb-2">古诗填空在线练习</h1>
          <p className="text-gray-600 mb-6">{diffLabel} · {questions.length} 首诗</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setStarted(true)} className="mc-btn bg-[#F59E0B] text-white flex-1 py-3">
              开始答题
            </button>
            <Link href="/chinese" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
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
        <Link href="/chinese" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回语文
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">古诗填空在线练习</h1>
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-4 relative">
          <QuizProgressBar answered={quiz.answeredCount} total={quiz.totalQuestions} />
        </div>

        <div className="mc-card bg-white p-6 sm:p-12 mb-6">
          <div className="text-center mb-4">
            <span className="text-sm text-gray-400">第 {quiz.currentQuestion + 1} / {quiz.totalQuestions} 首</span>
            <h2 className="text-2xl font-bold text-[#333] mt-2">{currentQ.poem.title}</h2>
            <p className="text-gray-500">【{currentQ.poem.dynasty}】{currentQ.poem.author}</p>
          </div>

          <div className="space-y-4 text-center">
            {currentQ.poem.lines.map((line, lineIdx) => (
              <div key={lineIdx} className="text-xl sm:text-3xl font-serif leading-relaxed">
                {line.text.split('').map((char, charIdx) => {
                  const blankInfo = currentQ.blanks.find(b => b.lineIndex === lineIdx && b.charIndex === charIdx);
                  if (blankInfo) {
                    const blankKey = quiz.currentQuestion * 100 + currentQ.blanks.indexOf(blankInfo);
                    const userAnswer = quiz.answers.get(blankKey) || '';
                    return (
                      <input
                        key={charIdx}
                        type="text"
                        maxLength={1}
                        value={userAnswer}
                        onChange={(e) => quiz.setAnswer(blankKey, e.target.value)}
                        className="inline-block w-8 sm:w-10 h-10 sm:h-12 text-center border-b-2 border-[#F59E0B] bg-yellow-50 text-lg sm:text-2xl focus:outline-none focus:border-[#F59E0B] focus:bg-yellow-100 font-serif"
                        style={{ fontFamily: '"KaiTi", "楷体", serif' }}
                      />
                    );
                  }
                  return <span key={charIdx}>{char}</span>;
                })}
              </div>
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
            className="mc-btn bg-[#F59E0B] text-white py-4 px-12 text-xl flex items-center gap-2 mx-auto"
          >
            <CheckCircle className="h-5 w-5" /> 提交答案
          </button>
        </div>
      </div>
    </div>
  );
}
