'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CARD_CATEGORIES,
  GRID_CONFIGS,
  type CardCategoryType,
  type GridConfig,
  type PlayCard,
  generateCardDeck,
} from '@/lib/memory/data-cards';
import {
  unlockMemoryAudio,
  playCardFlipSound,
  playMatchSuccessSound,
  playMismatchSound,
  playVictorySound,
} from '@/lib/memory/sound-effects';

interface BoardProps {
  category: CardCategoryType;
  gridConfig: GridConfig;
  onRestart: () => void;
}

function CardMatchBoard({ category, gridConfig, onRestart }: BoardProps) {
  const [cards, setCards] = useState<PlayCard[]>(() =>
    generateCardDeck(category, gridConfig.pairsNeeded)
  );
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Timer effect
  useEffect(() => {
    if (isWon) return;
    const timer = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isWon]);

  // Handle card click
  const handleCardClick = (index: number) => {
    unlockMemoryAudio();

    if (isLocked) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    playCardFlipSound();

    const nextFlipped = [...flippedIndices, index];
    const newCards = [...cards];
    newCards[index] = { ...card, isFlipped: true };
    setCards(newCards);
    setFlippedIndices(nextFlipped);

    // If 2 cards are flipped, check for match
    if (nextFlipped.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);

      const [firstIdx, secondIdx] = nextFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        setTimeout(() => {
          playMatchSuccessSound();
          setCards((prev) => {
            const updated = [...prev];
            updated[firstIdx] = { ...updated[firstIdx], isMatched: true };
            updated[secondIdx] = { ...updated[secondIdx], isMatched: true };
            return updated;
          });
          setFlippedIndices([]);
          setIsLocked(false);
          const newMatches = matchesCount + 1;
          setMatchesCount(newMatches);

          // Check if all pairs are matched
          if (newMatches >= gridConfig.pairsNeeded) {
            setTimeout(() => {
              playVictorySound();
              setIsWon(true);
            }, 300);
          }
        }, 500);
      } else {
        // Not matched, flip back after delay
        setTimeout(() => {
          playMismatchSound();
          setCards((prev) => {
            const updated = [...prev];
            updated[firstIdx] = { ...updated[firstIdx], isFlipped: false };
            updated[secondIdx] = { ...updated[secondIdx], isFlipped: false };
            return updated;
          });
          setFlippedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  // Calculate stars
  const calculateStars = () => {
    const perfectMoves = gridConfig.pairsNeeded;
    if (moves <= perfectMoves + 2) return 3;
    if (moves <= perfectMoves * 2) return 2;
    return 1;
  };

  return (
    <>
      {/* ── 游戏数据状态栏 ──────────────────────────────────── */}
      <div className="w-full max-w-xl flex items-center justify-between bg-[#2D3238] border-2 border-black px-4 py-2 rounded-lg shadow-[3px_3px_0_rgba(0,0,0,0.5)] mb-6 text-white font-[var(--font-pixel)]">
        <div className="flex items-center gap-1 text-xs">
          <span>⏱️ 时间:</span>
          <span className="font-mono text-emerald-400 font-black text-sm">{secondsElapsed}s</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span>👆 步数:</span>
          <span className="font-mono text-amber-400 font-black text-sm">{moves} 次</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span>✨ 进度:</span>
          <span className="font-mono text-purple-300 font-black text-sm">
            {matchesCount} / {gridConfig.pairsNeeded} 对
          </span>
        </div>
      </div>

      {/* ── 翻牌卡牌矩阵 ────────────────────────────────────── */}
      <div
        className="w-full max-w-xl p-4 bg-[#111418] border-4 border-black rounded-2xl shadow-[8px_8px_0_rgba(0,0,0,0.8)] grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(0, 1fr))`,
        }}
      >
        {cards.map((card, idx) => {
          const isFlipped = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.instanceId}
              type="button"
              onClick={() => handleCardClick(idx)}
              disabled={isFlipped || isLocked}
              style={{ perspective: '1000px' }}
              className={`aspect-square relative rounded-xl border-4 transition-all duration-300 select-none ${
                card.isMatched
                  ? 'border-emerald-500 bg-emerald-950/70 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : isFlipped
                  ? 'border-white bg-[#252A30] shadow-[4px_4px_0_rgba(0,0,0,0.8)]'
                  : 'border-[#1C1427] bg-[#2A1B3D] hover:bg-[#382452] hover:border-purple-500 cursor-pointer shadow-[4px_4px_0_rgba(0,0,0,0.6)] active:translate-y-0.5'
              }`}
            >
              {/* 卡牌正面内容 (已翻开) */}
              {isFlipped ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                  <div className="text-lg sm:text-2xl font-black text-white font-[var(--font-pixel)] drop-shadow-md break-all">
                    {card.display}
                  </div>
                  {card.subText && (
                    <div className="text-[10px] sm:text-xs text-yellow-300 font-sans mt-0.5 font-bold">
                      {card.subText}
                    </div>
                  )}
                  {card.isMatched && (
                    <div className="absolute top-1 right-1 text-xs text-emerald-400 font-bold">
                      ✓
                    </div>
                  )}
                </div>
              ) : (
                /* 卡牌背面 (未翻开：末影珍珠神秘纹章) */
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="text-2xl sm:text-3xl filter drop-shadow">🟣</div>
                  <div className="text-[9px] text-purple-300/70 font-mono mt-1 font-bold">ENDER</div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 胜利结算弹窗 ────────────────────────────────────── */}
      {isWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="mc-card bg-[#2D3238] border-4 border-black p-6 rounded-2xl max-w-md w-full text-white text-center font-[var(--font-pixel)] shadow-[8px_8px_0_rgba(0,0,0,1)]">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-2xl font-black text-yellow-300 mb-2">末影宝藏已揭晓！</h3>
            <p className="text-sm text-gray-300 font-sans mb-4">
              太棒了！你凭借出色的空间记忆力，成功配对完成了所有卡牌！
            </p>

            {/* 星级 */}
            <div className="text-3xl mb-4">
              {'⭐'.repeat(calculateStars())}
              {'☆'.repeat(3 - calculateStars())}
            </div>

            <div className="bg-black/40 border-2 border-black p-3 rounded-lg mb-6 flex justify-around text-center">
              <div>
                <div className="text-xs text-gray-400 font-sans">用时</div>
                <div className="text-xl font-black text-emerald-400">{secondsElapsed} 秒</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 font-sans">总步数</div>
                <div className="text-xl font-black text-amber-400">{moves} 次</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 font-sans">配对数</div>
                <div className="text-xl font-black text-purple-400">{matchesCount} 对</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={onRestart}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                🔁 再玩一局
              </button>
              <Link
                href="/memory"
                className="px-5 py-2.5 bg-gray-600 hover:bg-gray-500 text-white font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                🏛️ 返回神殿
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function CardMatchGame() {
  const [selectedCategory, setSelectedCategory] = useState<CardCategoryType>('minecraft');
  const [selectedGrid, setSelectedGrid] = useState<GridConfig['id']>('2x3');
  const [boardNonce, setBoardNonce] = useState(0);

  const currentGridDef = GRID_CONFIGS.find((g) => g.id === selectedGrid) || GRID_CONFIGS[1];

  const handleRestart = () => {
    unlockMemoryAudio();
    setBoardNonce((n) => n + 1);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── 顶部选择与控制区 ────────────────────────────────── */}
      <div className="w-full max-w-3xl bg-[#1E232A] border-4 border-black p-4 rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.6)] mb-6 text-white font-[var(--font-pixel)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-white/20 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🃏</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-purple-300">末影宝藏 · 翻牌配对消消乐</h2>
              <p className="text-xs text-gray-300 font-sans">点击翻转两张卡片，寻找匹配的图鉴、拼音或算式！</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRestart}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-xs font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
            >
              🔄 重新洗牌
            </button>
            <Link
              href="/memory"
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
            >
              &larr; 返回神殿
            </Link>
          </div>
        </div>

        {/* 类别与规格双排选择 */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* 主题选择 */}
          <div className="flex-1">
            <div className="text-xs text-yellow-300 mb-1 font-bold">📚 配对题库模式：</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {CARD_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setBoardNonce((n) => n + 1);
                  }}
                  className={`p-2 rounded border-2 border-black text-left transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white shadow-[2px_2px_0_rgba(0,0,0,1)]'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-xs font-black flex items-center gap-1">
                    <span>{cat.icon}</span>
                    <span>{cat.title}</span>
                  </div>
                  <div className="text-[10px] text-white/70 font-sans mt-0.5 truncate">{cat.badge}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 阵列规格选择 */}
          <div className="sm:w-56">
            <div className="text-xs text-yellow-300 mb-1 font-bold">📐 阵列规格：</div>
            <div className="grid grid-cols-2 gap-1.5">
              {GRID_CONFIGS.map((grid) => (
                <button
                  key={grid.id}
                  onClick={() => {
                    setSelectedGrid(grid.id);
                    setBoardNonce((n) => n + 1);
                  }}
                  className={`p-1.5 rounded border-2 border-black text-xs font-bold transition-all text-center ${
                    selectedGrid === grid.id
                      ? 'bg-emerald-600 text-white shadow-[2px_2px_0_rgba(0,0,0,1)]'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {grid.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 游戏棋盘 (基于 Key 自动重置状态，无副作用 useEffect) ── */}
      <CardMatchBoard
        key={`${selectedCategory}-${selectedGrid}-${boardNonce}`}
        category={selectedCategory}
        gridConfig={currentGridDef}
        onRestart={handleRestart}
      />
    </div>
  );
}
