'use client';

import React, { useEffect } from 'react';
import type { GameResult } from '@/lib/typing/game-engine';

export interface TypingResultModalProps {
  result: GameResult;
  lessonTitle: string;
  practice: boolean;
  onRetry: () => void;
  onNextLesson?: () => void;
  onBack: () => void;
}

export function TypingResultModal({
  result,
  lessonTitle,
  practice,
  onRetry,
  onNextLesson,
  onBack,
}: TypingResultModalProps) {
  // 键盘快捷键响应：R 重玩，Enter 下一关
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onRetry();
      } else if (e.key === 'Enter' && onNextLesson) {
        e.preventDefault();
        onNextLesson();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRetry, onNextLesson]);

  // 星级评定
  let stars = 1;
  if (practice) {
    stars = result.accuracy >= 0.8 ? 3 : result.accuracy >= 0.6 ? 2 : 1;
  } else {
    stars = result.victory
      ? result.accuracy >= 0.95 && result.heartsLost === 0
        ? 3
        : result.accuracy >= 0.85
        ? 2
        : 1
      : 0;
  }

  const missedEntries = Object.entries(result.missedKeys).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-[var(--font-pixel)]">
      <div className="relative w-full max-w-lg bg-[#E2E8F0] border-4 border-black p-6 rounded-xl shadow-[8px_8px_0_rgba(0,0,0,0.8)] text-gray-900">
        
        {/* 顶部标题栏 */}
        <div className="text-center mb-4">
          <div className="text-4xl sm:text-5xl mb-2 animate-bounce">
            {practice ? '🎖️' : result.victory ? '🏆' : '💀'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-wide drop-shadow-sm">
            {practice
              ? '练习完成！太棒了！'
              : result.victory
              ? '保卫成功！完美胜利！'
              : '村庄失守，再接再厉！'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-mono mt-1">
            {lessonTitle} · {practice ? '🌱 练习模式' : '⚔️ 挑战模式'}
          </p>
        </div>

        {/* 星级徽章 */}
        <div className="flex justify-center items-center gap-3 my-4">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`text-4xl transition-transform ${
                s <= stars ? 'scale-110 drop-shadow-[0_2px_4px_rgba(234,179,8,0.6)]' : 'opacity-25 grayscale'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* 核心数据卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
          <div className="bg-white p-3 border-2 border-black rounded text-center">
            <div className="text-xs text-gray-500 font-bold">正确率</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600">
              {Math.round(result.accuracy * 100)}%
            </div>
          </div>
          <div className="bg-white p-3 border-2 border-black rounded text-center">
            <div className="text-xs text-gray-500 font-bold">打字速度</div>
            <div className="text-xl sm:text-2xl font-black text-blue-600">
              {result.kpm} <span className="text-xs font-normal text-gray-500">键/分</span>
            </div>
          </div>
          <div className="bg-white p-3 border-2 border-black rounded text-center">
            <div className="text-xs text-gray-500 font-bold">最高连击</div>
            <div className="text-xl sm:text-2xl font-black text-amber-600">
              {result.maxCombo}
            </div>
          </div>
          <div className="bg-white p-3 border-2 border-black rounded text-center">
            <div className="text-xs text-gray-500 font-bold">击退怪物</div>
            <div className="text-xl sm:text-2xl font-black text-purple-600">
              {result.kills}
            </div>
          </div>
        </div>

        {/* 易错键提醒（若有） */}
        {missedEntries.length > 0 && (
          <div className="my-3 p-3 bg-amber-50 border-2 border-amber-400 rounded-lg">
            <div className="text-xs font-bold text-amber-800 mb-1.5 flex items-center gap-1">
              <span>⚠️ 需要多熟悉的按键：</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {missedEntries.slice(0, 5).map(([key, count]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-amber-300 rounded text-xs font-mono font-bold text-gray-800"
                >
                  <span className="text-amber-600 font-black">{key.toUpperCase()}</span>
                  <span className="text-gray-400 text-[10px]">({count}次)</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 经验值提示 */}
        <div className="text-center text-xs text-gray-500 font-mono mb-5">
          ✨ 本次收获经验球: <span className="font-bold text-emerald-600">+{result.xp} XP</span>
        </div>

        {/* 操作按钮组 */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 py-3 px-4 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-base border-2 border-black rounded shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5"
          >
            <span>🔁 再练一次 (R)</span>
          </button>

          {onNextLesson && (
            <button
              type="button"
              onClick={onNextLesson}
              className="flex-1 py-3 px-4 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-base border-2 border-black rounded shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5"
            >
              <span>⏭ 下一课 (Enter)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBack}
            className="py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold text-base border-2 border-black rounded shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
          >
            返回课程
          </button>
        </div>

      </div>
    </div>
  );
}
