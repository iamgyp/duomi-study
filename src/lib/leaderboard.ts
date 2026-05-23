/**
 * Local leaderboard system - tracks high scores per subject in localStorage
 */

export type LeaderboardEntry = {
  score: number;       // accuracy 0-1
  totalQuestions: number;
  duration: number;    // seconds
  questionsPerMinute: number;
  date: string;        // ISO timestamp
};

export type Leaderboard = Record<string, LeaderboardEntry[]>;

const STORAGE_KEY = 'duomi-leaderboard';
const MAX_ENTRIES_PER_SUBJECT = 10;

function load(): Leaderboard {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(board: Leaderboard) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}

export function addScore(subject: string, entry: LeaderboardEntry): void {
  const board = load();
  if (!board[subject]) board[subject] = [];
  board[subject].push(entry);
  // Sort by questionsPerMinute descending, keep top entries
  board[subject].sort((a, b) => b.questionsPerMinute - a.questionsPerMinute);
  board[subject] = board[subject].slice(0, MAX_ENTRIES_PER_SUBJECT);
  save(board);
}

export function getLeaderboard(subject: string): LeaderboardEntry[] {
  return load()[subject] || [];
}

export function getAllLeaderboards(): Leaderboard {
  return load();
}

export function getTopScore(subject: string): LeaderboardEntry | null {
  const entries = getLeaderboard(subject);
  return entries.length > 0 ? entries[0] : null;
}

export function clearLeaderboard(subject?: string): void {
  if (subject) {
    const board = load();
    delete board[subject];
    save(board);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}
