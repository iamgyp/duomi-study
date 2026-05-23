import { getAllQuizSessions, QuizSubject } from './quiz-engine';

const STORAGE_KEY = 'duomi-difficulty-progression';

interface ProgressionData {
  recommendations: Record<string, number>;
}

function getStoredData(): ProgressionData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { recommendations: {} };
    return JSON.parse(data);
  } catch {
    return { recommendations: {} };
  }
}

function saveData(data: ProgressionData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function getRecommendedMax(subject: QuizSubject, defaultMax: number = 20): number {
  const stored = getStoredData();
  const key = `${subject}-max`;
  return stored.recommendations[key] ?? defaultMax;
}

export function updateDifficultyProgression(subject: QuizSubject) {
  const stored = getStoredData();
  const maxKey = `${subject}-max`;
  const currentMax = stored.recommendations[maxKey] ?? 20;

  // Get last 5 sessions for this subject
  const sessions = getAllQuizSessions()
    .filter(s => s.subject === subject)
    .slice(-5);

  if (sessions.length < 2) return;

  const avgAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length;
  const recentAccuracy = sessions.slice(-3).reduce((sum, s) => sum + s.accuracy, 0) / Math.min(sessions.length, 3);

  let newMax = currentMax;

  // Auto-adjust based on performance
  if (recentAccuracy >= 0.9) {
    // Excellent: increase max
    if (currentMax < 20) newMax = 20;
    else if (currentMax < 50) newMax = 50;
    else if (currentMax < 100) newMax = 100;
  } else if (recentAccuracy < 0.4) {
    // Struggling: decrease max
    if (currentMax > 50) newMax = 50;
    else if (currentMax > 20) newMax = 20;
    else if (currentMax > 10) newMax = 10;
  }

  if (newMax !== currentMax) {
    stored.recommendations[maxKey] = newMax;
    saveData(stored);
  }
}

export function getProgressionSummary(subject: QuizSubject): {
  currentMax: number;
  avgAccuracy: number;
  totalSessions: number;
  trend: 'up' | 'down' | 'stable';
} {
  const sessions = getAllQuizSessions().filter(s => s.subject === subject);
  const currentMax = getRecommendedMax(subject);

  if (sessions.length === 0) {
    return { currentMax, avgAccuracy: 0, totalSessions: 0, trend: 'stable' };
  }

  const avgAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length;

  // Calculate trend from last 3 sessions
  const recent = sessions.slice(-3);
  if (recent.length >= 2) {
    const firstHalf = recent.slice(0, Math.ceil(recent.length / 2)).reduce((s, sess) => s + sess.accuracy, 0) / Math.ceil(recent.length / 2);
    const secondHalf = recent.slice(Math.ceil(recent.length / 2)).reduce((s, sess) => s + sess.accuracy, 0) / Math.floor(recent.length / 2);
    const diff = secondHalf - firstHalf;
    return { currentMax, avgAccuracy, totalSessions: sessions.length, trend: diff > 0.1 ? 'up' : diff < -0.1 ? 'down' : 'stable' };
  }

  return { currentMax, avgAccuracy, totalSessions: sessions.length, trend: 'stable' };
}
