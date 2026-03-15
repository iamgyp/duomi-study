'use client';

import { ArrowLeft, History } from 'lucide-react';
import Link from 'next/link';
import { StudyStats } from '@/components/StudyStats';
import { StudyRecordList } from '@/components/StudyRecordList';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';

export default function HistoryPage() {
  const { t, mounted } = useTranslation();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#795548] flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      
      {/* Header */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-7xl mx-auto">
        <Link href="/" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" />
          {t('Common.backToHome')}
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4 bg-black/40 px-4 sm:px-6 py-2 rounded-sm border-2 border-white/20 backdrop-blur-sm">
           <div className="text-3xl sm:text-4xl">📊</div>
           <h1 className="text-2xl sm:text-4xl text-white drop-shadow-md tracking-wider">学习记录</h1>
        </div>
        
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile Language Switcher */}
      <div className="sm:hidden mb-4 flex justify-center">
        <LanguageSwitcher />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 统计区域 */}
        <section>
          <h2 className="text-xl sm:text-2xl text-white font-bold mb-4 flex items-center gap-2">
            <History className="h-6 w-6" />
            学习统计
          </h2>
          <StudyStats />
        </section>

        {/* 记录列表区域 */}
        <section>
          <h2 className="text-xl sm:text-2xl text-white font-bold mb-4">学习历史</h2>
          <StudyRecordList />
        </section>
      </div>

      {/* Footer Decoration */}
      <div className="mt-12 text-center text-white/80 font-bold text-xs sm:text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
        记录每一步成长，见证每一次进步 🌟
      </div>
    </div>
  );
}
