'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  KEY_LESSONS,
  getTypingProgress,
  isLessonUnlocked,
  getWeaponByXp,
  type TypingProgress,
} from '@/lib/typing/lessons';
import { getKeyDef, FINGER_COLORS } from '@/lib/typing/keyboard-layout';
import { PHONICS_LEVELS } from '@/lib/typing/phonics-data';
import { PINYIN_LESSONS } from '@/lib/typing/pinyin-data';
import type { BiomeType } from '@/lib/typing/sprites';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useMounted } from '@/hooks/useMounted';

type ActiveTab = 'keys' | 'phonics' | 'pinyin';

export default function TypingHubPage() {
  const mounted = useMounted();
  const [activeTab, setActiveTab] = useState<ActiveTab>('keys');
  const [mode, setMode] = useState<'practice' | 'challenge'>('practice');
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('slow');
  const [biome, setBiome] = useState<BiomeType>('plains');
  const [pinyinHint, setPinyinHint] = useState<boolean>(true);
  const [progress] = useState<TypingProgress>(() => getTypingProgress());
  const currentWeapon = getWeaponByXp(progress.xp);
  const weakEntries = Object.entries(progress.missedKeysTotal ?? {}).sort((a, b) => b[1] - a[1]);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#1E232A] flex items-center justify-center text-white">
        <div className="text-2xl font-[var(--font-pixel)]">加载中...</div>
      </main>
    );
  }

  const biomes: { id: BiomeType; name: string; icon: string }[] = [
    { id: 'plains', name: '草原', icon: '🌲' },
    { id: 'desert', name: '沙漠', icon: '🏜️' },
    { id: 'snow', name: '雪原', icon: '❄️' },
    { id: 'nether', name: '下界', icon: '🔥' },
    { id: 'end', name: '末地', icon: '🌌' },
  ];

  return (
    <main className="min-h-screen bg-[#1E232A] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] text-white p-4 sm:p-8 font-[var(--font-pixel)] select-none">
      
      {/* ── 顶部栏 ──────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 mb-6">
        <Link
          href="/"
          className="px-4 py-2 bg-[#4B5563] hover:bg-[#374151] text-white font-bold border-2 border-black rounded-lg shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 text-sm sm:text-base"
        >
          &larr; 返回主页
        </Link>

        <div className="flex items-center gap-3">
          <div className="bg-[#2D3238] border-2 border-black px-3 py-1.5 rounded-lg text-emerald-400 font-bold text-sm sm:text-base flex items-center gap-2 shadow-[2px_2px_0_rgba(0,0,0,1)]">
            <span>✨ {progress.xp} XP</span>
            <span className="text-gray-500">|</span>
            <span className="text-yellow-300 font-black">{currentWeapon.icon} {currentWeapon.name}</span>
          </div>
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>

      {/* ── 头部标题区 ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto text-center mb-6">
        <div className="inline-block p-4 sm:p-6 bg-[#2D3238] border-4 border-black rounded-2xl shadow-[6px_6px_0_rgba(0,0,0,0.8)]">
          <div className="text-5xl sm:text-6xl mb-2">⌨️ 🏹 🧟</div>
          <h1 className="text-3xl sm:text-5xl font-black text-yellow-300 tracking-wide drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
            键盘守卫战 · 打字探险
          </h1>
          <p className="text-gray-300 text-sm sm:text-base mt-2 max-w-xl mx-auto font-sans">
            像史蒂夫一样守卫村庄！掌握 PC 实体键盘盲打、自然拼读与看字打拼音！
          </p>
        </div>
      </div>

      {/* ── 易错键巩固提醒（若有错键历史） ──────────────────── */}
      {weakEntries.length > 0 && (
        <div className="max-w-6xl mx-auto mb-6 bg-[#374151]/90 border-2 border-amber-500/80 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-[3px_3px_0_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="text-sm text-amber-300 font-bold">易错键巩固：</span>
            <div className="flex flex-wrap gap-1.5">
              {weakEntries.slice(0, 6).map(([k, c]) => (
                <span
                  key={k}
                  className="px-2 py-0.5 bg-gray-800 border border-amber-400/80 rounded text-xs font-mono font-black text-amber-200"
                >
                  {k.toUpperCase()} ({c}次)
                </span>
              ))}
            </div>
          </div>
          <span className="text-xs text-gray-300 font-sans">
            建议在练习时多注意手指归位至 F 和 J 定位键
          </span>
        </div>
      )}

      {/* ── 三大训练模式大标签切换 ──────────────────────────── */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-1.5 bg-[#252A30] border-3 border-black rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`py-3 px-2 sm:px-4 rounded-lg font-black text-sm sm:text-base border-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'keys'
                ? 'bg-blue-600 text-white border-black shadow-[3px_3px_0_rgba(0,0,0,1)] scale-[1.02]'
                : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>🔤</span>
            <span>键位训练 (7课)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('phonics')}
            className={`py-3 px-2 sm:px-4 rounded-lg font-black text-sm sm:text-base border-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'phonics'
                ? 'bg-amber-600 text-white border-black shadow-[3px_3px_0_rgba(0,0,0,1)] scale-[1.02]'
                : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>📖</span>
            <span>自然拼读 (L1-5)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pinyin')}
            className={`py-3 px-2 sm:px-4 rounded-lg font-black text-sm sm:text-base border-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pinyin'
                ? 'bg-emerald-600 text-white border-black shadow-[3px_3px_0_rgba(0,0,0,1)] scale-[1.02]'
                : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>🇨🇳</span>
            <span>拼音识字 (一至二年级)</span>
          </button>
        </div>
      </div>

      {/* ── 模式、速度与地图控制条 ──────────────────────────── */}
      <div className="max-w-6xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* 练习 / 挑战模式 */}
        <div className="bg-[#2D3238] border-2 border-black p-3 rounded-xl">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            🎮 游戏规则
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('practice')}
              className={`p-2 rounded-lg border border-black text-center text-xs font-bold transition-all ${
                mode === 'practice'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow'
                  : 'bg-gray-700/80 text-gray-300'
              }`}
            >
              🌱 练习模式 (无限心)
            </button>
            <button
              type="button"
              onClick={() => setMode('challenge')}
              className={`p-2 rounded-lg border border-black text-center text-xs font-bold transition-all ${
                mode === 'challenge'
                  ? 'bg-red-600 text-white ring-2 ring-red-400 shadow'
                  : 'bg-gray-700/80 text-gray-300'
              }`}
            >
              ⚔️ 守卫挑战 (扣心)
            </button>
          </div>
        </div>

        {/* 速度设置 */}
        <div className="bg-[#2D3238] border-2 border-black p-3 rounded-xl">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            ⚡ 怪物速度
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'slow', label: '慢速 (极缓)' },
              { id: 'normal', label: '中速 (适中)' },
              { id: 'fast', label: '快速 (挑战)' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSpeed(s.id as 'slow' | 'normal' | 'fast')}
                className={`p-2 rounded-lg border border-black text-center text-xs font-bold transition-all ${
                  speed === s.id
                    ? 'bg-blue-600 text-white ring-2 ring-yellow-400 shadow'
                    : 'bg-gray-700/80 text-gray-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 生态地图选择 */}
        <div className="bg-[#2D3238] border-2 border-black p-3 rounded-xl">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
            <span>🗺️ 战场地图</span>
            <span className="text-yellow-400 font-mono">{biomes.find((b) => b.id === biome)?.name}</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {biomes.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBiome(b.id)}
                className={`py-1.5 rounded border border-black text-center text-xs font-bold transition-all ${
                  biome === b.id
                    ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                    : 'bg-gray-700/80 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{b.icon}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── 拼音提示特别开关 (仅在拼音模式下显示) ──────────── */}
      {activeTab === 'pinyin' && (
        <div className="max-w-6xl mx-auto mb-6 bg-[#374151]/90 border-2 border-emerald-500/80 p-3 rounded-xl flex items-center justify-between gap-3">
          <div className="text-xs sm:text-sm font-sans text-gray-200">
            💡 <strong>拼音提示设置</strong>：开启后汉字上方显示带声调拼音（适合初学者）；关闭后只看汉字打拼音（进阶练习）。
          </div>
          <button
            type="button"
            onClick={() => setPinyinHint(!pinyinHint)}
            className={`px-3 py-1.5 rounded-lg border border-black font-bold text-xs font-mono transition-all ${
              pinyinHint
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {pinyinHint ? '✅ 拼音提示：开启' : '❌ 拼音提示：关闭'}
          </button>
        </div>
      )}

      {/* ── 内容列表 1: 键位训练 (7课) ─────────────────────── */}
      {activeTab === 'keys' && (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {KEY_LESSONS.map((lesson, idx) => {
              const unlocked = mode === 'practice' || isLessonUnlocked(progress, idx);
              const lessonStat = progress.lessons[lesson.id];
              const stars = lessonStat?.stars ?? 0;

              return (
                <div
                  key={lesson.id}
                  className={`bg-[#2D3238] border-3 border-black p-4 rounded-xl shadow-[5px_5px_0_rgba(0,0,0,0.7)] flex flex-col justify-between transition-all ${
                    unlocked ? 'hover:-translate-y-1 hover:border-yellow-400' : 'opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase">第 {idx + 1} 课</span>
                      <div className="flex gap-1 text-sm">
                        {[1, 2, 3].map((s) => (
                          <span key={s} className={s <= stars ? '' : 'opacity-25 grayscale'}>⭐</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-3xl">{lesson.icon}</span>
                      <div>
                        <h3 className="font-bold text-base text-yellow-300">
                          {idx === 0 && '食指基准定位'}
                          {idx === 1 && '基准行核心键'}
                          {idx === 2 && '基准行左右扩展'}
                          {idx === 3 && '上排字母键'}
                          {idx === 4 && '下排字母键'}
                          {idx === 5 && '全字母大乱斗'}
                          {idx === 6 && '数字键盘挑战'}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono">{lesson.keys.length} 个重点键</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {lesson.keys.map((k) => {
                        const def = getKeyDef(k);
                        const fingerColor = def ? FINGER_COLORS[def.finger] : '#888';
                        return (
                          <span
                            key={k}
                            style={{ borderBottomColor: fingerColor, borderBottomWidth: '3px' }}
                            className="px-2 py-0.5 bg-gray-700 border border-gray-600 rounded text-xs font-mono font-bold text-white shadow-sm"
                          >
                            {k.toUpperCase()}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <Link
                    href={`/typing/play?category=keys&lesson=${lesson.id}&mode=${mode}&speed=${speed}&biome=${biome}`}
                    className="block w-full py-2.5 px-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-center text-sm border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    {mode === 'practice' ? '进入练习 🚀' : '开始挑战 ⚔️'}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 内容列表 2: 自然拼读 (Oxford Phonics L1-5) ──────── */}
      {activeTab === 'phonics' && (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PHONICS_LEVELS.map((pl) => {
              const stat = progress.lessons[pl.id];
              const stars = stat?.stars ?? 0;

              return (
                <div
                  key={pl.id}
                  className="bg-[#2D3238] border-3 border-black p-5 rounded-xl shadow-[5px_5px_0_rgba(0,0,0,0.7)] flex flex-col justify-between hover:-translate-y-1 hover:border-yellow-400 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500 font-bold font-mono">
                        {pl.badge}
                      </span>
                      <div className="flex gap-1 text-sm">
                        {[1, 2, 3].map((s) => (
                          <span key={s} className={s <= stars ? '' : 'opacity-25 grayscale'}>⭐</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-3xl">{pl.icon}</span>
                      <h3 className="font-bold text-lg text-yellow-300">{pl.title}</h3>
                    </div>
                    <p className="text-xs text-gray-300 font-sans mb-3 leading-relaxed">{pl.subtitle}</p>

                    {/* 重点词汇预览 */}
                    <div className="p-2.5 bg-gray-800/80 rounded-lg border border-gray-700 mb-4">
                      <div className="text-[11px] text-gray-400 mb-1 font-bold">🎯 词汇库包含（击破带 TTS 语音发音）：</div>
                      <div className="flex flex-wrap gap-1.5">
                        {pl.words.slice(0, 8).map((w) => (
                          <span key={w.word} className="px-1.5 py-0.5 bg-gray-700 text-emerald-300 rounded text-xs font-mono">
                            {w.icon} {w.word}
                          </span>
                        ))}
                        <span className="text-xs text-gray-400 px-1">...等 {pl.words.length} 词</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/typing/play?category=phonics&level=${pl.level}&mode=${mode}&speed=${speed}&biome=${biome}`}
                    className="block w-full py-2.5 px-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-center text-sm border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    进入拼读冒险 🏹
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 内容列表 3: 拼音汉字 (声母韵母 / 一二年级) ──────── */}
      {activeTab === 'pinyin' && (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {PINYIN_LESSONS.map((pyl) => {
              const stat = progress.lessons[pyl.id];
              const stars = stat?.stars ?? 0;

              return (
                <div
                  key={pyl.id}
                  className="bg-[#2D3238] border-3 border-black p-4 rounded-xl shadow-[5px_5px_0_rgba(0,0,0,0.7)] flex flex-col justify-between hover:-translate-y-1 hover:border-yellow-400 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500 font-bold font-mono">
                        {pyl.category === 'letters' ? '拼音字母' : pyl.category === 'grade1' ? '一年级' : '二年级'}
                      </span>
                      <div className="flex gap-1 text-sm">
                        {[1, 2, 3].map((s) => (
                          <span key={s} className={s <= stars ? '' : 'opacity-25 grayscale'}>⭐</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl">{pyl.icon}</span>
                      <h3 className="font-bold text-base text-yellow-300">{pyl.title}</h3>
                    </div>
                    <p className="text-xs text-gray-300 font-sans mb-3">{pyl.subtitle}</p>

                    {/* 预览词库 */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {pyl.items.slice(0, 8).map((it) => (
                        <span key={it.text} className="px-1.5 py-0.5 bg-gray-700 text-yellow-200 rounded text-xs font-mono font-bold">
                          {it.text}
                        </span>
                      ))}
                      <span className="text-xs text-gray-400 self-center">...共{pyl.items.length}个</span>
                    </div>
                  </div>

                  <Link
                    href={`/typing/play?category=pinyin&lesson=${pyl.id}&mode=${mode}&speed=${speed}&biome=${biome}&hint=${pinyinHint ? 'on' : 'off'}`}
                    className="block w-full py-2.5 px-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-center text-sm border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    开始识字练习 🎯
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </main>
  );
}
