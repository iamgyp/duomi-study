'use client';

import React, { useState } from 'react';
import { CAD_MISSIONS, CadMission } from '@/lib/cad/cad-data';
import { CadProgress } from '@/lib/cad/cad-storage';
import { CheckCircle2, Play, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

interface CadMissionSelectorProps {
  progress: CadProgress;
  onSelectMission: (mission: CadMission) => void;
  activeMissionId?: string;
}

export function CadMissionSelector({
  progress,
  onSelectMission,
  activeMissionId,
}: CadMissionSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeIndex = CAD_MISSIONS.findIndex((m) => m.id === activeMissionId);
  const currentMission = CAD_MISSIONS[activeIndex >= 0 ? activeIndex : 0];

  const handlePrev = () => {
    if (activeIndex > 0) {
      onSelectMission(CAD_MISSIONS[activeIndex - 1]);
    }
  };

  const handleNext = () => {
    if (activeIndex < CAD_MISSIONS.length - 1) {
      onSelectMission(CAD_MISSIONS[activeIndex + 1]);
    }
  };

  return (
    <div className="bg-[#1C212A] border-3 border-[#2E3744] rounded-2xl p-2.5 sm:p-3 shadow-[3px_3px_0_rgba(0,0,0,0.5)] select-none">
      {/* ── 紧凑单行导航栏 (Compact Toolbar) ────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* 左侧：当前关卡信息与快捷翻页 */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-[#12151B] px-2.5 py-1.5 rounded-xl border border-gray-700/80">
            <span className="text-xl">{currentMission.icon}</span>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  第 {activeIndex + 1}/{CAD_MISSIONS.length} 关
                </span>
                <span className="text-xs sm:text-sm font-black text-white">
                  {currentMission.title}
                </span>
                <span
                  className={`text-[9px] px-1 rounded font-sans font-bold ${
                    currentMission.difficulty === 1
                      ? 'bg-emerald-900/80 text-emerald-300'
                      : currentMission.difficulty === 2
                      ? 'bg-blue-900/80 text-blue-300'
                      : 'bg-purple-900/80 text-purple-300'
                  }`}
                >
                  {currentMission.difficulty === 1 ? '入门' : currentMission.difficulty === 2 ? '进阶' : '挑战'}
                </span>
              </div>
            </div>
          </div>

          {/* 上一关 / 下一关快速箭头 */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={activeIndex <= 0}
              className="p-1.5 rounded-lg bg-[#252B36] hover:bg-[#343D4C] text-gray-300 disabled:opacity-30 disabled:hover:bg-[#252B36] transition-all"
              title="上一张蓝图"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex >= CAD_MISSIONS.length - 1}
              className="p-1.5 rounded-lg bg-[#252B36] hover:bg-[#343D4C] text-gray-300 disabled:opacity-30 disabled:hover:bg-[#252B36] transition-all"
              title="下一张蓝图"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 中间：横向滑动关卡胶囊条 (Scrollable Level Strip) */}
        <div className="flex-1 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 min-w-max">
            {CAD_MISSIONS.map((m, idx) => {
              const isCompleted = progress.completedMissions.includes(m.id);
              const isActive = activeMissionId === m.id;
              const stars = progress.stars[m.id] || 0;

              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMission(m)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)] font-black scale-[1.02]'
                      : isCompleted
                      ? 'bg-[#182322] hover:bg-[#233533] text-emerald-300 border border-emerald-600/50'
                      : 'bg-[#141820] hover:bg-[#202633] text-gray-300 border border-gray-700/60'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{idx + 1}.{m.title.replace('Minecraft ', '').replace('蓝图', '')}</span>
                  {isCompleted && (
                    <span className="text-[10px] text-yellow-300 -ml-0.5">
                      {'★'.repeat(Math.min(stars || 3, 3))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 右侧：展开全部大卡片抽屉按钮 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
            isExpanded
              ? 'bg-amber-400/20 text-yellow-300 border-yellow-500/60'
              : 'bg-[#252B36] hover:bg-[#343D4C] text-gray-300 border-gray-700'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>{isExpanded ? '收起图纸卡片' : '全部 10 关图纸'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── 可折叠的大卡片详情展示区 (Collapsible Grid) ──────── */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-800 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {CAD_MISSIONS.map((m, idx) => {
              const isCompleted = progress.completedMissions.includes(m.id);
              const stars = progress.stars[m.id] || 0;
              const isActive = activeMissionId === m.id;

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectMission(m);
                    setIsExpanded(false); // 选完后自动收起，让工作台露出来！
                  }}
                  className={`cursor-pointer rounded-xl p-3 transition-all duration-200 border-2 relative overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? 'bg-[#2A3442] border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-[#141820] border-[#2E3744] hover:border-gray-500'
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute top-2 right-2 text-emerald-400 flex items-center gap-0.5 text-[10px] font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-600/60">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>已竣工</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl p-1.5 bg-[#1C212A] rounded-lg border border-gray-700">
                        {m.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">#{idx + 1}</span>
                          <h4 className="text-xs sm:text-sm font-black text-white truncate max-w-[110px]">
                            {m.title}
                          </h4>
                        </div>
                        <span
                          className={`text-[9px] px-1 rounded font-sans font-bold inline-block ${
                            m.difficulty === 1
                              ? 'bg-emerald-900/80 text-emerald-300'
                              : m.difficulty === 2
                              ? 'bg-blue-900/80 text-blue-300'
                              : 'bg-purple-900/80 text-purple-300'
                          }`}
                        >
                          {m.difficulty === 1 ? '入门' : m.difficulty === 2 ? '进阶' : '挑战'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 leading-snug font-sans mb-2 line-clamp-2">
                      {m.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-800 flex items-center justify-between mt-auto text-xs">
                    <span className="text-yellow-400 text-[11px]">
                      {isCompleted ? '★'.repeat(stars || 3) : '6 步施工'}
                    </span>
                    <button
                      className={`px-2 py-1 rounded text-[11px] font-black flex items-center gap-1 ${
                        isActive
                          ? 'bg-cyan-500 text-black'
                          : 'bg-[#2E3644] hover:bg-cyan-600 text-white'
                      }`}
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>{isActive ? '正在绘制' : '选择'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
