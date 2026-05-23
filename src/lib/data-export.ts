import { getAllQuizSessions, QuizSubject } from './quiz-engine';
import { getAllRecords } from './study-storage';
import { getStats, rebuildStats } from './stats-aggregator';

export type ExportFormat = 'json' | 'csv';

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAsJson() {
  const data = {
    stats: getStats(),
    quizSessions: getAllQuizSessions().sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    studyRecords: getAllRecords().sort((a, b) => a.completedAt.localeCompare(b.completedAt)),
    exportDate: new Date().toISOString(),
  };
  downloadFile(JSON.stringify(data, null, 2), `duomi-study-${new Date().toISOString().slice(0, 10)}.json`);
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportAsCsv() {
  const sessions = getAllQuizSessions().sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const records = getAllRecords().sort((a, b) => a.completedAt.localeCompare(b.completedAt));

  // Quiz sessions CSV
  const quizHeaders = ['date', 'subject', 'totalQuestions', 'correctCount', 'accuracy', 'duration(s)'];
  const quizRows = sessions.map((s) =>
    [
      new Date(s.timestamp).toLocaleDateString(),
      s.subject,
      s.totalQuestions,
      s.correctCount,
      (s.accuracy * 100).toFixed(1) + '%',
      s.duration,
    ].map(String).map(escapeCsvField).join(',')
  );
  const quizCsv = [quizHeaders.join(','), ...quizRows].join('\n');

  // Study records CSV
  const recordHeaders = ['date', 'subject', 'contentType', 'contentTitle', 'duration(min)'];
  const recordRows = records.map((r) =>
    [
      new Date(r.completedAt).toLocaleDateString(),
      r.subject,
      r.contentType,
      r.contentTitle,
      r.duration,
    ].map(String).map(escapeCsvField).join(',')
  );
  const recordCsv = [recordHeaders.join(','), ...recordRows].join('\n');

  // Combined CSV
  const combined = `=== 测验记录 ===\n${quizCsv}\n\n=== 学习记录 ===\n${recordCsv}`;
  downloadFile(combined, `duomi-study-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportData(format: ExportFormat) {
  if (format === 'json') {
    exportAsJson();
  } else {
    exportAsCsv();
  }
}
