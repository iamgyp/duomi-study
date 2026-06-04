'use client';

import { useState, useCallback, Suspense, useMemo } from 'react';
import { ArrowLeft, CheckCircle, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { MathConfig } from '@/lib/math-generator';
import { generateMathQuizQuestions, saveQuizSession } from '@/lib/quiz-engine';
import { updateDifficultyProgression } from '@/lib/difficulty-progression';
import { useQuiz } from '@/hooks/useQuiz';
import { useAchievements } from '@/hooks/useAchievements';
import { QuizProgressBar } from '@/components/QuizProgressBar';
import { QuizNav } from '@/components/QuizNav';
import { QuizResult } from '@/components/QuizResult';
import { AchievementToast } from '@/components/AchievementToast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { HintDisplay } from '@/components/HintDisplay';
import { addScore } from '@/lib/leaderboard';
import { useSearchParams } from 'next/navigation';

function parseUrlParams(searchParams: URLSearchParams): { config: MathConfig; practice: boolean } {
  const operation = (searchParams.get('operation') as MathConfig['operation']) || 'mix';
  const max = parseInt(searchParams.get('max') || '20', 10);
  const count = parseInt(searchParams.get('count') || '20', 10);
  const mode = (searchParams.get('mode') as MathConfig['mode']) || 'normal';
  const practice = searchParams.get('practice') === '1';
  return {
    config: {
      operation,
      max: [10, 20, 50, 100].includes(max) ? max : 20,
      count: [20, 50, 100].includes(count) ? count : 20,
      mode,
    },
    practice,
  };
}

export default function MathQuizPage() {
  return (
    <Suspense>
      <MathQuizContent />
    </Suspense>
  );
}

function MathQuizContent() {
  const searchParams = useSearchParams();
  const { config: urlConfig, practice: urlPractice } = parseUrlParams(searchParams);
  const [config] = useState<MathConfig>(urlConfig);
  const [practiceMode] = useState(urlPractice);
  const [started, setStarted] = useState(false);

  const questions = useMemo(
    () => generateMathQuizQuestions(config),
    [config],
  );

  const quiz = useQuiz(questions.length);
  const [results, setResults] = useState<{ correctCount: number; wrongAnswers: { questionIndex: number; questionText: string; userAnswer: string; correctAnswer: string }[] } | null>(null);
  const { pendingUnlocks, checkAndUnlock, dismissPending } = useAchievements();

  // Practice mode: track per-question feedback state
  const [questionFeedback, setQuestionFeedback] = useState<Map<number, 'correct' | 'incorrect'>>(new Map());
  const [showHintFor, setShowHintFor] = useState<Map<number, boolean>>(new Map());
  const [showingFeedback, setShowingFeedback] = useState(false);

  const handleAnswer = useCallback((opt: string) => {
    const qi = quiz.currentQuestion;
    quiz.setAnswer(qi, opt);

    // Capture stable values before setTimeout to avoid stale closure
    const nextQ = quiz.nextQuestion;
    const totalQ = quiz.totalQuestions;

    if (practiceMode) {
      const correct = opt === questions[qi].options[questions[qi].correctIndex];
      const newFeedback = new Map(questionFeedback);
      newFeedback.set(qi, correct ? 'correct' : 'incorrect');
      setQuestionFeedback(newFeedback);

      if (!correct) {
        const newHints = new Map(showHintFor);
        newHints.set(qi, true);
        setShowHintFor(newHints);
      }

      setShowingFeedback(true);
      setTimeout(() => {
        setShowingFeedback(false);
        if (qi < totalQ - 1) {
          nextQ();
        }
      }, 1500);
    } else {
      if (qi < totalQ - 1) {
        setTimeout(() => nextQ(), 400);
      }
    }
  }, [quiz, practiceMode, questionFeedback, showHintFor, questions]);

  const toggleHint = useCallback(() => {
    const qi = quiz.currentQuestion;
    const newHints = new Map(showHintFor);
    newHints.set(qi, !newHints.get(qi));
    setShowHintFor(newHints);
  }, [quiz, showHintFor]);

  const handleSubmit = () => {
    let correctCount = 0;
    const wrongAnswers: { questionIndex: number; questionText: string; userAnswer: string; correctAnswer: string }[] = [];

    questions.forEach((q, i) => {
      const userAnswer = quiz.answers.get(i) || '';
      const correct = userAnswer === q.options[q.correctIndex];
      if (correct) {
        correctCount++;
      } else {
        wrongAnswers.push({
          questionIndex: i,
          questionText: q.questionText,
          userAnswer: userAnswer || '未作答',
          correctAnswer: q.options[q.correctIndex],
        });
      }
    });

    const elapsed = quiz.getElapsedSeconds();

    const accuracy = questions.length > 0 ? correctCount / questions.length : 0;
    const qpm = elapsed > 0 ? (correctCount / elapsed) * 60 : 0;

    saveQuizSession({
      subject: 'math',
      timestamp: new Date().toISOString(),
      totalQuestions: questions.length,
      correctCount,
      accuracy,
      duration: elapsed,
      answers: questions.map((q, i) => ({
        questionId: q.id,
        userAnswer: quiz.answers.get(i) || '',
        correct: quiz.answers.get(i) === q.options[q.correctIndex],
        questionText: q.questionText,
        correctAnswer: q.options[q.correctIndex],
        options: q.options,
      })),
    });

    addScore('math', {
      score: accuracy,
      totalQuestions: questions.length,
      duration: elapsed,
      questionsPerMinute: qpm,
      date: new Date().toISOString(),
    });

    updateDifficultyProgression('math');

    setResults({ correctCount, wrongAnswers });
    checkAndUnlock();
  };

  if (results) {
    return (
      <>
        <QuizResult
          subject="数学在线练习"
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
    const opLabel = config.operation === 'mix' ? '混合' : config.operation === 'add' ? '加法' : config.operation === 'sub' ? '减法' : config.operation === 'mul' ? '乘法' : '除法';
    return (
      <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
        <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">🧮</div>
          <h1 className="text-3xl font-bold text-[#333] mb-2">数学在线练习</h1>
          <p className="text-gray-600 mb-2">
            {questions.length} 道{opLabel}题 · 最大值 {config.max}
          </p>
          {practiceMode && (
            <p className="text-yellow-600 font-bold mb-4 text-sm bg-yellow-100 px-4 py-2 rounded-sm border border-yellow-300 inline-block">
              💡 练习模式 — 答错会显示提示
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setStarted(true)}
              className="mc-btn bg-[#4CAF50] text-white flex-1 py-3"
            >
              开始答题
            </button>
            <Link href="/math" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> 返回
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[quiz.currentQuestion];
  const answeredIndices = new Set(quiz.answers.keys());
  const currentFeedback = questionFeedback.get(quiz.currentQuestion);
  const currentHintVisible = showHintFor.get(quiz.currentQuestion) || false;

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <Link href="/math" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回数学
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">数学在线练习</h1>
        {practiceMode && <span className="text-yellow-300 text-sm">💡 练习模式</span>}
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-4 relative">
          <QuizProgressBar answered={quiz.answeredCount} total={quiz.totalQuestions} />
        </div>

        <div className="mc-card bg-white p-6 sm:p-12 mb-6">
          <div className="text-center mb-6">
            <span className="text-sm text-gray-400">第 {quiz.currentQuestion + 1} / {quiz.totalQuestions} 题</span>
            <h2 className="text-3xl sm:text-5xl font-bold text-[#333] mt-4">{currentQ.questionText}</h2>
          </div>

          {/* Hint display for practice mode */}
          <HintDisplay hint={currentQ.hint || ''} visible={currentHintVisible} />

          {/* Practice mode feedback indicator */}
          {practiceMode && currentFeedback && (
            <div className={`text-center mb-4 p-3 rounded-sm border-2 ${
              currentFeedback === 'correct'
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-red-50 border-red-300 text-red-700'
            }`}>
              {currentFeedback === 'correct' ? '✓ 正确！' : `✗ 不对哦，答案是 ${questions[quiz.currentQuestion].options[questions[quiz.currentQuestion].correctIndex]}`}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {currentQ.options.map((opt, i) => {
              let btnStyle = 'bg-white text-black hover:bg-gray-100';
              if (quiz.answers.get(quiz.currentQuestion) === opt) {
                btnStyle = 'bg-[#4CAF50] text-white border-black';
              }
              // In practice mode with feedback, highlight correct/incorrect
              if (practiceMode && currentFeedback) {
                if (opt === questions[quiz.currentQuestion].options[questions[quiz.currentQuestion].correctIndex]) {
                  btnStyle = 'bg-[#4CAF50] text-white border-black';
                } else if (quiz.answers.get(quiz.currentQuestion) === opt && currentFeedback === 'incorrect') {
                  btnStyle = 'bg-red-500 text-white border-black';
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => !showingFeedback && handleAnswer(opt)}
                  disabled={showingFeedback}
                  className={`mc-btn py-6 text-xl sm:text-2xl font-sans ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Hint button (always available in practice mode, on-demand in normal mode) */}
          {currentQ.hint && (
            <div className="text-center mt-4">
              <button
                onClick={toggleHint}
                className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center gap-1 mx-auto"
              >
                <Lightbulb className="h-4 w-4" />
                {currentHintVisible ? '收起提示' : '查看提示'}
              </button>
            </div>
          )}
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
