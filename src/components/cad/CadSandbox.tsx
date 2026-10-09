'use client';

import React, { useState } from 'react';
import { CadCanvas } from './CadCanvas';
import { CadCommandLine } from './CadCommandLine';
import { CadDrawElement } from '@/lib/cad/cad-data';
import { Trash2, RotateCcw, Info } from 'lucide-react';
import { playCadErase, playCadCommandSuccess } from '@/lib/cad/cad-sounds';

export function CadSandbox() {
  const [elements, setElements] = useState<CadDrawElement[]>([
    { type: 'rect', props: { x: 180, y: 130, width: 140, height: 120 } },
    { type: 'circle', props: { cx: 250, cy: 190, r: 40 } },
  ]);
  const [lastCmd, setLastCmd] = useState<string>('');

  const handleCommandSuccess = (cmd: string) => {
    const key = cmd.toUpperCase();
    setLastCmd(key);

    switch (key) {
      case 'L': {
        // 随机在画布中心区域画一条斜线
        const offset = Math.floor(Math.random() * 60) - 30;
        setElements((prev) => [
          ...prev,
          {
            type: 'line',
            props: {
              x1: 150 + offset,
              y1: 120 + offset,
              x2: 350 + offset,
              y2: 260 + offset,
            },
          },
        ]);
        break;
      }
      case 'C': {
        // 画一个随机大小的同心圆或偏移圆
        const r = Math.floor(Math.random() * 30) + 30;
        const cx = 250 + (Math.floor(Math.random() * 80) - 40);
        const cy = 190 + (Math.floor(Math.random() * 60) - 30);
        setElements((prev) => [
          ...prev,
          {
            type: 'circle',
            props: { cx, cy, r },
          },
        ]);
        break;
      }
      case 'REC': {
        // 画一个矩形
        const w = Math.floor(Math.random() * 80) + 80;
        const h = Math.floor(Math.random() * 60) + 60;
        const x = 250 - w / 2 + (Math.floor(Math.random() * 60) - 30);
        const y = 190 - h / 2 + (Math.floor(Math.random() * 40) - 20);
        setElements((prev) => [
          ...prev,
          {
            type: 'rect',
            props: { x, y, width: w, height: h },
          },
        ]);
        break;
      }
      case 'PL': {
        // 折线多段线
        setElements((prev) => [
          ...prev,
          { type: 'line', props: { x1: 120, y1: 280, x2: 200, y2: 240 } },
          { type: 'line', props: { x1: 200, y1: 240, x2: 280, y2: 300 } },
          { type: 'line', props: { x1: 280, y1: 300, x2: 380, y2: 220 } },
        ]);
        break;
      }
      case 'E': {
        // 橡皮擦：删除最后一个图元
        playCadErase();
        setElements((prev) => prev.slice(0, -1));
        break;
      }
      case 'CO': {
        // 复制：将最后一个图元向右下平移并复制
        if (elements.length > 0) {
          const lastEl = elements[elements.length - 1];
          const newProps = { ...lastEl.props };
          if ('x' in newProps && typeof newProps.x === 'number') newProps.x += 30;
          if ('y' in newProps && typeof newProps.y === 'number') newProps.y += 30;
          if ('cx' in newProps && typeof newProps.cx === 'number') newProps.cx += 30;
          if ('cy' in newProps && typeof newProps.cy === 'number') newProps.cy += 30;
          if ('x1' in newProps && typeof newProps.x1 === 'number') {
            newProps.x1 += 30;
            newProps.x2 = (newProps.x2 as number) + 30;
          }
          setElements((prev) => [...prev, { ...lastEl, props: newProps }]);
        }
        break;
      }
      case 'O': {
        // 偏移：向外扩一圈同心圆或大框
        setElements((prev) => [
          ...prev,
          { type: 'circle', props: { cx: 250, cy: 190, r: 85 } },
        ]);
        break;
      }
      case 'TR': {
        // 修剪：清除一部分杂线
        setElements((prev) => (prev.length > 1 ? prev.slice(1) : prev));
        break;
      }
      case 'RO': {
        // 旋转
        playCadCommandSuccess();
        break;
      }
      default:
        break;
    }
  };

  const handleClear = () => {
    playCadErase();
    setElements([]);
  };

  const handleReset = () => {
    setElements([
      { type: 'rect', props: { x: 180, y: 130, width: 140, height: 120 } },
      { type: 'circle', props: { cx: 250, cy: 190, r: 40 } },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* 顶部说明条 */}
      <div className="bg-[#1F242C] border-2 border-cyan-500/40 p-3 rounded-xl flex items-center justify-between text-xs sm:text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            自由演练台：支持随意输入 <code className="text-yellow-300 font-bold">L</code>, <code className="text-yellow-300 font-bold">C</code>, <code className="text-yellow-300 font-bold">REC</code>, <code className="text-yellow-300 font-bold">CO</code>, <code className="text-yellow-300 font-bold">E</code> + <b className="text-emerald-400">空格</b>，自由观察图纸变化！
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> 重置
          </button>
          <button
            onClick={handleClear}
            className="px-2.5 py-1 bg-red-900/60 hover:bg-red-800 rounded text-xs text-red-200 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> 清空
          </button>
        </div>
      </div>

      {/* CAD 拟真画布 */}
      <CadCanvas sandboxElements={elements} activeCommandName={lastCmd} />

      {/* 命令行 */}
      <CadCommandLine onCommandSuccess={handleCommandSuccess} />
    </div>
  );
}
