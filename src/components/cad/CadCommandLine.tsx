'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  playCadKeyClick,
  playCadCommandSuccess,
  playCadError,
  playCadEscape,
  speakCadCommand,
} from '@/lib/cad/cad-sounds';
import { CAD_COMMANDS } from '@/lib/cad/cad-data';

interface CadCommandLineProps {
  expectedCommand?: string; // 当前关卡期望的快捷键 (例如 'REC')
  expectedName?: string;
  expectedMeaning?: string;
  onCommandSuccess: (cmdKey: string) => void;
  onCommandFail?: (wrongInput: string) => void;
  disabled?: boolean;
}

export function CadCommandLine({
  expectedCommand,
  expectedName,
  expectedMeaning,
  onCommandSuccess,
  onCommandFail,
  disabled = false,
}: CadCommandLineProps) {
  const [inputBuffer, setInputBuffer] = useState('');
  const [history, setHistory] = useState<string[]>([
    '欢迎来到 AutoCAD 蓝图工坊！',
    '提示：输入快捷键后，轻拍【空格键】或【回车】执行命令。按 ESC 可随时取消。',
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addHistory = useCallback((line: string) => {
    setHistory((prev) => [...prev.slice(-4), line]);
  }, []);

  const handleSubmit = useCallback((overrideBuffer?: string) => {
    const cmdToTest = (overrideBuffer !== undefined ? overrideBuffer : inputBuffer).trim().toUpperCase();
    if (!cmdToTest) return;

    // 查找该快捷键对应的命令定义
    const matchedCmd = CAD_COMMANDS.find((c) => c.key === cmdToTest);

    // 关卡任务模式：检查是否为期望的命令
    if (expectedCommand) {
      const isCorrect = cmdToTest === expectedCommand.toUpperCase();
      if (isCorrect) {
        playCadCommandSuccess();
        const wordName = expectedName || matchedCmd?.name || cmdToTest;
        const meaning = expectedMeaning || matchedCmd?.chinese || '';
        speakCadCommand(wordName, meaning);
        addHistory(`命令: ${cmdToTest} -> 成功执行 ${wordName} (${meaning})！`);
        setInputBuffer('');
        onCommandSuccess(cmdToTest);
      } else {
        playCadError();
        addHistory(`命令: ${cmdToTest} -> *未知或非当前步骤命令。请按 ESC 撤销，或看提示输入 ${expectedCommand}*`);
        setInputBuffer('');
        if (onCommandFail) onCommandFail(cmdToTest);
      }
    } else {
      // 自由沙盒模式：只要属于已知 CAD 命令均可通过
      if (matchedCmd) {
        playCadCommandSuccess();
        speakCadCommand(matchedCmd.name, matchedCmd.chinese);
        addHistory(`命令: ${cmdToTest} -> 激活 [${matchedCmd.name}] (${matchedCmd.chinese})`);
        setInputBuffer('');
        onCommandSuccess(cmdToTest);
      } else {
        playCadError();
        addHistory(`命令: ${cmdToTest} -> *未知命令。按 ESC 重新输入*`);
        setInputBuffer('');
      }
    }
  }, [inputBuffer, expectedCommand, expectedName, expectedMeaning, onCommandSuccess, onCommandFail, addHistory]);

  // 自动聚焦输入框，保证真实键盘监听
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, expectedCommand]);

  // 全局键盘监听，确保无论鼠标点在哪里，按键都能敲进命令行
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      // 忽略功能键 (F1~F12, Alt, Ctrl, Meta 等)
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        playCadEscape();
        setInputBuffer('');
        addHistory('*已取消当前命令 (Cancel)*');
        return;
      }

      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        handleSubmit();
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        playCadKeyClick();
        setInputBuffer((prev) => prev.slice(0, -1));
        return;
      }

      // 普通字母与数字输入
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        e.preventDefault();
        playCadKeyClick();
        setInputBuffer((prev) => (prev + e.key.toUpperCase()).slice(0, 10));
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [disabled, addHistory, handleSubmit]);

  // 点击快捷按键辅助胶囊
  const handleQuickKeyClick = (keyStr: string) => {
    if (keyStr === 'SPACE') {
      handleSubmit();
    } else if (keyStr === 'ESC') {
      playCadEscape();
      setInputBuffer('');
      addHistory('*已取消当前命令*');
    } else {
      playCadKeyClick();
      setInputBuffer(keyStr);
    }
  };

  return (
    <div className="w-full bg-[#181C23] border-4 border-[#2E3744] rounded-xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] overflow-hidden font-mono select-none">
      {/* ── 历史日志视窗 ─────────────────────────────────────── */}
      <div className="p-3 bg-[#13161C] border-b border-[#2A323D] text-[12px] sm:text-[13px] text-gray-400 space-y-1 min-h-[70px] max-h-[90px] overflow-y-auto">
        {history.map((log, idx) => (
          <div
            key={idx}
            className={`${
              log.includes('成功执行') || log.includes('激活')
                ? 'text-cyan-300 font-bold'
                : log.includes('未知') || log.includes('已取消')
                ? 'text-amber-400'
                : 'text-gray-400'
            }`}
          >
            {log}
          </div>
        ))}
      </div>

      {/* ── 命令行输入交互行 ─────────────────────────────────── */}
      <div className="p-3 bg-[#1C212A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* 输入行左侧 */}
        <div className="flex items-center gap-2 flex-1 text-base sm:text-lg">
          <span className="text-gray-400 font-bold tracking-wider">命令:</span>
          <div className="relative flex items-center min-w-[120px] bg-[#111419] px-3 py-1.5 rounded border border-[#3A4556]">
            <span className="text-emerald-300 font-black tracking-widest text-lg sm:text-xl">
              {inputBuffer}
            </span>
            <span className="inline-block w-2.5 h-5 bg-emerald-400 ml-0.5 animate-pulse" />

            {/* 隐藏的真实 input 用于捕获手机软键盘焦点 */}
            <input
              ref={inputRef}
              type="text"
              className="absolute inset-0 opacity-0 cursor-default"
              value={inputBuffer}
              onChange={(e) => setInputBuffer(e.target.value.toUpperCase())}
              disabled={disabled}
            />
          </div>

          {/* 当有输入未敲空格时的醒目提示 */}
          {inputBuffer.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-yellow-300 bg-yellow-950/80 border border-yellow-600/80 px-2.5 py-1 rounded-lg animate-bounce">
              <span>👉 快拍</span>
              <button
                onClick={() => handleSubmit()}
                className="px-2 py-0.5 bg-yellow-400 text-black font-black rounded text-xs shadow hover:bg-yellow-300 active:scale-95"
              >
                【空格键 Space】
              </button>
              <span>生效！</span>
            </div>
          )}
        </div>

        {/* 核心控制键辅助按钮（适合触控屏或一年级大拇指引导） */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSubmit()}
            className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg border-2 border-emerald-400/80 shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center justify-center gap-1.5 text-xs sm:text-sm transition-all"
          >
            <span>␣</span>
            <span>拍空格执行 (Space)</span>
          </button>
          <button
            onClick={() => handleQuickKeyClick('ESC')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold rounded-lg border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 text-xs sm:text-sm"
          >
            ESC 取消
          </button>
        </div>
      </div>

      {/* ── 底部高频快捷键触控胶囊 (一年级触控与视觉辅助) ──────── */}
      <div className="px-3 py-2 bg-[#141820] border-t border-[#252D38] flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-gray-500 text-[11px] mr-1">快捷点选:</span>
        {(['REC', 'L', 'C', 'CO', 'TR', 'RO', 'O', 'PL', 'E'] as const).map((key) => {
          const isTarget = expectedCommand?.toUpperCase() === key;
          return (
            <button
              key={key}
              onClick={() => handleQuickKeyClick(key)}
              className={`px-2.5 py-1 rounded font-bold transition-all active:scale-90 ${
                isTarget
                  ? 'bg-yellow-400 text-black border border-yellow-200 font-black shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse'
                  : 'bg-[#222832] text-gray-300 hover:bg-[#2C3442] hover:text-white border border-[#343F4F]'
              }`}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
