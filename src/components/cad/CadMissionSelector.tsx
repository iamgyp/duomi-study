'use client';

import React from 'react';
import { CAD_MISSIONS, CadMission } from '@/lib/cad/cad-data';
import { CadProgress } from '@/lib/cad/cad-storage';
import { CheckCircle2, Play } from 'lucide-react';

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {CAD_MISSIONS.map((m) => {
        const isCompleted = progress.completedMissions.includes(m.id);
        const stars = progress.stars[m.id] || 0;
        const isActive = activeMissionId === m.id;

        return (
          <div
            key={m.id}
            onClick={() => onSelectMission(m)}
            className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border-4 relative overflow-hidden flex flex-col justify-between ${
              isActive
                ? 'bg-[#2A3442] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] -translate-y-1'
                : 'bg-[#1E232A] border-[#2E3744] hover:border-gray-500 hover:-translate-y-1'
            }`}
          >
            {/* 已竣工绿色印章标记 */}
            {isCompleted && (
              <div className="absolute top-3 right-3 text-emerald-400 flex items-center gap-1 text-xs font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-600/60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>已竣工</span>
              </div>
            )}

            <div>
              {/* 图标与难度 */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl p-2 bg-[#141820] rounded-xl border border-gray-700">
                  {m.icon}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base sm:text-lg font-black text-white">{m.title}</h4>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold ${
                        m.difficulty === 1
                          ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600/50'
                          : m.difficulty === 2
                          ? 'bg-blue-900/80 text-blue-300 border border-blue-600/50'
                          : 'bg-purple-900/80 text-purple-300 border border-purple-600/50'
                      }`}
                    >
                      {m.difficulty === 1 ? '入门' : m.difficulty === 2 ? '进阶' : '挑战'}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono block">{m.subtitle}</span>
                </div>
              </div>

              {/* 描述 */}
              <p className="text-xs text-gray-300 leading-relaxed font-sans mb-3 line-clamp-2">
                {m.description}
              </p>
            </div>

            {/* 底部信息与动作 */}
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between mt-auto">
              {/* 星级 */}
              <div className="flex items-center text-xs text-yellow-400">
                {isCompleted ? (
                  <span>{'⭐'.repeat(stars || 3)}</span>
                ) : (
                  <span className="text-gray-500 text-[11px]">6 步施工</span>
                )}
              </div>

              {/* 按钮 */}
              <button
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-black shadow'
                    : 'bg-[#374151] hover:bg-cyan-600 text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isActive ? '正在绘制' : isCompleted ? '重新施工' : '开工建造'}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
