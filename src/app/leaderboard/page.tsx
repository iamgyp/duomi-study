'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, Target, Hash } from 'lucide-react';
import Link from 'next/link';
import { getAllLeaderboards, LeaderboardEntry, clearLeaderboard } from '@/lib/leaderboard';
import { useTranslation } from '@/hooks/useTranslation';

const SUBJECT_EMOJIS: Record<string, string> = {
  math: '??',
  algebra: '??',
  'chinese-poem': '??',
  'chinese-speed': '?',
  english: '??',
  'english-speed': '??',
  'speed-challenge': '?',
};

function formatQpm(qpm: number): string {
  return qpm.toFixed(1);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ScoreRow({ entry, rank, t }: { entry: LeaderboardEntry; rank: number; t: (key: string) => string }) {
  const medal = rank === 0 ? '??' : rank === 1 ? '??' : rank === 2 ? '??' : `#${rank + 1}`;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-sm ${
      rank === 0 ? 'bg-yellow-50 border border-yellow-200' :
      rank === 1 ? 'bg-gray-50 border border-gray-200' :
      rank === 2 ? 'bg-orange-50 border border-orange-200' :
      'bg-white border border-gray-100'
    }`}>
      <span className="text-xl w-10 text-center">{medal}</span>
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-1">
          <Target className="h-4 w-4 text-green-600" />
          <span className="text-sm font-bold text-green-700">{(entry.score * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-600">{entry.duration}s</span>
        </div>
        <div className="flex items-center gap-1">
          <Hash className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-gray-600">{entry.totalQuestions}</span>
        </div>
        <div className="ml-auto text-sm font-bold text-yellow-700">
          {formatQpm(entry.questionsPerMinute)} {t('Leaderboard.qpm')}
        </div>
      </div>
      <span className="text-xs text-gray-400">{formatDate(entry.date)}</span>
    </div>
  );
}

export default function LeaderboardPage() {
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
    setLeaderboards(getAllLeaderboards());
  }, []);

  const handleClear = (subject: string) => {
    if (confirm(`??????????????`)) {
      clearLeaderboard(subject);
      setLeaderboards(getAllLeaderboards());
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#795548] flex items-center justify-center text-white text-2xl">Loading...</div>;
  }

  const activeSubjects = Object.entries(leaderboards)
    .filter(([, entries]) => entries.length > 0)
    .sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <Link href="/" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> {t('Leaderboard.back')}
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">?? {t('Leaderboard.title')}</h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {activeSubjects.length === 0 ? (
          <div className="mc-card bg-white p-12 text-center">
            <div className="text-6xl mb-4">??</div>
            <p className="text-gray-500 text-lg">{t('Leaderboard.noEntries')}</p>
            <p className="text-gray-400 text-sm mt-2">{t('Leaderboard.noEntriesHint')}</p>
          </div>
        ) : (
          activeSubjects.map(([subject, entries]) => (
            <div key={subject} className="mc-card bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#333]">
                  {SUBJECT_EMOJIS[subject] || '??'} {subject}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{entries.length} ???</span>
                  <button
                    onClick={() => handleClear(subject)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    ??
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {entries.map((entry, i) => (
                  <ScoreRow key={i} entry={entry} rank={i} t={t} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
