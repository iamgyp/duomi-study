'use client';

import { useEffect, useState } from 'react';
import { Clock, Calendar, Flame, BookOpen } from 'lucide-react';
import { StudyStats as StudyStatsType, Subject } from '@/types/study-record';
import { getStudyStats, formatDuration } from '@/lib/study-storage';

export function StudyStats() {
  const [stats, setStats] = useState<StudyStatsType | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(getStudyStats());
  }, []);

  if (!mounted || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="mc-card bg-[#C6C6C6] p-4 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: Clock,
      label: '总学习时长',
      value: formatDuration(stats.totalDuration),
      color: 'bg-[#3B82F6]',
    },
    {
      icon: Calendar,
      label: '今日学习',
      value: formatDuration(stats.todayDuration),
      color: 'bg-[#10B981]',
    },
    {
      icon: Flame,
      label: '连续学习',
      value: `${stats.consecutiveDays}天`,
      color: 'bg-[#F59E0B]',
    },
    {
      icon: BookOpen,
      label: '学习记录',
      value: `${stats.totalRecords}条`,
      color: 'bg-[#8B5CF6]',
    },
  ];

  // 学科分布数据
  const subjectData: { subject: Subject; label: string; color: string }[] = [
    { subject: 'chinese', label: '语文', color: '#F59E0B' },
    { subject: 'math', label: '数学', color: '#EF4444' },
    { subject: 'english', label: '英语', color: '#3B82F6' },
    { subject: 'algebra', label: '代数', color: '#8B5CF6' },
  ];

  const maxDuration = Math.max(...Object.values(stats.subjectDistribution), 1);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="mc-card bg-white p-3 sm:p-4 flex items-center gap-3"
          >
            <div className={`${card.color} p-2 sm:p-3 rounded-lg`}>
              <card.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">{card.label}</p>
              <p className="text-lg sm:text-xl font-bold text-[#333]">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 学科分布图表 */}
      <div className="mc-card bg-white p-4 sm:p-6">
        <h3 className="text-lg font-bold text-[#333] mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          学科分布
        </h3>
        
        <div className="space-y-3">
          {subjectData.map(({ subject, label, color }) => {
            const duration = stats.subjectDistribution[subject];
            const percentage = maxDuration > 0 ? (duration / maxDuration) * 100 : 0;
            
            return (
              <div key={subject} className="flex items-center gap-3">
                <span className="w-12 text-sm font-medium text-gray-600">{label}</span>
                <div className="flex-1 h-6 bg-gray-200 rounded-sm overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                      minWidth: duration > 0 ? '4px' : '0',
                    }}
                  />
                </div>
                <span className="w-20 text-right text-sm text-gray-600">
                  {formatDuration(duration)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
