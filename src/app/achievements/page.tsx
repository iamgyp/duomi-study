'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AchievementCard } from '@/components/AchievementCard';
import { ACHIEVEMENTS, AchievementCategory, getAchievementsByCategory } from '@/lib/achievement-registry';
import { getUnlockedAchievements } from '@/lib/achievement-engine';
import { getStats, AggregatedStats } from '@/lib/stats-aggregator';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const categoryLabels: Record<AchievementCategory, string> = {
  milestone: '学习里程碑',
  perfect: '全对成就',
  subject: '学科专精',
  collection: '收集图鉴',
};

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState<AchievementCategory | 'all'>('all');
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [unlockedMap, setUnlockedMap] = useState<Record<string, { achievementId: string; unlockedAt: string }>>({});

  useEffect(() => {
    setStats(getStats());
    const unlocked = getUnlockedAchievements();
    const ids = new Set(unlocked.map(u => u.achievementId));
    setUnlockedAchievements(ids);
    const map: Record<string, { achievementId: string; unlockedAt: string }> = {};
    unlocked.forEach(u => { map[u.achievementId] = { achievementId: u.achievementId, unlockedAt: u.unlockedAt }; });
    setUnlockedMap(map);
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#795548] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = unlockedAchievements.size;
  const percentage = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;

  const filteredAchievements = activeTab === 'all'
    ? ACHIEVEMENTS
    : getAchievementsByCategory(activeTab);

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      {/* Header */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-7xl mx-auto">
        <Link href="/" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回首页
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 bg-black/40 px-4 sm:px-6 py-2 rounded-sm border-2 border-white/20 backdrop-blur-sm">
          <div className="text-3xl sm:text-4xl">🏆</div>
          <h1 className="text-2xl sm:text-4xl text-white drop-shadow-md tracking-wider">成就殿堂</h1>
        </div>
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="sm:hidden mb-4 flex justify-center">
        <LanguageSwitcher />
      </div>

      {/* Overall Progress */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="mc-card bg-[#E2E8F0] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#333]">总进度</h2>
            <span className="text-lg sm:text-xl font-bold text-[#4CAF50]">{unlockedCount} / {totalAchievements}</span>
          </div>
          <div className="w-full bg-gray-300 rounded-sm h-6 overflow-hidden border-2 border-black">
            <div
              className="h-full bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-1">{percentage}% 已解锁</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-center gap-2 sm:gap-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-bold border-4 transition-all active:translate-y-1 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'all'
              ? 'bg-[#FFD700] text-black border-black shadow-lg'
              : 'bg-[#C6C6C6] text-gray-700 border-gray-400 hover:bg-gray-200'
          }`}
        >
          🏆 全部
        </button>
        {(['milestone', 'perfect', 'subject', 'collection'] as AchievementCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-bold border-4 transition-all active:translate-y-1 whitespace-nowrap flex-shrink-0 ${
              activeTab === cat
                ? 'bg-[#FFD700] text-black border-black shadow-lg'
                : 'bg-[#C6C6C6] text-gray-700 border-gray-400 hover:bg-gray-200'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {filteredAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isUnlocked={unlockedAchievements.has(achievement.id)}
            unlockData={unlockedMap[achievement.id]}
            stats={stats}
            unlockedCount={unlockedCount}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-white/80 font-bold text-xs sm:text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
        成就殿堂 — 记录每一份努力
      </div>
    </div>
  );
}
