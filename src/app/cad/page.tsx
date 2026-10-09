'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Volume2, Download, Hammer, Layers, Compass, Zap } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useMounted } from '@/hooks/useMounted';

import { CAD_MISSIONS, CAD_COMMANDS, CadMission } from '@/lib/cad/cad-data';
import {
  getCadProgress,
  markCadMissionComplete,
  recordCadCommandSuccess,
  CadProgress,
} from '@/lib/cad/cad-storage';
import { speakCadCommand } from '@/lib/cad/cad-sounds';
import { saveRecord } from '@/lib/study-storage';

import { CadCanvas } from '@/components/cad/CadCanvas';
import { CadCommandLine } from '@/components/cad/CadCommandLine';
import { CadStepGuide } from '@/components/cad/CadStepGuide';
import { CadMissionSelector } from '@/components/cad/CadMissionSelector';
import { CadSandbox } from '@/components/cad/CadSandbox';
import { CadSpeedQuiz } from '@/components/cad/CadSpeedQuiz';
import { CadVictoryModal } from '@/components/cad/CadVictoryModal';
import { CadCheatSheetPdfDocument } from '@/lib/cad/cad-pdf-generator';
import { pdf } from '@react-pdf/renderer';

type CadTab = 'missions' | 'quiz' | 'sandbox' | 'cheatsheet';

