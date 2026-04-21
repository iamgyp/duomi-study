import { AggregatedStats } from './stats-aggregator';

export type AchievementCategory = 'milestone' | 'perfect' | 'subject' | 'collection';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  check: (stats: AggregatedStats, unlockedCount?: number) => boolean;
  progressLabel: (stats: AggregatedStats, unlockedCount?: number) => string;
  progressValue: (stats: AggregatedStats, unlockedCount?: number) => number;
  progressMax: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // === Milestones ===
  {
    id: 'first-pickaxe',
    name: '第一镐',
    description: '完成第一次学习',
    icon: '⛏️',
    category: 'milestone',
    check: (stats) => stats.totalSessions >= 1 || stats.totalStudyRecords >= 1,
    progressLabel: (stats) => `${Math.max(stats.totalSessions, stats.totalStudyRecords) >= 1 ? 1 : 0}/1`,
    progressValue: (stats) => (stats.totalSessions >= 1 || stats.totalStudyRecords >= 1 ? 1 : 0),
    progressMax: 1,
  },
  {
    id: 'brick-heart',
    name: '砖石之心',
    description: '累计学习 10 次',
    icon: '🧱',
    category: 'milestone',
    check: (stats) => stats.totalSessions >= 10,
    progressLabel: (stats) => `${stats.totalSessions}/10`,
    progressValue: (stats) => Math.min(stats.totalSessions, 10),
    progressMax: 10,
  },
  {
    id: 'full-library',
    name: '满腹经纶',
    description: '累计学习 100 次',
    icon: '📚',
    category: 'milestone',
    check: (stats) => stats.totalSessions >= 100,
    progressLabel: (stats) => `${stats.totalSessions}/100`,
    progressValue: (stats) => Math.min(stats.totalSessions, 100),
    progressMax: 100,
  },
  {
    id: 'seven-day-warrior',
    name: '七天战士',
    description: '连续学习 7 天',
    icon: '⚔️',
    category: 'milestone',
    check: () => false, // handled specially in engine via calculateConsecutiveDays
    progressLabel: (stats) => `${stats.consecutiveDays}/7`,
    progressValue: (stats) => Math.min(stats.consecutiveDays, 7),
    progressMax: 7,
  },
  {
    id: 'time-lord',
    name: '时间领主',
    description: '累计学习时长 60 分钟',
    icon: '⏰',
    category: 'milestone',
    check: (stats) => stats.totalDurationSeconds >= 3600,
    progressLabel: (stats) => `${Math.floor(stats.totalDurationSeconds / 60)}/60 分钟`,
    progressValue: (stats) => Math.min(Math.floor(stats.totalDurationSeconds / 60), 60),
    progressMax: 60,
  },

  // === Perfect ===
  {
    id: 'first-perfect',
    name: '开门红',
    description: '第一次练习就全对',
    icon: '✨',
    category: 'perfect',
    check: (stats) => stats.perfectSessions >= 1 && stats.totalSessions >= 1,
    progressLabel: (stats) => stats.totalSessions >= 1 ? `${stats.perfectSessions} 次全对` : '先完成一次练习',
    progressValue: (stats) => (stats.totalSessions >= 1 ? Math.min(stats.perfectSessions, 1) : 0),
    progressMax: 1,
  },
  {
    id: 'triple-perfect',
    name: '三连胜',
    description: '连续 3 次练习全对',
    icon: '🏅',
    category: 'perfect',
    check: () => false, // handled specially in engine
    progressLabel: () => '0/3 连续全对',
    progressValue: () => 0,
    progressMax: 3,
  },
  {
    id: 'sharpshooter',
    name: '神射手',
    description: '累计做对 500 题',
    icon: '🎯',
    category: 'perfect',
    check: (stats) => stats.totalCorrect >= 500,
    progressLabel: (stats) => `${stats.totalCorrect}/500`,
    progressValue: (stats) => Math.min(stats.totalCorrect, 500),
    progressMax: 500,
  },

  // === Subject ===
  {
    id: 'math-apprentice',
    name: '数学学徒',
    description: '完成 5 次数学练习',
    icon: '🔢',
    category: 'subject',
    check: (stats) => stats.subjectStats.math.sessions >= 5,
    progressLabel: (stats) => `${stats.subjectStats.math.sessions}/5`,
    progressValue: (stats) => Math.min(stats.subjectStats.math.sessions, 5),
    progressMax: 5,
  },
  {
    id: 'chinese-writer',
    name: '书法达人',
    description: '完成 5 次语文练习',
    icon: '🖌️',
    category: 'subject',
    check: (stats) => stats.subjectStats['chinese-poem'].sessions >= 5,
    progressLabel: (stats) => `${stats.subjectStats['chinese-poem'].sessions}/5`,
    progressValue: (stats) => Math.min(stats.subjectStats['chinese-poem'].sessions, 5),
    progressMax: 5,
  },
  {
    id: 'english-master',
    name: '英语达人',
    description: '完成 5 次英语练习',
    icon: '🔤',
    category: 'subject',
    check: (stats) => stats.subjectStats.english.sessions >= 5,
    progressLabel: (stats) => `${stats.subjectStats.english.sessions}/5`,
    progressValue: (stats) => Math.min(stats.subjectStats.english.sessions, 5),
    progressMax: 5,
  },
  {
    id: 'all-rounder',
    name: '全能冠军',
    description: '完成所有学科各 10 次练习',
    icon: '🌟',
    category: 'subject',
    check: (stats) =>
      stats.subjectStats.math.sessions >= 10 &&
      stats.subjectStats.algebra.sessions >= 10 &&
      stats.subjectStats['chinese-poem'].sessions >= 10 &&
      stats.subjectStats.english.sessions >= 10,
    progressLabel: (stats) => {
      const subjects = ['math', 'algebra', 'chinese-poem', 'english'] as const;
      const counts = subjects.map(s => Math.min(stats.subjectStats[s].sessions, 10));
      return `${counts.join('/')}/10`;
    },
    progressValue: (stats) => {
      const subjects = ['math', 'algebra', 'chinese-poem', 'english'] as const;
      return subjects.reduce((sum, s) => sum + Math.min(stats.subjectStats[s].sessions, 10), 0);
    },
    progressMax: 40,
  },
  {
    id: 'algebra-merchant',
    name: '代数商人',
    description: '完成代数挑战 20 次',
    icon: '🛒',
    category: 'subject',
    check: (stats) => stats.subjectStats.algebra.sessions >= 20,
    progressLabel: (stats) => `${stats.subjectStats.algebra.sessions}/20`,
    progressValue: (stats) => Math.min(stats.subjectStats.algebra.sessions, 20),
    progressMax: 20,
  },

  // === Collection ===
  {
    id: 'collector-5',
    name: '初级收藏家',
    description: '解锁 5 个成就',
    icon: '🗺️',
    category: 'collection',
    check: (_stats, unlockedCount = 0) => unlockedCount >= 5,
    progressLabel: (_stats, unlockedCount = 0) => `${unlockedCount}/5`,
    progressValue: (_stats, unlockedCount = 0) => Math.min(unlockedCount, 5),
    progressMax: 5,
  },
  {
    id: 'collector-10',
    name: '资深收藏家',
    description: '解锁 10 个成就',
    icon: '🗺️',
    category: 'collection',
    check: (_stats, unlockedCount = 0) => unlockedCount >= 10,
    progressLabel: (_stats, unlockedCount = 0) => `${unlockedCount}/10`,
    progressValue: (_stats, unlockedCount = 0) => Math.min(unlockedCount, 10),
    progressMax: 10,
  },
];

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
