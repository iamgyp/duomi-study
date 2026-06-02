'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import {
  generateDailyChallenge,
  getTodaySeed,
  getDailyResult,
  getAllDailyResults,
  saveDailyResult,
  getDailyStreak,
} from '@/lib/daily-challenge';

export default function DailyChallengePage() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const challenge = useMemo(() => generateDailyChallenge(), []);

  // Check if already completed today
  const todayResult = useMemo(() => getDailyResult(getTodaySeed()), []);
  const [completed, setCompleted] = useState(!!todayResult);

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(challenge.timeLimitSeconds);
  const [timerRunning, setTimerRunning] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [results, setResults] = useState<{ correctCount: number; timeUsed: number } | null>(null);
  const [streak] = useState(() => getDailyStreak());

  // Use refs to avoid stale closures in handleSubmitResults
  const answersRef = useRef<Map<number, string>>(answers);
  const timeRemainingRef = useRef(timeRemaining);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { timeRemainingRef.current = timeRemaining; }, [timeRemaining]);

  useEffect(() => {
    if (!timerRunning || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerRunning, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0 && started && !finished) {
      setFinished(true);
      handleSubmitResults();
    }
  }, [timeRemaining, started, finished]);

  const handleAnswer = useCallback((opt: string) => {
    setAnswers((prev) => new Map(prev).set(currentQuestion, opt));
    const correct = opt === challenge.questions[currentQuestion].options[challenge.questions[currentQuestion].correctIndex];
    setFeedback(correct ? 'correct' : 'incorrect');
    setTimeout(() => {
      setFeedback(null);
      if (currentQuestion < challenge.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        // All questions answered
        const timeUsed = challenge.timeLimitSeconds - timeRemaining;
        setTimeRemaining(0);
      }
    }, 600);
  }, [currentQuestion, challenge, timeRemaining]);

  const handleSubmitResults = () => {
    let correctCount = 0;
    challenge.questions.forEach((q, i) => {
      const userAnswer = answers.get(i);
      if (userAnswer === q.options[q.correctIndex]) {
        correctCount++;
      }
    });
    const timeUsed = challenge.timeLimitSeconds - timeRemaining;
    const accuracy = challenge.questions.length > 0 ? correctCount / challenge.questions.length : 0;

    saveDailyResult({ date: getTodaySeed(), correctCount, totalQuestions: challenge.questions.length, accuracy, timeUsed });
    setResults({ correctCount, timeUsed });
    setCompleted(true);
  };

  const handleRetry = () => {
    setStarted(false);
    setFinished(false);
    setCurrentQuestion(0);
    setAnswers(new Map());
    setTimeRemaining(challenge.timeLimitSeconds);
    setResults(null);
  };

  if (results) {
    const accuracy = Math.round((results.correctCount / challenge.questions.length) * 100);
    const isPerfect = accuracy === 100;

    return (
      <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
        <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-2xl w-full text-center">
          <div className="text-6xl mb-4">{isPerfect ? '🏆' : '📅'}</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#333] mb-2">
            {isPerfect ? '完美通关！' : '挑战完成！'}
          </h1>
          <p className="text-lg text-gray-600 mb-6">今日挑战 · {getTodaySeed()}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border-2 border-black p-4">
              <div className="text-4xl font-bold text-[#4CAF50]">{accuracy}%</div>
              <div className="text-sm text-gray-500 mt-1">正确率</div>
              <div className="text-lg font-bold text-[#333] mt-1">{results.correctCount}/{challenge.questions.length}</div>
            </div>
            <div className="bg-white border-2 border-black p-4">
              <div className="text-4xl font-bold text-[#F59E0B]">{results.timeUsed}s</div>
              <div className="text-sm text-gray-500 mt-1">用时</div>
            </div>
            <div className="bg-white border-2 border-black p-4">
              <div className="text-4xl font-bold text-[#EF4444]">{streak}天</div>
              <div className="text-sm text-gray-500 mt-1">连续天数</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleRetry} className="mc-btn bg-[#4CAF50] text-white flex-1 py-3 flex items-center justify-center gap-2">
              再来一次
            </button>
            <Link href="/" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> 返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
        <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">📅</div>
          <h1 className="text-3xl font-bold text-[#333] mb-2">每日挑战</h1>
          <p className="text-gray-600 mb-4">{getTodaySeed()}</p>
          <div className="space-y-3 mb-6">
            <div className="bg-white border-2 border-black p-3">
              <span className="text-sm text-gray-500">题目数量</span>
              <p className="text-2xl font-bold text-[#333]">{challenge.questions.length} 题</p>
            </div>
            <div className="bg-white border-2 border-black p-3">
              <span className="text-sm text-gray-500">时间限制</span>
              <p className="text-2xl font-bold text-[#F59E0B]">{challenge.timeLimitSeconds} 秒</p>
            </div>
            {streak > 0 && (
              <div className="bg-white border-2 border-black p-3">
                <span className="text-sm text-gray-500">连续挑战</span>
                <p className="text-2xl font-bold text-[#EF4444]">{streak} 天 🔥</p>
              </div>
            )}
          </div>
          {completed ? (
            <div className="bg-green-100 border-2 border-green-400 p-3 rounded-sm mb-4">
              <p className="text-green-700 font-bold">今天已经完成了挑战！</p>
            </div>
          ) : null}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => { setStarted(true); setTimerRunning(true); }} className="mc-btn bg-[#4CAF50] text-white flex-1 py-3 flex items-center justify-center gap-2">
              <Calendar className="h-5 w-5" /> {completed ? '再试一次' : '开始挑战'}
            </button>
            <Link href="/" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> 返回
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = challenge.questions[currentQuestion];
  const answeredCount = answers.size;

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <Link href="/" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回首页
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">📅 每日挑战</h1>
        <span className="text-white/80 text-sm">{getTodaySeed()}</span>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Timer */}
        <div className="mb-6">
          <div className="w-full bg-black/30 rounded-sm border-2 border-white/20 h-12 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-1000 ${timeRemaining <= 10 ? 'animate-pulse' : ''}`}
              style={{
                width: `${(timeRemaining / challenge.timeLimitSeconds) * 100}%`,
                backgroundColor: timeRemaining <= 10 ? '#EF4444' : timeRemaining <= 20 ? '#F59E0B' : '#4CAF50',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold drop-shadow-md">
              {timeRemaining}s
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="text-center mb-4">
          <span className="text-white/80 text-lg">
            已答: <span className="text-green-400 font-bold text-2xl">{answeredCount}</span> / {challenge.questions.length}
          </span>
        </div>

        {/* Question Card */}
        <div className="mc-card bg-white p-6 sm:p-12 mb-6">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-400 mb-4">第 {currentQuestion + 1} / {challenge.questions.length} 题</p>
            <h2 className="text-3xl sm:text-5xl font-bold text-[#333]">{currentQ.questionText}</h2>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`text-center mb-4 p-3 rounded-sm border-2 ${
              feedback === 'correct' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'
            }`}>
              {feedback === 'correct' ? '✓ 正确！' : '✗ 不对哦！'}
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className={`mc-btn py-6 text-xl sm:text-2xl font-sans ${
                  answers.get(currentQuestion) === opt
                    ? 'bg-[#4CAF50] text-white border-black'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Question dots */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {challenge.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => answers.has(i) && setCurrentQuestion(i)}
              disabled={!answers.has(i)}
              className={`w-8 h-8 rounded-full border-2 text-sm font-bold ${
                i === currentQuestion ? 'border-white bg-white text-[#333]' :
                answers.has(i) ? 'border-green-400 bg-green-500 text-white' :
                'border-white/30 bg-black/20 text-white/30'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
