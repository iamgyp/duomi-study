'use client';

import { useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getWrongAnswers, SUBJECT_LABELS, SUBJECT_ROUTES, WrongAnswerGroup } from '@/lib/wrong-answers';

const ALL_SUBJECTS = ['all', 'math', 'algebra', 'chinese-poem', 'english'] as const;
type FilterSubject = typeof ALL_SUBJECTS[number];

export default function WrongAnswersPage() {
  const allGroups = getWrongAnswers();
  const totalWrong = allGroups.reduce((sum, g) => sum + g.items.length, 0);
  const [filter, setFilter] = useState<FilterSubject>('all');

  const filtered = filter === 'all' ? allGroups : allGroups.filter(g => g.subject === filter);
  const filteredCount = filtered.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      {/* Header */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <Link href="/" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">错题本</h1>
        <LanguageSwitcher />
      </div>

      {/* Stats bar */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="mc-card bg-[#E2E8F0] p-4 sm:p-6 text-center">
          <div className="text-4xl mb-2">📕</div>
          <div className="text-2xl font-bold text-[#333]">
            {totalWrong === 0 ? '太棒了，没有错题！' : `共 ${totalWrong} 道错题`}
          </div>
          {totalWrong > 0 && (
            <div className="text-sm text-gray-500 mt-1">
              当前筛选: {filter === 'all' ? '全部' : SUBJECT_LABELS[filter as keyof typeof SUBJECT_LABELS]} ({filteredCount} 道)
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      {totalWrong > 0 && (
        <div className="max-w-4xl mx-auto mb-6 flex flex-wrap gap-2">
          {ALL_SUBJECTS.map(s => {
            const count = s === 'all' ? totalWrong : allGroups.find(g => g.subject === s)?.items.length || 0;
            if (s !== 'all' && count === 0) return null;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 border-2 font-bold ${
                  filter === s
                    ? 'bg-[#F59E0B] text-white border-black'
                    : 'bg-white text-black border-black hover:bg-gray-100'
                }`}
              >
                {s === 'all' ? '全部' : SUBJECT_LABELS[s as keyof typeof SUBJECT_LABELS]} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Wrong answer groups */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filtered.length === 0 && totalWrong > 0 && (
          <div className="mc-card bg-[#E2E8F0] p-6 text-center text-gray-500">
            该学科没有错题
          </div>
        )}
        {totalWrong === 0 && (
          <div className="mc-card bg-[#E2E8F0] p-6 text-center text-gray-500">
            你还没有做过在线练习，或者所有练习都全对了！
          </div>
        )}
        {filtered.map((group) => (
          <div key={group.subject} className="mc-card bg-[#E2E8F0] p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#333]">
                {SUBJECT_LABELS[group.subject]} · {group.items.length} 道错题
              </h2>
              <Link
                href={SUBJECT_ROUTES[group.subject]}
                className="mc-btn bg-[#4CAF50] text-white flex items-center gap-2 py-2 px-4 text-sm"
              >
                <RefreshCw className="h-4 w-4" /> 重做
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              最近错误: {new Date(group.items[group.items.length - 1].timestamp).toLocaleDateString('zh-CN')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
