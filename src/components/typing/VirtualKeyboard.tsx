'use client';

import React from 'react';
import {
  KEYBOARD_ROWS,
  FINGER_COLORS,
  getKeyDef,
  getFingerForKey,
  type Finger,
} from '@/lib/typing/keyboard-layout';

export interface VirtualKeyboardProps {
  /** The key currently required by the game (lowercase) */
  activeKey: string | null;
  /** The key currently physically pressed down (lowercase) */
  pressedKey?: string | null;
  /** The last wrong key entered (lowercase), triggers error flash */
  lastWrongKey?: string | null;
  /** Optional click handler (for mouse click / testing) */
  onKeyClick?: (key: string) => void;
  /** Whether to show finger legend below the keyboard (default: true) */
  showLegend?: boolean;
  /** Whether to hide current target key in the top banner (e.g. math mode, let player calculate without spoiling answer key) */
  hideTargetKey?: boolean;
  className?: string;
}

const FINGER_LABELS: Record<Finger, { hand: string; finger: string; color: string }> = {
  L5: { hand: '左手', finger: '小指', color: FINGER_COLORS.L5 },
  L4: { hand: '左手', finger: '无名指', color: FINGER_COLORS.L4 },
  L3: { hand: '左手', finger: '中指', color: FINGER_COLORS.L3 },
  L2: { hand: '左手', finger: '食指', color: FINGER_COLORS.L2 },
  R2: { hand: '右手', finger: '食指', color: FINGER_COLORS.R2 },
  R3: { hand: '右手', finger: '中指', color: FINGER_COLORS.R3 },
  R4: { hand: '右手', finger: '无名指', color: FINGER_COLORS.R4 },
  R5: { hand: '右手', finger: '小指', color: FINGER_COLORS.R5 },
  T:  { hand: '双手', finger: '大拇指', color: FINGER_COLORS.T },
};

