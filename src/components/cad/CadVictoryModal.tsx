'use client';

import React from 'react';
import { CadMission } from '@/lib/cad/cad-data';
import { Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface CadVictoryModalProps {
  mission: CadMission;
  onReplay: () => void;
  onNextMission?: () => void;
  hasNextMission: boolean;
}

export function CadVictoryModal({
  mission,
  onReplay,
  onNextMission,
  hasNextMission,
}: CadVictoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-[var(--font-pixel)] select-none">
      <div className="bg-[#1E232A] border-4 border-yellow-400 rounded-2xl max-w-lg w-full p-6 text-center text-white shadow-[0_0_40px_rgba(250,204,21,0.3)] relative">
        {/* 顶部金牌徽章 */}
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full border-4 border-black mx-auto flex items-center justify-center text-4xl shadow-[4px_4px_0_rgba(0,0,0,1)] -mt-14 mb-4">
          <Trophy className="w-10 h-10 text-white drop-shadow" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-yellow-300 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] mb-1">
          🎉 蓝图竣工大吉！
        </h2>
        <p className="text-gray-300 text-sm sm:text-base font-sans mb-4">
          恭喜你完美完成了【{mission.title}】的全部工程绘制！
        </p>

        {/* 获颁证书戳印 */}
        <div className="bg-[#141820] border-2 border-[#2D3748] rounded-xl p-4 mb-6 relative overflow-hidden">
          <div className="text-xs text-cyan-400 font-mono tracking-widest mb-1">
            AUTOCAD JUNIOR ARCHITECT
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mb-2">
            获颁：【一级小小建筑师勋章】
          </div>
          <div className="flex justify-center gap-2 text-2xl text-yellow-400 mb-2">
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
          </div>
          <p className="text-xs text-gray-400 font-sans">
            快捷键肌肉记忆 + 6 步绘制完美达成！
          </p>

          {/* 红色工程竣工印章样式 */}
          <div className="absolute -bottom-2 -right-2 border-4 border-red-500/70 text-red-400 font-black text-xs px-2.5 py-1 rounded rotate-[-15deg] uppercase tracking-wider">
            PASS 竣工验收
          </div>
        </div>

        {/* 底部按钮栏 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onReplay}
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-bold border-2 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再练一遍</span>
          </button>

          {hasNextMission && onNextMission && (
            <button
              onClick={onNextMission}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black border-2 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base transition-all"
            >
              <span>下一张蓝图</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <Link
            href="/cad"
            className="w-full sm:w-auto px-4 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold border-2 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 text-sm"
          >
            返回图纸工坊
          </Link>
        </div>
      </div>
    </div>
  );
}