export default function CadHubPage() {
  const mounted = useMounted();

  const [activeTab, setActiveTab] = useState<CadTab>('missions');
  const [progress, setProgress] = useState<CadProgress>(() => getCadProgress());

  // 关卡状态
  const [activeMission, setActiveMission] = useState<CadMission>(CAD_MISSIONS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(1);
  const [showVictory, setShowVictory] = useState<boolean>(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#141820] flex items-center justify-center text-white font-[var(--font-pixel)]">
        <div className="text-2xl">正在加载 AutoCAD 蓝图工坊...</div>
      </main>
    );
  }

  const currentStep = activeMission.steps.find((s) => s.stepIndex === currentStepIndex) || activeMission.steps[0];
  const isLastStep = currentStepIndex === activeMission.steps.length;

  // 处理命令敲击成功
  const handleCommandSuccess = (cmdKey: string) => {
    recordCadCommandSuccess(cmdKey);

    if (isLastStep) {
      // 关卡全部完成！
      const updated = markCadMissionComplete(activeMission.id, 3);
      setProgress(updated);
      setShowVictory(true);

      // 自动保存一条学习时长记录 (5分钟)
      saveRecord({
        subject: 'cad',
        contentType: 'cad-drawing',
        contentTitle: activeMission.title,
        duration: 5,
        completedAt: new Date().toISOString(),
      });
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  // 切换关卡
  const handleSelectMission = (m: CadMission) => {
    setActiveMission(m);
    setCurrentStepIndex(1);
    setShowVictory(false);
  };

  // 下一关
  const handleNextMission = () => {
    const currentIndex = CAD_MISSIONS.findIndex((m) => m.id === activeMission.id);
    if (currentIndex >= 0 && currentIndex < CAD_MISSIONS.length - 1) {
      handleSelectMission(CAD_MISSIONS[currentIndex + 1]);
    }
  };

  const hasNextMission =
    CAD_MISSIONS.findIndex((m) => m.id === activeMission.id) < CAD_MISSIONS.length - 1;

  // 下载 PDF 速查手卡
  const handleDownloadPdf = async () => {
    setIsPdfGenerating(true);
    try {
      const blob = await pdf(<CadCheatSheetPdfDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `duomi-autocad-cheatsheet-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('PDF 生成失败，请查看控制台。');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#111419] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] text-white p-3 sm:p-6 font-[var(--font-pixel)] select-none">
      {/* ── 顶部导航栏 ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="px-3.5 py-1.5 bg-[#374151] hover:bg-[#4B5563] text-white font-bold border-2 border-black rounded-xl shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-1.5 text-xs sm:text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回主页</span>
          </Link>

          <div className="flex items-center gap-2 bg-[#1E232A] border-2 border-[#2F3744] px-3 py-1 rounded-xl text-xs">
            <span className="text-cyan-400 font-bold">🏗️ 蓝图竣工:</span>
            <span className="text-yellow-300 font-black">
              {progress.completedMissions.length} / {CAD_MISSIONS.length}
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-emerald-400 font-bold">🌟 总执行:</span>
            <span className="text-white font-black">{progress.totalBuilds} 次</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadPdf}
            disabled={isPdfGenerating}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold border-2 border-black rounded-xl shadow-[2px_2px_0_rgba(0,0,0,1)] text-xs flex items-center gap-1.5 transition-all active:translate-y-0.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isPdfGenerating ? '生成中...' : '打印4页手册 (PDF)'}</span>
          </button>
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>

      {/* ── 头部标题栏 (紧凑型) ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto text-center mb-3">
        <div className="inline-block px-4 py-2 sm:px-6 sm:py-2.5 bg-[#1A202C] border-3 border-[#2D3748] rounded-2xl shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl sm:text-2xl">📐 🏛️ 🚀</span>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-cyan-300 tracking-wide drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
              AutoCAD 蓝图工坊 · 小小建筑师
            </h1>
          </div>
          <p className="text-gray-300 text-[11px] sm:text-xs mt-0.5 max-w-xl mx-auto font-sans">
            专为一年级小朋友打造！掌握「快捷键简写 + 拍空格」核心习惯，像工程师一样绘图！
          </p>
        </div>
      </div>

      {/* ── 功能选项卡 (Tabs) ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto mb-4 flex justify-center">
        <div className="bg-[#1C212A] p-1 rounded-2xl border-2 border-[#2E3744] flex items-center gap-1.5 shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setActiveTab('missions')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === 'missions'
                ? 'bg-cyan-500 text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Hammer className="w-4 h-4" />
            <span>🏗️ 蓝图建造关卡 (10关)</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === 'quiz'
                ? 'bg-cyan-500 text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>⚡ 闪电速认闯关</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === 'sandbox'
                ? 'bg-cyan-500 text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>🎮 自由演练沙盒</span>
          </button>

          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === 'cheatsheet'
                ? 'bg-cyan-500 text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>🖨️ 桌面速查与手册 (PDF)</span>
          </button>
        </div>
      </div>

      {/* ── 核心内容区 ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto">
        {/* ── TAB 1: 蓝图建造关卡 ───────────────────────────── */}
        {activeTab === 'missions' && (
          <div className="space-y-6">
            {/* 关卡选择器 */}
            <CadMissionSelector
              progress={progress}
              onSelectMission={handleSelectMission}
              activeMissionId={activeMission.id}
            />

            {/* 当前正在进行的图纸施工工作区 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* 左侧：图纸指引卡片 */}
              <div className="lg:col-span-5 space-y-4">
                <CadStepGuide step={currentStep} totalSteps={activeMission.steps.length} />

                {/* 快捷键操作秘籍 */}
                <div className="bg-[#191D24] border-2 border-emerald-500/40 rounded-xl p-3.5 text-xs text-emerald-200/90 leading-relaxed font-sans">
                  <span className="font-bold text-emerald-400">⚡ 小小建筑师操作要领：</span>
                  <p className="mt-1">
                    在键盘上敲入快捷键字母（例如 <b className="text-yellow-300">{currentStep.targetCommand}</b>），然后用左手大拇指轻拍【空格键】，图纸就会立即自动绘制！如果不小心按错，按【ESC】随时取消。
                  </p>
                </div>
              </div>

              {/* 右侧：AutoCAD 画布 + 命令行交互 */}
              <div className="lg:col-span-7 space-y-4">
                <CadCanvas
                  mission={activeMission}
                  currentStepIndex={currentStepIndex}
                  activeCommandName={currentStep.targetCommand}
                />

                <CadCommandLine
                  expectedCommand={currentStep.targetCommand}
                  expectedName={currentStep.englishWord}
                  expectedMeaning={currentStep.wordMeaning}
                  onCommandSuccess={handleCommandSuccess}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: ⚡ 闪电速认闯关 ────────────────────────── */}
        {activeTab === 'quiz' && (
          <div className="max-w-4xl mx-auto">
            <CadSpeedQuiz />
          </div>
        )}

        {/* ── TAB 3: 自由演练沙盒 ───────────────────────────── */}
        {activeTab === 'sandbox' && (
          <div className="max-w-4xl mx-auto">
            <CadSandbox />
          </div>
        )}

        {/* ── TAB 4: 桌面速查卡与单词卡 ─────────────────────── */}
        {activeTab === 'cheatsheet' && (
          <div className="space-y-6">
            {/* 顶部下载 Banner */}
            <div className="bg-gradient-to-r from-blue-900/60 to-cyan-900/60 border-2 border-cyan-500/60 p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-cyan-300">
                  📄 一年级专属 AutoCAD 快捷键 4 页打印手册 (PDF)
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 font-sans mt-1">
                  包含 20 大核心实战快捷键桌面速查卡 + 两套趣味连线闯关纸 + 大字母指法涂色卡。建议打印贴在屏幕旁！
                </p>
              </div>

              <button
                onClick={handleDownloadPdf}
                disabled={isPdfGenerating}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black border-2 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-2 text-sm sm:text-base shrink-0 transition-all"
              >
                <Download className="w-5 h-5" />
                <span>{isPdfGenerating ? '生成中...' : '下载 A4 打印文件'}</span>
              </button>
            </div>

            {/* 12 个快捷键图鉴卡片展示 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {CAD_COMMANDS.map((cmd) => (
                <div
                  key={cmd.key}
                  className="bg-[#1C212A] border-2 border-[#2F3847] hover:border-cyan-500/70 rounded-xl p-4 transition-all hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-14 h-12 bg-cyan-900/80 text-cyan-300 border-2 border-cyan-400 rounded-lg flex flex-col items-center justify-center font-mono font-black text-xl">
                        <span>{cmd.key}</span>
                        <span className="text-[9px] -mt-1 text-cyan-200">
                          {cmd.category === 'control' ? '直接按' : '+ 空格'}
                        </span>
                      </div>

                      <button
                        onClick={() => speakCadCommand(cmd.name, cmd.chinese)}
                        className="p-2 bg-gray-700/80 hover:bg-cyan-600 rounded-lg text-cyan-300 hover:text-white transition-all active:scale-95"
                        title="朗读英语与释义"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="text-lg font-black text-white font-sans">{cmd.name}</h4>
                    <span className="text-xs font-bold text-emerald-400 mb-2 block">
                      {cmd.chinese}
                    </span>

                    <p className="text-xs text-gray-300 font-sans leading-relaxed mb-3">
                      💡 {cmd.tip}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-800 text-[11px] text-gray-400 font-mono">
                    {cmd.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 胜利通关弹窗 ────────────────────────────────────── */}
      {showVictory && (
        <CadVictoryModal
          mission={activeMission}
          onReplay={() => {
            setCurrentStepIndex(1);
            setShowVictory(false);
          }}
          onNextMission={handleNextMission}
          hasNextMission={hasNextMission}
        />
      )}
    </main>
  );
}
