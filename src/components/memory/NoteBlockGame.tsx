'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  NOTE_BLOCKS,
  NOTE_DIFFICULTIES,
  type NoteDifficulty,
  generateRandomNoteSequence,
} from '@/lib/memory/data-notes';
import {
  unlockMemoryAudio,
  playNoteSound,
  playMatchSuccessSound,
  playSequenceErrorSound,
  playVictorySound,
} from '@/lib/memory/sound-effects';

export function NoteBlockGame() {
  const [difficultyId, setDifficultyId] = useState<NoteDifficulty['id']>('beginner');
  const currentDiff = NOTE_DIFFICULTIES.find((d) => d.id === difficultyId) || NOTE_DIFFICULTIES[0];

  const [gameState, setGameState] = useState<'idle' | 'demonstrating' | 'playerTurn' | 'roundWin' | 'gameOver'>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  const [hearts, setHearts] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [targetSteps, setTargetSteps] = useState(currentDiff.startSteps);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);

  const demoTimeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Clear demo timeouts on unmount
  useEffect(() => {
    return () => {
      demoTimeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  // Play a single block light + sound
  const flashBlock = useCallback((blockId: number, duration = 350) => {
    unlockMemoryAudio();
    playNoteSound(blockId);
    setActiveBlockId(blockId);
    setTimeout(() => {
      setActiveBlockId((cur) => (cur === blockId ? null : cur));
    }, duration);
  }, []);

  // Start demonstration of current sequence
  const playSequence = useCallback((seq: number[], diff: NoteDifficulty) => {
    setGameState('demonstrating');
    setActiveBlockId(null);
    demoTimeoutRefs.current.forEach(clearTimeout);
    demoTimeoutRefs.current = [];

    seq.forEach((blockId, idx) => {
      const delay = 600 + idx * diff.intervalMs;
      const tid = setTimeout(() => {
        flashBlock(blockId, diff.highlightDurationMs);
        if (idx === seq.length - 1) {
          // Finished demo, switch to player turn
          const endTid = setTimeout(() => {
            setGameState('playerTurn');
            setPlayerIndex(0);
          }, diff.highlightDurationMs + 200);
          demoTimeoutRefs.current.push(endTid);
        }
      }, delay);
      demoTimeoutRefs.current.push(tid);
    });
  }, [flashBlock]);

  // Start a new game / round
  const startNewGame = useCallback(() => {
    demoTimeoutRefs.current.forEach(clearTimeout);
    demoTimeoutRefs.current = [];
    unlockMemoryAudio();

    const initialSteps = currentDiff.startSteps;
    const initialSeq = generateRandomNoteSequence(initialSteps);
    setSequence(initialSeq);
    setTargetSteps(initialSteps);
    setPlayerIndex(0);
    setCurrentRound(1);
    setHearts(3);
    setStreak(0);
    setScore(0);
    playSequence(initialSeq, currentDiff);
  }, [currentDiff, playSequence]);

  // Next round upon success
  const advanceNextRound = useCallback(() => {
    setGameState('demonstrating');
    playMatchSuccessSound();

    const nextSteps = targetSteps + 1;
    const isCompleted = currentDiff.id !== 'endless' && nextSteps > currentDiff.maxSteps;

    if (isCompleted) {
      setTimeout(() => {
        playVictorySound();
        setGameState('gameOver');
      }, 500);
      return;
    }

    const nextSeq = generateRandomNoteSequence(nextSteps);
    setSequence(nextSeq);
    setTargetSteps(nextSteps);
    setCurrentRound((r) => r + 1);
    setStreak((s) => s + 1);
    setScore((sc) => sc + nextSteps * 20);

    setTimeout(() => {
      playSequence(nextSeq, currentDiff);
    }, 1000);
  }, [targetSteps, currentDiff, playSequence]);

  // Handle player clicking / keying a block
  const handleBlockPress = useCallback((blockId: number) => {
    if (gameState !== 'playerTurn') return;

    flashBlock(blockId, 280);

    // Verify player's choice
    const expected = sequence[playerIndex];
    if (blockId === expected) {
      const nextIdx = playerIndex + 1;
      setPlayerIndex(nextIdx);

      // Check if full sequence completed
      if (nextIdx >= sequence.length) {
        setGameState('roundWin');
        setTimeout(() => {
          advanceNextRound();
        }, 400);
      }
    } else {
      // Wrong choice
      playSequenceErrorSound();
      setStreak(0);
      const nextHearts = hearts - 1;
      setHearts(nextHearts);

      if (nextHearts <= 0) {
        setGameState('gameOver');
      } else {
        // Re-play current sequence to help child remember
        setGameState('demonstrating');
        setTimeout(() => {
          playSequence(sequence, currentDiff);
        }, 1200);
      }
    }
  }, [gameState, sequence, playerIndex, hearts, flashBlock, advanceNextRound, playSequence, currentDiff]);

  // Global keyboard shortcuts (Q, W, E, R / 1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playerTurn') return;
      const key = e.key.toLowerCase();
      if (key === 'q' || key === '1' || key === 'arrowleft') handleBlockPress(0);
      else if (key === 'w' || key === '2' || key === 'arrowup') handleBlockPress(1);
      else if (key === 'e' || key === '3' || key === 'arrowdown') handleBlockPress(2);
      else if (key === 'r' || key === '4' || key === 'arrowright') handleBlockPress(3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleBlockPress]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── 顶部说明与难度选择 ──────────────────────────────── */}
      <div className="w-full max-w-2xl bg-[#1E232A] border-4 border-black p-4 rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.6)] mb-6 text-white font-[var(--font-pixel)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-white/20 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-yellow-300">音符盒秘境 · 序列节奏记忆</h2>
              <p className="text-xs text-gray-300 font-sans">仔细看音符闪烁顺序并聆听声音，随后按相同顺序点击复现！</p>
            </div>
          </div>
          <Link
            href="/memory"
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            &larr; 返回神殿
          </Link>
        </div>

        {/* 难度切换 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {NOTE_DIFFICULTIES.map((diff) => (
            <button
              key={diff.id}
              onClick={() => {
                setDifficultyId(diff.id);
                setGameState('idle');
                demoTimeoutRefs.current.forEach(clearTimeout);
              }}
              disabled={gameState === 'demonstrating' || gameState === 'playerTurn'}
              className={`p-2 rounded text-left border-2 border-black transition-all ${
                difficultyId === diff.id
                  ? 'bg-amber-600 text-white shadow-[2px_2px_0_rgba(0,0,0,1)]'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              } disabled:opacity-50`}
            >
              <div className="text-xs font-black">{diff.title}</div>
              <div className="text-[10px] text-white/80 font-sans mt-0.5">{diff.badge}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 游戏状态信息栏 ──────────────────────────────────── */}
      <div className="w-full max-w-md flex items-center justify-between bg-[#2D3238] border-2 border-black px-4 py-2 rounded-lg shadow-[3px_3px_0_rgba(0,0,0,0.5)] mb-6 text-white font-[var(--font-pixel)]">
        {/* 生命值 */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-300">生命:</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="text-base sm:text-lg">
              {i < hearts ? '❤️' : '🖤'}
            </span>
          ))}
        </div>

        {/* 连击与分数 */}
        <div className="flex items-center gap-3">
          <div className="text-xs">
            <span className="text-amber-400 font-black">🔥 连击 x{streak}</span>
          </div>
          <div className="text-xs">
            <span className="text-emerald-400 font-black">⭐ 得分 {score}</span>
          </div>
        </div>

        {/* 关卡步骤指示 */}
        <div className="text-xs font-bold text-yellow-300">
          {gameState === 'playerTurn'
            ? `输入 ${playerIndex} / ${sequence.length}`
            : gameState === 'demonstrating'
            ? `演示中 (${sequence.length}步)`
            : `第 ${currentRound} 轮`}
        </div>
      </div>

      {/* ── 核心音符盒 2x2 交互阵列 ──────────────────────────── */}
      <div className="relative w-full max-w-sm aspect-square bg-[#111418] border-4 border-black p-4 rounded-2xl shadow-[8px_8px_0_rgba(0,0,0,0.8)] grid grid-cols-2 gap-4">
        {NOTE_BLOCKS.map((block) => {
          const isActive = activeBlockId === block.id;
          return (
            <button
              key={block.id}
              type="button"
              onClick={() => handleBlockPress(block.id)}
              disabled={gameState !== 'playerTurn'}
              style={{
                backgroundColor: isActive ? block.activeHex : block.bgHex,
                boxShadow: isActive ? `0 0 25px ${block.glowColor}, inset 0 0 15px rgba(255,255,255,0.6)` : 'none',
                borderColor: isActive ? '#FFFFFF' : block.borderHex,
              }}
              className={`relative border-4 rounded-xl flex flex-col items-center justify-center p-3 select-none transition-all active:scale-95 disabled:cursor-not-allowed ${
                isActive ? 'scale-105 z-10' : 'hover:brightness-110'
              }`}
            >
              {/* 方块顶部像素图标 */}
              <span className="text-3xl sm:text-4xl mb-1 filter drop-shadow-md">{block.icon}</span>

              {/* 方块名称 */}
              <span className="text-white font-[var(--font-pixel)] font-black text-sm sm:text-base drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
                {block.name}
              </span>

              {/* 快捷键提示 */}
              <span className="text-[10px] text-white/70 font-mono mt-1 px-1.5 py-0.5 bg-black/40 rounded border border-white/20">
                {block.keyLabel}
              </span>
            </button>
          );
        })}

        {/* 中央悬浮状态提示徽章 */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {gameState === 'idle' && (
            <button
              type="button"
              onClick={startNewGame}
              className="pointer-events-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-[var(--font-pixel)] font-black text-base sm:text-lg border-4 border-black rounded-xl shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none animate-bounce"
            >
              ▶️ 开始挑战
            </button>
          )}

          {gameState === 'demonstrating' && (
            <div className="px-4 py-2 bg-black/80 border-2 border-yellow-400 text-yellow-300 font-[var(--font-pixel)] font-bold text-xs sm:text-sm rounded-lg backdrop-blur-sm animate-pulse">
              👀 仔细看，记住顺序...
            </div>
          )}

          {gameState === 'playerTurn' && (
            <div className="px-3 py-1 bg-black/60 border border-emerald-400 text-emerald-300 font-[var(--font-pixel)] font-bold text-xs rounded-full">
              🎯 轮到你了！
            </div>
          )}
        </div>
      </div>

      {/* ── 键盘与操作说明 ──────────────────────────────────── */}
      <div className="w-full max-w-sm mt-4 text-center text-xs text-gray-400 font-sans">
        提示：支持键盘快捷键 <span className="font-mono text-yellow-400 font-bold">Q / W / E / R</span> 或 <span className="font-mono text-yellow-400 font-bold">1 / 2 / 3 / 4</span> 或 方向键敲击！
      </div>

      {/* ── 结算弹窗 ────────────────────────────────────────── */}
      {gameState === 'gameOver' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="mc-card bg-[#2D3238] border-4 border-black p-6 rounded-2xl max-w-md w-full text-white text-center font-[var(--font-pixel)] shadow-[8px_8px_0_rgba(0,0,0,1)]">
            <div className="text-5xl mb-2">{hearts > 0 ? '🏆' : '💀'}</div>
            <h3 className="text-2xl font-black text-yellow-300 mb-2">
              {hearts > 0 ? '挑战大胜利！' : '生命耗尽！'}
            </h3>
            <p className="text-sm text-gray-300 font-sans mb-4">
              {hearts > 0
                ? `恭喜你完成了 ${currentDiff.title} 的全部记忆关卡！`
                : '别灰心，多练习几次，大脑的节奏记忆力会越来越强！'}
            </p>

            <div className="bg-black/40 border-2 border-black p-3 rounded-lg mb-6 flex justify-around text-center">
              <div>
                <div className="text-xs text-gray-400 font-sans">最终得分</div>
                <div className="text-xl font-black text-emerald-400">{score}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 font-sans">达成步数</div>
                <div className="text-xl font-black text-amber-400">{targetSteps} 步</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 font-sans">最高连击</div>
                <div className="text-xl font-black text-purple-400">{streak} 次</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={startNewGame}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                🔁 再玩一次
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
    </div>
  );
}
