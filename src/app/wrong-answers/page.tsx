'use client';

import { useState, useMemo } from 'react';
import { ArrowLeft, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import { getWrongAnswers, SUBJECT_LABELS, SUBJECT_ROUTES, WrongAnswerGroup, WrongAnswerItem } from '@/lib/wrong-answers';

const ALL_SUBJECTS = ['all', 'math', 'algebra', 'chinese-poem', 'english'] as const;
type FilterSubject = typeof ALL_SUBJECTS[number];

function getSubjectLabel(subject: keyof typeof SUBJECT_LABELS, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    'math': t('StudyRecordButton.math'),
    'algebra': t('StudyRecordButton.algebra'),
    'chinese-poem': t('StudyRecordButton.chinese'),
    'english': t('StudyRecordButton.english'),
    'chinese-speed': t('StudyRecordButton.chinese'),
    'english-speed': t('StudyRecordButton.english'),
    'speed-challenge': t('StudyRecordButton.math'),
  };
  return labels[subject] || subject;
}

function WrongAnswerCard({ item, index }: { item: WrongAnswerItem; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sm font-bold text-gray-400 w-8">#{index + 1}</span>
          <span className="text-sm font-bold text-gray-600">
            {item.questionText || item.questionId}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-red-500 font-bold">你的答案: {item.userAnswer || '无'}</span>
          <span className="text-xs text-green-600 font-bold">正确答案: {item.correctAnswer}</span>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>
      {expanded && item.options && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            {item.options.map((opt, i) => (
              <div
                key={i}
                className={`p-2 rounded-sm text-sm font-bold ${
                  i === item.correctIndex
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : opt === item.userAnswer
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WrongAnswersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const allGroups = getWrongAnswers();
  const totalWrong = allGroups.reduce((sum, g) => sum + g.items.length, 0);
  const [filter, setFilter] = useState<FilterSubject>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return allGroups;
    return allGroups.filter(g => g.subject === filter);
  }, [allGroups, filter]);

  const filteredCount = filtered.reduce((sum, g) => sum + g.items.length, 0);

  const handleRedo = (subject: keyof typeof SUBJECT_ROUTES) => {
    router.push(SUBJECT_ROUTES[subject]);
  };

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      {/* Header */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <Link href="/" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> {t('WrongAnswers.back')}
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">{t('WrongAnswers.title')}</h1>
        <LanguageSwitcher />
      </div>

      {/* Stats bar */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="mc-card bg-[#E2E8F0] p-4 sm:p-6 text-center">
          <div className="text-4xl mb-2">📕</div>
          <div className="text-2xl font-bold text-[#333]">
            {totalWrong === 0 ? t('WrongAnswers.noWrong') : t('WrongAnswers.totalWrong', { count: totalWrong })}
          </div>
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
                {s === 'all' ? t('WrongAnswers.filterAll') : getSubjectLabel(s as keyof typeof SUBJECT_LABELS, t)} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Wrong answer list */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filtered.length === 0 && totalWrong > 0 && (
          <div className="mc-card bg-[#E2E8F0] p-6 text-center text-gray-500">
            {t('WrongAnswers.filterEmpty')}
          </div>
        )}
        {totalWrong === 0 && (
          <div className="mc-card bg-[#E2E8F0] p-6 text-center text-gray-500">
            {t('WrongAnswers.noPractice')}
          </div>
        )}
        {filtered.map((group) => (
          <div key={group.subject} className="mc-card bg-[#E2E8F0] p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#333]">
                {getSubjectLabel(group.subject as keyof typeof SUBJECT_LABELS, t)} · {group.items.length} 道错题
              </h2>
              <button
                onClick={() => handleRedo(group.subject as keyof typeof SUBJECT_ROUTES)}
                className="mc-btn bg-[#4CAF50] text-white flex items-center gap-2 py-2 px-4 text-sm"
              >
                <RefreshCw className="h-4 w-4" /> {t('WrongAnswers.redo')}
              </button>
            </div>
            <div className="space-y-2">
              {group.items.map((item, i) => (
                <WrongAnswerCard key={`${item.sessionId}-${item.questionId}-${i}`} item={item} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