export function VirtualKeyboard({
  activeKey,
  pressedKey,
  lastWrongKey,
  onKeyClick,
  showLegend = true,
  hideTargetKey = false,
  className = '',
}: VirtualKeyboardProps) {
  const normalizedActive = activeKey ? activeKey.toLowerCase() : null;
  const activeDef = normalizedActive ? getKeyDef(normalizedActive) : undefined;
  const activeFinger = normalizedActive ? getFingerForKey(normalizedActive) : undefined;
  const fingerInfo = activeFinger ? FINGER_LABELS[activeFinger] : undefined;

  return (
    <div className={`w-full max-w-4xl mx-auto select-none ${className}`}>
      {/* ── 指法与目标键指示条 ────────────────────────────── */}
      <div className="mb-3 px-4 py-2.5 bg-gray-900/90 border-2 border-black rounded-lg text-white flex flex-wrap items-center justify-between gap-3 shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">🎯 当前目标</span>
          {hideTargetKey ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center px-3 h-10 bg-rose-950/80 text-rose-300 text-sm font-bold rounded border border-rose-500/80">
                🧮 观察怪物算式 · 心算后按键盘数字
              </span>
            </div>
          ) : normalizedActive ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-yellow-400 text-black text-2xl font-black rounded border-2 border-yellow-200 shadow-lg animate-pulse">
                {normalizedActive === ' ' ? '␣' : normalizedActive.toUpperCase()}
              </span>
              {fingerInfo && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-md border border-gray-700">
                  <span
                    className="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
                    style={{ backgroundColor: fingerInfo.color }}
                  />
                  <span className="font-bold text-sm text-yellow-300">
                    {fingerInfo.hand}{fingerInfo.finger}
                  </span>
                </div>
              )}
              {activeDef?.bump && (
                <span className="text-xs bg-amber-900/80 text-amber-200 px-2 py-0.5 rounded border border-amber-500 font-medium">
                  📍 基准定位键 (有小凸起)
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400 font-mono">等待怪物出现...</span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-300 font-mono">
          <span className="inline-block px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-yellow-300">
            Esc
          </span>
          <span>暂停</span>
          <span className="inline-block px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-yellow-300 ml-2">
            R
          </span>
          <span>重玩</span>
        </div>
      </div>

      {/* ── 虚拟键盘主体 ──────────────────────────────────── */}
      <div className="p-3 bg-[#2D3238] border-4 border-black rounded-xl shadow-[6px_6px_0_rgba(0,0,0,0.6)]">
        <div className="flex flex-col gap-1.5">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="flex justify-center gap-1 sm:gap-1.5"
            >
              {row.map((kDef) => {
                const keyChar = kDef.key.toLowerCase();
                const isActive = normalizedActive === keyChar;
                const isPressed = pressedKey?.toLowerCase() === keyChar;
                const isWrong = lastWrongKey?.toLowerCase() === keyChar;
                const fingerColor = FINGER_COLORS[kDef.finger];

                // 宽度计算
                const widthStyle = kDef.width
                  ? { flexGrow: kDef.width, flexBasis: `${kDef.width * 2.8}rem`, maxWidth: `${kDef.width * 3.6}rem` }
                  : { width: '2.5rem', flexGrow: 1, maxWidth: '3.4rem' };

                return (
                  <button
                    key={kDef.key}
                    type="button"
                    tabIndex={-1}
                    onClick={() => onKeyClick?.(kDef.key)}
                    style={{
                      ...widthStyle,
                      borderBottomColor: isActive ? '#FACC15' : fingerColor,
                      borderBottomWidth: '4px',
                    }}
                    className={`
                      relative h-11 sm:h-13 rounded flex flex-col items-center justify-center font-bold font-mono transition-all duration-75 select-none
                      border-2 border-black
                      ${isActive
                        ? 'bg-yellow-300 text-black scale-105 z-20 shadow-[0_0_12px_rgba(250,204,21,0.85)] ring-2 ring-yellow-400'
                        : isPressed
                        ? 'bg-emerald-400 text-black translate-y-0.5 shadow-inner'
                        : isWrong
                        ? 'bg-red-500 text-white animate-shake'
                        : 'bg-[#4B5563] text-gray-100 hover:bg-[#5A6574] active:bg-[#3B424D]'
                      }
                    `}
                  >
                    {/* 键帽文字 */}
                    <span className={`text-xs sm:text-sm ${isActive ? 'font-black scale-110' : ''}`}>
                      {kDef.label}
                    </span>

                    {/* F / J 基准键小凸点 */}
                    {kDef.bump && (
                      <span className="w-2 h-0.5 bg-yellow-300 rounded-full mt-0.5" />
                    )}

                    {/* 手指颜色小色块指示 */}
                    <span
                      className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full opacity-80"
                      style={{ backgroundColor: fingerColor }}
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── 手指分工图例 ──────────────────────────────────── */}
      {showLegend && (
        <div className="mt-3 p-3 bg-gray-900/80 border-2 border-black rounded-lg text-white">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">
            🖐️ 手指按键分工对照表
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* 左手 */}
            <div className="bg-gray-800/90 p-2 rounded border border-gray-700">
              <div className="text-gray-300 font-bold mb-1.5 flex items-center gap-1">
                <span>🤚 左手</span>
                <span className="text-[10px] text-gray-400">(A S D F G)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['L5', 'L4', 'L3', 'L2'] as Finger[]).map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px]"
                    style={{ backgroundColor: `${FINGER_COLORS[f]}25`, color: FINGER_COLORS[f] }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: FINGER_COLORS[f] }} />
                    {FINGER_LABELS[f].finger}
                  </span>
                ))}
              </div>
            </div>

            {/* 右手 */}
            <div className="bg-gray-800/90 p-2 rounded border border-gray-700">
              <div className="text-gray-300 font-bold mb-1.5 flex items-center gap-1">
                <span>✋ 右手</span>
                <span className="text-[10px] text-gray-400">(H J K L ;)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['R2', 'R3', 'R4', 'R5'] as Finger[]).map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px]"
                    style={{ backgroundColor: `${FINGER_COLORS[f]}25`, color: FINGER_COLORS[f] }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: FINGER_COLORS[f] }} />
                    {FINGER_LABELS[f].finger}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
