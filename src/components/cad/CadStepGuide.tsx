'use client';

import React from 'react';
import { CadMissionStep } from '@/lib/cad/cad-data';
import { Volume2 } from 'lucide-react';
import { speakCadCommand } from '@/lib/cad/cad-sounds';

interface CadStepGuideProps {
  step: CadMissionStep;
  totalSteps: number;
}

export function CadStepGuide({ step, totalSteps }: CadStepGuideProps) {
  const handlePlayVoice = () => {
    speakCadCommand(step.englishWord, step.wordMeaning);
  };

  const progressPercent = Math.round(((step.stepIndex - 1) / totalSteps) * 100);

  return (
    <div className="bg-[#1F242C] border-4 border-[#2F3744] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0_rgba(0,0,0,0.6)] text-white select-none">
      {/* ── 施工进度条 ──────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-2 font-mono">
        <span className="font-bold text-cyan-400">
          🏗️ 蓝图施工进度: 步骤 {step.stepIndex} / {totalSteps}
        </span>
        <span className="text-gray-400">{progressPercent}%</span>
      </div>
      <div className="w-full h-3 bg-gray-800 rounded-full border border-gray-700 overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ── 核心施工指令 ────────────────────────────────────── */}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-100 flex items-center gap-2">
          <span>🎯</span>
          <span>{step.instruction}</span>
        </h3>
      </div>

      {/* ── 快捷键与英语卡片 (针对一年级小朋友重点设计) ────── */}
      <div className="bg-[#141820] border-2 border-cyan-500/40 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* 左侧：快捷键巨大徽章 */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-amber-500 text-black font-black text-2xl sm:text-3xl rounded-xl border-4 border-black flex flex-col items-center justify-center shadow-[3px_3px_0_rgba(0,0,0,1)]">
            <span>{step.targetCommand}</span>
            <span className="text-[10px] font-sans font-bold -mt-1 text-gray-900">+ 空格</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-yellow-300 font-sans tracking-wide">
                {step.englishWord}
              </span>
              <button
                onClick={handlePlayVoice}
                className="p-1.5 rounded-lg bg-gray-700/80 hover:bg-cyan-600 text-cyan-300 hover:text-white transition-all active:scale-90"
                title="点击朗读发音"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm sm:text-base font-bold text-emerald-300 mt-0.5">
              中文含义：{step.wordMeaning}
            </div>
          </div>
        </div>

        {/* 右侧：口诀记忆点 */}
        <div className="w-full sm:w-auto bg-[#1C222C] border border-[#2F3A4B] rounded-lg p-2.5 sm:max-w-xs text-xs sm:text-sm text-amber-200/90 leading-relaxed">
          <span className="font-bold text-yellow-400">💡 记忆口诀：</span>
          <p className="mt-0.5 font-sans">{step.tip}</p>
        </div>
      </div>
    </div>
  );
}
