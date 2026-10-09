'use client';

import React, { useRef, useState } from 'react';
import { CadMission, CadDrawElement } from '@/lib/cad/cad-data';

interface CadCanvasProps {
  mission?: CadMission;
  currentStepIndex?: number;
  highlightNewStep?: boolean;
  sandboxElements?: CadDrawElement[];
  onCanvasClick?: (x: number, y: number) => void;
  activeCommandName?: string;
}

export function CadCanvas({
  mission,
  currentStepIndex = 1,
  highlightNewStep = false,
  sandboxElements,
  onCanvasClick,
  activeCommandName,
}: CadCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isInside, setIsInside] = useState(false);

  // 监听鼠标在画布上的移动，模拟 AutoCAD 经典十字准星
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => setIsInside(true);
  const handleMouseLeave = () => {
    setIsInside(false);
    setMousePos(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onCanvasClick) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 500);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 380);
    onCanvasClick(x, y);
  };

  // 渲染单个图元
  const renderElement = (
    el: CadDrawElement,
    key: string | number,
    status: 'completed' | 'active' | 'future' | 'sandbox',
  ) => {
    let stroke = '#00FFCC'; // AutoCAD 经典高亮青色
    let strokeWidth = 2.5;
    let strokeDasharray = 'none';
    let opacity = 1;
    let className = '';

    if (status === 'completed') {
      stroke = '#00E5FF'; // 完成项：高亮科技青
      strokeWidth = 2.5;
      opacity = 1;
    } else if (status === 'active') {
      stroke = '#FFD700'; // 当前待建项：高亮金黄色虚线提示
      strokeWidth = 2.5;
      strokeDasharray = '6 4';
      opacity = 0.95;
      className = 'animate-pulse';
    } else if (status === 'future') {
      stroke = '#4A5568'; // 未施工步骤：低调暗灰辅助草图线
      strokeWidth = 1.2;
      strokeDasharray = '4 4';
      opacity = 0.35;
    } else if (status === 'sandbox') {
      stroke = '#00FFCC';
      strokeWidth = 2.5;
      opacity = 1;
    }

    if (highlightNewStep && status === 'completed') {
      className += ' transition-all duration-300';
    }

    switch (el.type) {
      case 'line': {
        const { x1, y1, x2, y2 } = el.props as {
          x1: number;
          y1: number;
          x2: number;
          y2: number;
        };
        return (
          <line
            key={key}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            opacity={opacity}
            className={className}
          />
        );
      }
      case 'rect': {
        const { x, y, width, height, rx, transform } = el.props as {
          x: number;
          y: number;
          width: number;
          height: number;
          rx?: number;
          transform?: string;
        };
        return (
          <rect
            key={key}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={rx || 0}
            transform={transform}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinejoin="round"
            opacity={opacity}
            className={className}
          />
        );
      }
      case 'circle': {
        const { cx, cy, r } = el.props as { cx: number; cy: number; r: number };
        return (
          <circle
            key={key}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            opacity={opacity}
            className={className}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="relative w-full aspect-[500/380] max-h-[500px] bg-[#16191E] rounded-xl border-4 border-[#2D333B] shadow-[inset_0_0_30px_rgba(0,0,0,0.8),_0_8px_20px_rgba(0,0,0,0.5)] overflow-hidden cursor-crosshair select-none"
    >
      {/* ── AutoCAD 网格背景 (SVG Pattern) ──────────────────── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* 小网格 20px */}
          <pattern id="cadSmallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#222831" strokeWidth="0.8" />
          </pattern>
          {/* 大网格 100px */}
          <pattern id="cadMajorGrid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#cadSmallGrid)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#2E3744" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cadMajorGrid)" />
      </svg>

      {/* ── 顶部 CAD 工程状态浮条 ────────────────────────────── */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-gray-400 pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-black/60 px-2 py-0.5 rounded border border-gray-700/60 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-emerald-300 font-bold">AutoCAD 2026</span>
          <span className="text-gray-500">|</span>
          <span className="text-cyan-400">顶部视角 [2D 线框]</span>
          {activeCommandName && (
            <>
              <span className="text-gray-500">|</span>
              <span className="text-yellow-300 font-bold">当前命令: {activeCommandName}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 bg-black/60 px-2 py-0.5 rounded border border-gray-700/60 backdrop-blur-sm text-gray-300">
          <span>坐标系: WCS</span>
          <span className="text-gray-500">|</span>
          <span>网格: 启用 (F7)</span>
          <span className="text-gray-500">|</span>
          <span>比例: 1:1</span>
        </div>
      </div>

      {/* ── 左下角经典 UCS 坐标原点图标 (User Coordinate System) ── */}
      <div className="absolute bottom-3 left-3 pointer-events-none z-10 flex flex-col items-start opacity-75">
        <svg width="45" height="45" viewBox="0 0 45 45">
          {/* 原点小方框 */}
          <rect x="7" y="27" width="6" height="6" fill="none" stroke="#00E5FF" strokeWidth="1.5" />
          {/* X 轴 (红箭头) */}
          <line x1="10" y1="30" x2="38" y2="30" stroke="#FF5252" strokeWidth="2" />
          <polygon points="38,27 44,30 38,33" fill="#FF5252" />
          <text x="36" y="24" fill="#FF5252" fontSize="9" fontWeight="bold">X</text>
          {/* Y 轴 (绿箭头) */}
          <line x1="10" y1="30" x2="10" y2="8" stroke="#4CAF50" strokeWidth="2" />
          <polygon points="7,8 10,2 13,8" fill="#4CAF50" />
          <text x="14" y="10" fill="#4CAF50" fontSize="9" fontWeight="bold">Y</text>
        </svg>
      </div>

      {/* ── 主图形渲染层 (SVG ViewBox 500 x 380) ─────────────── */}
      <svg
        viewBox="0 0 500 380"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 蓝图关卡模式 */}
        {mission &&
          mission.steps.map((step) => {
            const isCompleted = step.stepIndex < currentStepIndex;
            const isActive = step.stepIndex === currentStepIndex;
            const status = isCompleted ? 'completed' : isActive ? 'active' : 'future';

            return step.elements.map((el, elIdx) =>
              renderElement(el, `${step.stepIndex}-${elIdx}`, status),
            );
          })}

        {/* 自由沙盒模式 */}
        {sandboxElements &&
          sandboxElements.map((el, idx) => renderElement(el, `sandbox-${idx}`, 'sandbox'))}
      </svg>

      {/* ── 拟真 AutoCAD 十字准星与拾取框光标 (Crosshair + Pickbox) ── */}
      {isInside && mousePos && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* 水平准星线 */}
          <div
            className="absolute bg-emerald-400/80 -translate-y-1/2"
            style={{ width: '4000px', height: '1px', left: '-2000px', top: '0' }}
          />
          {/* 垂直准星线 */}
          <div
            className="absolute bg-emerald-400/80 -translate-x-1/2"
            style={{ height: '4000px', width: '1px', top: '-2000px', left: '0' }}
          />
          {/* 中心方框拾取器 (Pickbox) */}
          <div className="w-3.5 h-3.5 border border-emerald-300 bg-transparent -translate-x-1/2 -translate-y-1/2" />

          {/* 实时动态坐标小气泡 */}
          <div className="absolute left-4 top-4 bg-black/80 text-[10px] text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-500/50 whitespace-nowrap shadow">
            X: {mousePos.x}, Y: {mousePos.y}
          </div>
        </div>
      )}
    </div>
  );
}
