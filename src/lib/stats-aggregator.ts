import { getAllRecords, calculateConsecutiveDays } from './study-storage';
import { getAllQuizSessions, QuizSubject } from './quiz-engine';

export interface SubjectStats {
  sessions: number;
  correct: number;
  total: number;
  accuracy: number;
  durationSeconds: number;
}

export interface AggregatedStats {
  totalSessions: number;
  totalCorrect: number;
  totalQuestions: number;
  overallAccuracy: number;
  totalDurationSeconds: number;
  subjectStats: Record<QuizSubject, SubjectStats>;
  perfectSessions: number;
  currentStreak: number;
  firstSessionDate: string | null;
  totalStudyRecords: number;
  consecutiveDays: number;
}

const DEFAULT_SUBJECT_STATS: SubjectStats = {
  sessions: 0,
  correct: 0,
  total: 0,
  accuracy: 0,
  durationSeconds: 0,
};

let cache: AggregatedStats | null = null;

export function rebuildStats(): AggregatedStats {
  const quizSessions = getAllQuizSessions();
  const studyRecords = getAllRecords();

  const subjectStats: Record<QuizSubject, SubjectStats> = {
    math: { ...DEFAULT_SUBJECT_STATS },
    algebra: { ...DEFAULT_SUBJECT_STATS },
    'chinese-poem': { ...DEFAULT_SUBJECT_STATS },
    english: { ...DEFAULT_SUBJECT_STATS },
  };

  let totalCorrect = 0;
  let totalQuestions = 0;
  let totalDurationSeconds = 0;
  let perfectSessions = 0;
  let firstSessionDate: string | null = null;

  for (const session of quizSessions) {
    totalCorrect += session.correctCount;
    totalQuestions += session.totalQuestions;
    totalDurationSeconds += session.duration;

    const subj = session.subject;
    if (subjectStats[subj]) {
      subjectStats[subj].sessions += 1;
      subjectStats[subj].correct += session.correctCount;
      subjectStats[subj].total += session.totalQuestions;
      subjectStats[subj].durationSeconds += session.duration;
      subjectStats[subj].accuracy = subjectStats[subj].total > 0
        ? subjectStats[subj].correct / subjectStats[subj].total
        : 0;
    }

    if (session.accuracy === 1 && session.totalQuestions > 0) {
      perfectSessions += 1;
    }

    if (!firstSessionDate || session.timestamp < firstSessionDate) {
      firstSessionDate = session.timestamp;
    }
  }

  const overallAccuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;

  const sortedSessions = [...quizSessions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  let currentStreak = 0;
  for (const session of sortedSessions) {
    if (session.accuracy > 0.5) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  const totalStudyDuration = studyRecords.reduce((sum, r) => sum + r.duration, 0) * 60 + totalDurationSeconds;

  const consecutiveDays = calculateConsecutiveDays();

  cache = {
    totalSessions: quizSessions.length,
    totalCorrect,
    totalQuestions,
    overallAccuracy,
    totalDurationSeconds: totalStudyDuration,
    subjectStats,
    perfectSessions,
    currentStreak,
    firstSessionDate,
    totalStudyRecords: studyRecords.length,
    consecutiveDays,
  };
  return cache;
}

export function getStats(): AggregatedStats {
  if (!cache) {
    return rebuildStats();
  }
  return cache;
}

export function invalidateCache(): void {
  cache = null;
}
