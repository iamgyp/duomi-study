'use client';

import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { SpeedQuizAnswer } from '@/hooks/useSpeedQuiz';

interface SpeedResultProps {
  correctCount: number;
  attemptedCount: number;
  timeLimitSeconds: number;
  wrongAnswers: SpeedQuizAnswer[];
  onRetry: () => void;
}

export function SpeedResult({
  correctCount,
  attemptedCount,
  timeLimitSeconds,
  wrongAnswers,
  onRetry,
}: SpeedResultProps) {
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const questionsPerMinute = timeLimitSeconds > 0
    ? ((correctCount / timeLimitSeconds) * 60).toFixed(1)
    : '0.0';
  const isPerfect = accuracy === 100 && attemptedCount > 0;

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
      <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-2xl w-full text-center">
        <div className="text-6xl mb-4">{isPerfect ? '🏆' : '⚡'}</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#333] mb-2">
          {isPerfect ? '完美通关！' : '时间到！'}
        </h1>
        <p className="text-lg text-gray-600 mb-6">口算速算挑战</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border-2 border-black p-4">
            <div className="text-4xl font-bold text-[#4CAF50]">{accuracy}%</div>
            <div className="text-sm text-gray-500 mt-1">正确率</div>
            <div className="text-lg font-bold text-[#333] mt-1">{correctCount}/{attemptedCount}</div>
          </div>
          <div className="bg-white border-2 border-black p-4">
            <div className="text-4xl font-bold text-[#F59E0B]">{questionsPerMinute}</div>
            <div className="text-sm text-gray-500 mt-1">每分钟题数</div>
          </div>
          <div className="bg-white border-2 border-black p-4">
            <div className="text-4xl font-bold text-[#2196F3]">{timeLimitSeconds}s</div>
            <div className="text-sm text-gray-500 mt-1">用时</div>
          </div>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="mb-8 text-left">
            <h2 className="text-xl font-bold text-[#333] mb-3 flex items-center gap-2">
              <span className="text-red-500">❌</span> 错题回顾
            </h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {wrongAnswers.map((wa, i) => (
                <div key={i} className="bg-red-50 border-2 border-red-200 rounded p-3">
                  <div className="text-sm">
                    <span className="font-bold text-[#333]">{wa.question.questionText}</span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-red-600">你的答案: {wa.userAnswer}</span>
                    <span className="text-green-600 ml-3">正确答案: {wa.question.answer}</span>
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
            <RefreshCw className="h-4 w-4" /> 再试一次
          </button>
          <Link href="/math/speed-challenge" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> 返回设置
          </Link>
        </div>
      </div>
    </div>
  );
}
