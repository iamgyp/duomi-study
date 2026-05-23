'use client';

import { useState } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import { MobileSidebar } from '@/components/MobileSidebar';

export default function SpeedChallengePage() {
  const { t, mounted } = useTranslation();
  const router = useRouter();
  const [timeLimit, setTimeLimit] = useState<30 | 60 | 120>(60);
  const [max, setMax] = useState(20);
  const [operation, setOperation] = useState<'add' | 'sub' | 'mul' | 'div' | 'mix'>('mix');

  const handleStart = () => {
    router.push(`/math/speed-challenge/quiz?timeLimit=${timeLimit}&max=${max}&operation=${operation}`);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#795548] flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const opLabel = operation === 'mix' ? '混合' : operation === 'add' ? '加法' : operation === 'sub' ? '减法' : operation === 'div' ? '除法' : '乘法';

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      {/* Header */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-7xl mx-auto">
        <Link href="/math" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> {t('Common.backToMath')}
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 bg-black/40 px-4 sm:px-6 py-2 rounded-sm border-2 border-white/20 backdrop-blur-sm">
          <div className="text-3xl sm:text-4xl">⚡</div>
          <h1 className="text-2xl sm:text-4xl text-white drop-shadow-md tracking-wider">口算速算挑战</h1>
        </div>
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile Language Switcher */}
      <div className="sm:hidden mb-4 flex justify-center">
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 max-w-7xl mx-auto">
        {/* Sidebar Settings */}
        <MobileSidebar title="挑战设置">
          <div className="space-y-6 font-sans">
            {/* Time Limit */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">时间限制</label>
              <div className="flex gap-2">
                {([30, 60, 120] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setTimeLimit(sec)}
                    className={`flex-1 border-2 border-black py-2 text-sm font-bold transition-all active:translate-y-1 ${
                      timeLimit === sec
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {sec}秒
                  </button>
                ))}
              </div>
            </div>

            {/* Max Value */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">最大数值</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((num) => (
                  <button
                    key={num}
                    onClick={() => setMax(num)}
                    className={`border-2 border-black py-2 text-sm font-bold transition-all active:translate-y-1 ${
                      max === num
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Operation Type */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">运算类型</label>
              <select
                className="w-full border-2 border-black bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono"
                value={operation}
                onChange={(e) => setOperation(e.target.value as 'add' | 'sub' | 'mul' | 'div' | 'mix')}
              >
                <option value="add">加法 (+)</option>
                <option value="sub">减法 (-)</option>
                <option value="mul">乘法 (×)</option>
                <option value="div">除法 (÷)</option>
                <option value="mix">混合 (+/−/×/÷)</option>
              </select>
            </div>

            <button
              onClick={handleStart}
              className="mc-btn w-full bg-[#9C27B0] text-white text-lg sm:text-xl hover:bg-[#7B1FA2] flex items-center justify-center gap-2 py-3"
            >
              <Zap className="h-5 w-5" /> 开始挑战
            </button>
          </div>
        </MobileSidebar>

        {/* Main Content: Preview / Info */}
        <div className="lg:col-span-3">
          <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 text-center">
            <div className="text-6xl mb-4">⚡</div>
            <h2 className="text-3xl font-bold text-[#333] mb-4">准备好了吗？</h2>
            <p className="text-gray-600 mb-6 text-lg">
              在限定时间内尽可能多地答题！
            </p>
            <div className="bg-white border-2 border-black p-4 mb-6 inline-block">
              <p className="text-xl font-bold text-[#333]">
                {timeLimit}秒 · 最大值{max} · {opLabel}
              </p>
            </div>
            <div className="text-gray-500 text-sm">
              输入答案后按 Enter 键确认，答对自动进入下一题。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
