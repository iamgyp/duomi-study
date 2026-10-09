'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  KEY_LESSONS,
  getLesson,
  pickLessonKey,
  lessonTarget,
  recordLessonResult,
} from '@/lib/typing/lessons';
import {
  getPhonicsLevel,
  pickPhonicsTarget,
  makePhonicsBossTarget,
} from '@/lib/typing/phonics-data';
import {
  PINYIN_LESSONS,
  getPinyinLesson,
  pickPinyinTarget,
  makePinyinBossTarget,
} from '@/lib/typing/pinyin-data';
import {
  MATH_LESSONS,
  getMathLesson,
  pickMathTarget,
  makeMathBossTarget,
} from '@/lib/typing/math-data';
import { speakEnglish, speakChinese, isTtsEnabled, setTtsEnabled } from '@/lib/typing/tts';
import { TypingGame, type GameConfig, type GameResult } from '@/lib/typing/game-engine';
import { unlockTypingAudio } from '@/lib/typing/sounds';
import type { BiomeType } from '@/lib/typing/sprites';
import { VirtualKeyboard } from '@/components/typing/VirtualKeyboard';
import { TypingResultModal } from '@/components/typing/TypingResultModal';

function TypingPlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 模式与类别参数
  const category = (searchParams.get('category') || 'keys') as 'keys' | 'phonics' | 'pinyin' | 'math';
  const mode = (searchParams.get('mode') || 'practice') as 'practice' | 'challenge';
  const speed = (searchParams.get('speed') || 'slow') as 'slow' | 'normal' | 'fast';
  const biome = (searchParams.get('biome') || 'plains') as BiomeType;
  const showToneHint = searchParams.get('hint') !== 'off';

  // 课程 ID / 分级
  const lessonId =
    searchParams.get('lesson') ||
    (category === 'pinyin' ? 'pinyin-g1-chars' : category === 'math' ? 'math-mix-20' : 'fj');
  const phonicsLevel = Math.max(1, Math.min(5, Number(searchParams.get('level') || 1))) as 1 | 2 | 3 | 4 | 5;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<TypingGame | null>(null);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [lastWrongKey, setLastWrongKey] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [imeWarning, setImeWarning] = useState(false);
  const [ttsOn, setTtsOn] = useState(() => isTtsEnabled());
  const [gameNonce, setGameNonce] = useState(0);

  // 速度计算
  const baseSpeed =
    mode === 'practice'
      ? speed === 'slow'
        ? 20
        : speed === 'normal'
        ? 30
        : 42
      : speed === 'slow'
      ? 28
      : speed === 'normal'
      ? 40
      : 55;

  // 标题与下一关路由计算
  let currentTitle = '';
  let nextUrl: string | null = null;

  if (category === 'phonics') {
    const pDef = getPhonicsLevel(phonicsLevel);
    currentTitle = `${pDef.icon} 自然拼读 ${pDef.title}`;
    if (phonicsLevel < 5) {
      nextUrl = `/typing/play?category=phonics&level=${phonicsLevel + 1}&mode=${mode}&speed=${speed}&biome=${biome}`;
    }
  } else if (category === 'pinyin') {
    const pyDef = getPinyinLesson(lessonId);
    currentTitle = `${pyDef.icon} 拼音识字 · ${pyDef.title}`;
    const pyIdx = PINYIN_LESSONS.findIndex((l) => l.id === pyDef.id);
    if (pyIdx >= 0 && pyIdx < PINYIN_LESSONS.length - 1) {
      nextUrl = `/typing/play?category=pinyin&lesson=${PINYIN_LESSONS[pyIdx + 1].id}&mode=${mode}&speed=${speed}&biome=${biome}&hint=${showToneHint ? 'on' : 'off'}`;
    }
  } else if (category === 'math') {
    const mathDef = getMathLesson(lessonId);
    currentTitle = `${mathDef.icon} 口算心算 · ${mathDef.range}以内${mathDef.type === 'add' ? '加法' : mathDef.type === 'sub' ? '减法' : '混合加减法'}`;
    const mathIdx = MATH_LESSONS.findIndex((l) => l.id === mathDef.id);
    if (mathIdx >= 0 && mathIdx < MATH_LESSONS.length - 1) {
      nextUrl = `/typing/play?category=math&lesson=${MATH_LESSONS[mathIdx + 1].id}&mode=${mode}&speed=${speed}&biome=${biome}`;
    }
  } else {
    const keyDef = getLesson(lessonId);
    const keyIdx = KEY_LESSONS.findIndex((l) => l.id === keyDef.id);
    currentTitle = `第 ${keyIdx + 1} 课：${keyDef.keys.map((k) => k.toUpperCase()).join(' ')}`;
    if (keyIdx >= 0 && keyIdx < KEY_LESSONS.length - 1) {
      nextUrl = `/typing/play?category=keys&lesson=${KEY_LESSONS[keyIdx + 1].id}&mode=${mode}&speed=${speed}&biome=${biome}`;
    }
  }

  // 重置并重启游戏
  const handleRestart = () => {
    setGameResult(null);
    setIsPaused(false);
    setActiveKey(null);
    setLastWrongKey(null);
    setGameNonce((n) => n + 1);
  };
  const handleRestartRef = useRef(handleRestart);
  useEffect(() => {
    handleRestartRef.current = handleRestart;
  });

  // 切换 TTS 朗读开关
  const toggleTts = () => {
    const next = !ttsOn;
    setTtsOn(next);
    setTtsEnabled(next);
  };

  // 初始化并管理游戏引擎生命周期
  useEffect(() => {
    if (!canvasRef.current) return;

    // 出题与 Boss 目标生成器
    let nextTargetFn: (exclude: Set<string>) => ReturnType<typeof lessonTarget>;
    let bossTargetFn: () => ReturnType<typeof lessonTarget>;

    if (category === 'phonics') {
      nextTargetFn = (exclude) => pickPhonicsTarget(phonicsLevel, exclude);
      bossTargetFn = () => makePhonicsBossTarget(phonicsLevel);
    } else if (category === 'pinyin') {
      nextTargetFn = (exclude) => pickPinyinTarget(lessonId, showToneHint, exclude);
      bossTargetFn = () => makePinyinBossTarget(lessonId, showToneHint);
    } else if (category === 'math') {
      nextTargetFn = (exclude) => pickMathTarget(lessonId, exclude);
      bossTargetFn = () => makeMathBossTarget(lessonId);
    } else {
      const keyLesson = getLesson(lessonId);
      nextTargetFn = (exclude) => lessonTarget(pickLessonKey(keyLesson, exclude));
      bossTargetFn = () => {
        const len = Math.min(5, Math.max(3, keyLesson.keys.length));
        let ans = '';
        for (let i = 0; i < len; i++) {
          ans += keyLesson.keys[Math.floor(Math.random() * keyLesson.keys.length)];
        }
        return { display: ans.toUpperCase(), answer: ans };
      };
    }

    const config: GameConfig = {
      waves: 5,
      mobsPerWave: mode === 'practice' ? [4, 5, 6, 6, 1] : [5, 7, 9, 10, 1],
      practice: mode === 'practice',
      hearts: 5,
      baseSpeed,
      biome,
      pixelFont: 'var(--font-pixel), "VT323", "SimHei", "Microsoft YaHei", monospace',
      labels: {
        wave: (w, total) => `第 ${w} / ${total} 波`,
        bossWave: '⚠️ 末影龙 BOSS 进攻！',
        combo: (n) => `🔥 连击 x${n}`,
        paused: '游戏暂停',
        pausedHint: '按 ESC 或 空格 键继续',
        go: '开始！',
        victory: '守卫成功！',
        defeat: '村庄失守！',
        tnt: 'TNT 爆炸！',
      },
      nextTarget: nextTargetFn,
      bossTarget: bossTargetFn,
    };

    const game = new TypingGame(canvasRef.current, config, {
      onNextKey: (k) => setActiveKey(k),
      onKeyResult: (k, ok) => {
        if (!ok) {
          setLastWrongKey(k);
          setTimeout(() => setLastWrongKey(null), 400);
        }
      },
      onWordDefeated: (target) => {
        // 单词/口算击破时的语音发音反馈 (TTS)
        if (category === 'phonics') {
          speakEnglish(target.answer);
        } else if (category === 'pinyin') {
          speakChinese(target.display);
        } else if (category === 'math') {
          // 朗读完整算式与得数，例如 "8 加 7 等于 15"
          const cleanDisplay = target.display.replace('=', '').replace('?', '').replace('BOSS:', '').trim();
          const spoken = `${cleanDisplay} 等于 ${target.answer}`.replace(/\+/g, '加').replace(/-/g, '减');
          speakChinese(spoken);
        }
      },
      onEnd: (result) => {
        const stars = mode === 'practice'
          ? result.accuracy >= 0.8 ? 3 : result.accuracy >= 0.6 ? 2 : 1
          : result.victory ? (result.accuracy >= 0.95 ? 3 : 2) : 1;
        recordLessonResult(lessonId, {
          stars,
          accuracy: result.accuracy,
          kpm: result.kpm,
          xp: result.xp,
          missedKeys: result.missedKeys,
        });
        setGameResult(result);
      },
    });

    gameRef.current = game;
    game.start();

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, [category, lessonId, phonicsLevel, mode, baseSpeed, biome, showToneHint, gameNonce]);

  // 全局键盘监听（PC 核心交互）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      unlockTypingAudio();

      if (e.isComposing || e.keyCode === 229) {
        setImeWarning(true);
      }

      // 快捷键: 暂停 / 继续
      // 注意：游戏进行中只用 Escape 暂停，不能用 P 键，否则遇到包含字母 p/P 的单词或拼音时会误触发暂停！
      // 游戏处于暂停状态时，按 Escape、P 或 空格 均可恢复继续。
      if (e.key === 'Escape' || (isPaused && (e.key === 'p' || e.key === 'P' || e.key === ' '))) {
        if (!gameResult) {
          e.preventDefault();
          const game = gameRef.current;
          if (game) {
            const nextPause = !game.isPaused();
            game.setPaused(nextPause);
            setIsPaused(nextPause);
          }
        }
        return;
      }

      // 快捷键: 重置关卡（仅在暂停状态或结算弹窗展示时生效，避免游戏进行中误判，但也可以保留仅在已暂停时生效）
      if ((e.key === 'r' || e.key === 'R') && isPaused) {
        e.preventDefault();
        handleRestartRef.current();
        return;
      }

      if (gameResult || isPaused) return;

      if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
      }

      if (e.key.length === 1) {
        const rawKey = e.key.toLowerCase();
        setPressedKey(rawKey);
        setTimeout(() => setPressedKey(null), 120);

        gameRef.current?.handleKey(rawKey);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameResult, isPaused]);

  const handleVirtualKeyClick = (key: string) => {
    if (gameResult || isPaused) return;
    unlockTypingAudio();
    const rawKey = key.toLowerCase();
    setPressedKey(rawKey);
    setTimeout(() => setPressedKey(null), 120);
    gameRef.current?.handleKey(rawKey);
  };

  const togglePause = () => {
    if (!gameRef.current || gameResult) return;
    const next = !gameRef.current.isPaused();
    gameRef.current.setPaused(next);
    setIsPaused(next);
  };

  return (
    <main className="min-h-screen bg-[#1E232A] text-white flex flex-col items-center p-3 sm:p-6 font-[var(--font-pixel)] select-none">
      {/* ── 顶部导航与快捷状态栏 ──────────────────────────────── */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-3 mb-3 bg-[#2D3238] border-2 border-black p-3 rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <Link
            href="/typing"
            className="px-3 py-1.5 bg-[#4B5563] hover:bg-[#374151] text-white text-sm font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1"
          >
            &larr; 返回课程
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black text-yellow-300">
              {currentTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 模式标签 */}
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-md border border-black ${
              mode === 'practice'
                ? 'bg-emerald-600/90 text-white shadow-sm'
                : 'bg-red-600/90 text-white shadow-sm'
            }`}
          >
            {mode === 'practice' ? '🌱 练习模式 (无限心·怪物等待)' : '⚔️ 挑战模式'}
          </span>

          {/* TTS 语音朗读开关 */}
          {(category === 'phonics' || category === 'pinyin' || category === 'math') && (
            <button
              type="button"
              onClick={toggleTts}
              className={`px-2.5 py-1 text-xs font-bold border border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 ${
                ttsOn ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {ttsOn ? '🔊 朗读开' : '🔈 朗读关'}
            </button>
          )}

          {/* 暂停按钮 */}
          <button
            type="button"
            onClick={togglePause}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs font-bold border border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            {isPaused ? '▶️ 继续 (ESC)' : '⏸️ 暂停 (ESC)'}
          </button>

          {/* 重新开始按钮 */}
          <button
            type="button"
            onClick={handleRestart}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-xs font-bold border border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            🔁 重来 (R)
          </button>
        </div>
      </div>

      {/* ── 中文输入法提示浮条 ──────────────────────────────── */}
      {imeWarning && (
        <div className="w-full max-w-5xl mb-2 px-4 py-2 bg-amber-500/90 border-2 border-amber-300 text-black text-xs sm:text-sm font-bold rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>检测到当前处于中文输入法状态！请按键盘 Shift 键切换为【英文】，否则打字可能无法生效。</span>
          </div>
          <button
            type="button"
            onClick={() => setImeWarning(false)}
            className="px-2 py-0.5 bg-black/20 hover:bg-black/30 rounded text-xs"
          >
            知道了
          </button>
        </div>
      )}

      {/* ── 游戏主画布容器 ────── */}
      <div className="relative w-full max-w-5xl bg-black border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0_rgba(0,0,0,0.8)] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-auto block"
          style={{ imageRendering: 'pixelated', maxHeight: '56vh', aspectRatio: '2 / 1' }}
        />
      </div>

      {/* ── 虚拟键盘与指法引导区 ────────────────────────────── */}
      <div className="w-full max-w-5xl mt-3">
        <VirtualKeyboard
          activeKey={activeKey}
          pressedKey={pressedKey}
          lastWrongKey={lastWrongKey}
          onKeyClick={handleVirtualKeyClick}
          showLegend={true}
        />
      </div>

      {/* ── 结算弹窗 ────────────────────────────────────────── */}
      {gameResult && (
        <TypingResultModal
          result={gameResult}
          lessonTitle={currentTitle}
          practice={mode === 'practice'}
          onRetry={handleRestart}
          onNextLesson={nextUrl ? () => router.push(nextUrl!) : undefined}
          onBack={() => router.push('/typing')}
        />
      )}
    </main>
  );
}

export default function TypingPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1E232A] flex items-center justify-center text-white text-2xl font-[var(--font-pixel)]">
          加载守卫战场中...
        </div>
      }
    >
      <TypingPlayContent />
    </Suspense>
  );
}
