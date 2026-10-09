'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Music, Layers, BookOpen } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useMounted } from '@/hooks/useMounted';

import { NoteBlockGame } from '@/components/memory/NoteBlockGame';
import { CardMatchGame } from '@/components/memory/CardMatchGame';
import { ExplorerLogGame } from '@/components/memory/ExplorerLogGame';

type MemoryTab = 'hub' | 'explorer' | 'notes' | 'cards';

function MemoryTempleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as MemoryTab) || 'hub';

  const [activeTab, setActiveTab] = useState<MemoryTab>(initialTab);

  const switchTab = (tab: MemoryTab) => {
    setActiveTab(tab);
    router.replace(`/memory?tab=${tab}`, { scroll: false });
  };

  return (
    <main className="min-h-screen bg-[#141820] bg-[radial-gradient(#252e3d_1px,transparent_1px)] [background-size:16px_16px] text-white flex flex-col items-center p-3 sm:p-6 font-[var(--font-pixel)] select-none">
      {/* ── 顶部导航栏 ────────────────────────────────────────── */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-3 mb-5 bg-[#1F2530] border-3 border-black p-3 rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 bg-[#374151] hover:bg-[#4B5563] text-white text-xs sm:text-sm font-bold border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回首页</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🏛️</span>
            <div>
              <h1 className="text-base sm:text-lg font-black text-amber-300 drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
                记忆神殿 · Memory Temple
              </h1>
              <p className="hidden sm:block text-[11px] text-gray-400 font-sans">
                感官时序专注 · 空间双向联想 · 高迁移情景重构与逻辑推理
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>

      {/* ── 模式切换选项卡 ──────────────────────────────────── */}
      <div className="w-full max-w-5xl flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => switchTab('hub')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-black border-2 border-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'hub'
              ? 'bg-amber-500 text-black shadow-[3px_3px_0_rgba(0,0,0,1)]'
              : 'bg-[#2A303C] text-gray-300 hover:bg-[#343D4C]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>神殿大厅</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('explorer')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-black border-2 border-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'explorer'
              ? 'bg-amber-600 text-white shadow-[3px_3px_0_rgba(0,0,0,1)]'
              : 'bg-[#2A303C] text-gray-300 hover:bg-[#343D4C]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-yellow-300" />
          <span>📜 探险家日志 (高迁移推荐)</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('notes')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-black border-2 border-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'notes'
              ? 'bg-emerald-600 text-white shadow-[3px_3px_0_rgba(0,0,0,1)]'
              : 'bg-[#2A303C] text-gray-300 hover:bg-[#343D4C]'
          }`}
        >
          <Music className="w-4 h-4 text-emerald-300" />
          <span>🎵 音符盒秘境 (序列记忆)</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('cards')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-black border-2 border-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'cards'
              ? 'bg-purple-600 text-white shadow-[3px_3px_0_rgba(0,0,0,1)]'
              : 'bg-[#2A303C] text-gray-300 hover:bg-[#343D4C]'
          }`}
        >
          <Layers className="w-4 h-4 text-purple-300" />
          <span>🃏 末影宝藏 (翻牌配对)</span>
        </button>
      </div>

      {/* ── 视图路由分发 ────────────────────────────────────── */}
      <div className="w-full max-w-5xl flex flex-col items-center">
        {activeTab === 'hub' && (
          <div className="w-full space-y-6">
            {/* 顶栏横幅介绍 */}
            <div className="mc-card bg-gradient-to-r from-amber-900/60 via-purple-900/40 to-emerald-900/60 p-6 sm:p-8 rounded-2xl border-4 border-black text-center relative overflow-hidden">
              <span className="text-4xl sm:text-5xl block mb-2">🏛️</span>
              <h2 className="text-2xl sm:text-4xl font-black text-yellow-300 drop-shadow-md">
                欢迎来到记忆神殿
              </h2>
              <p className="text-sm sm:text-base text-gray-200 font-sans max-w-2xl mx-auto mt-2 leading-relaxed">
                专为小学一年级小朋友设计的记忆力思维空间。从底层的<span className="text-yellow-400 font-bold">视听专注</span>与<span className="text-purple-300 font-bold">空间联想</span>，跃升到高阶的<span className="text-emerald-300 font-bold">情境重构与逻辑推理</span>，全面赋能语文阅读与数学解决问题！
              </p>
            </div>

            {/* 三大训练殿堂卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 卡片 1: 探险家日志 (高迁移推荐) */}
              <div className="mc-card bg-[#1E2530] border-4 border-amber-500/80 p-5 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden shadow-[6px_6px_0_rgba(0,0,0,0.8)]">
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black rounded">
                  ⭐ 核心推荐
                </div>
                <div>
                  <div className="text-3xl mb-2">📜</div>
                  <h3 className="text-lg font-black text-amber-300 mb-1">
                    探险家日志 · 高迁移模式
                  </h3>
                  <div className="text-xs text-amber-400 font-sans font-bold mb-3">
                    [故事展示] ➔ [时序/要素重构] ➔ [逻辑验证]
                  </div>
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    听语音读故事，将打乱的事件按先后时序拼回，并回答数学应用与因果推理问题。对标一年级看图写话与数学解决问题！
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => switchTab('explorer')}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-sm border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
                  >
                    立即探险 &rarr;
                  </button>
                </div>
              </div>

              {/* 卡片 2: 音符盒秘境 */}
              <div className="mc-card bg-[#1E2530] border-4 border-emerald-500/80 p-5 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden shadow-[6px_6px_0_rgba(0,0,0,0.8)]">
                <div>
                  <div className="text-3xl mb-2">🎵</div>
                  <h3 className="text-lg font-black text-emerald-400 mb-1">
                    音符盒秘境 · 序列节奏记忆
                  </h3>
                  <div className="text-xs text-emerald-400 font-sans font-bold mb-3">
                    视听双通道 · 短时工作记忆
                  </div>
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    Minecraft 红石灯与音符盒闪烁发声，记住顺序后用键盘或鼠标复现！从 3 步慢速到无尽连胜，纯感官锻炼专注力！
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => switchTab('notes')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
                  >
                    开始听音 &rarr;
                  </button>
                </div>
              </div>

              {/* 卡片 3: 末影宝藏 */}
              <div className="mc-card bg-[#1E2530] border-4 border-purple-500/80 p-5 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden shadow-[6px_6px_0_rgba(0,0,0,0.8)]">
                <div>
                  <div className="text-3xl mb-2">🃏</div>
                  <h3 className="text-lg font-black text-purple-300 mb-1">
                    末影宝藏 · 翻牌配对消消乐
                  </h3>
                  <div className="text-xs text-purple-400 font-sans font-bold mb-3">
                    空间位置记忆 · 学科双向联想
                  </div>
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    翻开两张卡片进行配对。支持 Minecraft 像素图鉴、拼音↔汉字互认、算式↔得数速算以及英文图词配对，寓教于乐！
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => switchTab('cards')}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
                  >
                    寻找宝藏 &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'explorer' && <ExplorerLogGame />}
        {activeTab === 'notes' && <NoteBlockGame />}
        {activeTab === 'cards' && <CardMatchGame />}
      </div>
    </main>
  );
}

export default function MemoryPage() {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#141820] flex items-center justify-center text-white font-[var(--font-pixel)]">
        <div className="text-2xl">正在步入记忆神殿...</div>
      </main>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#141820] flex items-center justify-center text-white font-[var(--font-pixel)]">
          <div className="text-2xl">加载神殿秘境中...</div>
        </div>
      }
    >
      <MemoryTempleContent />
    </Suspense>
  );
}
