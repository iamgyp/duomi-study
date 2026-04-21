# 在线做题 + 成就系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add online quiz functionality (math, algebra, chinese, english) with auto-grading, result pages, and an achievement system with milestone tracking.

**Architecture:** Pure-logic achievement engine + stats aggregator + shared quiz hook, each subject gets its own quiz page, achievements display on a dedicated /achievements page with Minecraft styling.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, localStorage for persistence

---

### Task 1: Quiz Engine Library

**Files:**
- Create: `src/lib/quiz-engine.ts`

- [ ] **Step 1: Write the quiz engine library**

Create `src/lib/quiz-engine.ts` with question generation (including distractor generation for multiple choice), answer checking, and quiz session types:

```typescript
import { generateMathQuestions, MathConfig, MathQuestion } from './math-generator';
import { generateAlgebraQuestions, AlgebraConfig, AlgebraQuestion, McItem } from './algebra-generator';
import { generatePoemExercises, PoemConfig } from './poem-generator';
import { POEMS, Poem } from './poem-data';

// ========== Types ==========

export type QuizSubject = 'math' | 'algebra' | 'chinese-poem' | 'english';

export interface MathQuizQuestion {
  id: string;
  questionText: string;  // e.g. "25 + 37 = ?"
  options: string[];     // 4 options, first is correct before shuffle
  correctIndex: number;  // index in shuffled options
  num1: number;
  num2: number;
  operator: string;
}

export interface AlgebraQuizQuestion {
  id: string;
  questionText: string;  // e.g. "🍎×3 + 🛡️×2 = ?"
  options: string[];     // 4 options with currency suffix
  correctIndex: number;
  items: { item: McItem; quantity: number }[];
  total: number;
}

export interface ChineseQuizBlank {
  lineIndex: number;
  charIndex: number;
  correctAnswer: string;
  hint: string;  // pinyin hint
}

export interface ChineseQuizQuestion {
  id: string;
  poem: Poem;
  blanks: ChineseQuizBlank[];
}

export interface EnglishQuizQuestion {
  id: string;
  word: string;
  hint: string;  // e.g. "A _ _ _ _" (first letter shown)
}

// ========== Question Generation ==========

export function generateMathQuizQuestions(config: MathConfig): MathQuizQuestion[] {
  const raw = generateMathQuestions(config);
  return raw.map(q => {
    const questionText = `${q.num1} ${q.operator} ${q.num2} = ?`;
    const correctAnswer = q.answer.toString();
    const options = generateNumericDistractors(q.answer, q.num1, q.num2, q.operator);
    const { shuffled, correctIndex } = shuffleOptions(options);
    return { id: q.id, questionText, options: shuffled, correctIndex, num1: q.num1, num2: q.num2, operator: q.operator };
  });
}

function generateNumericDistractors(answer: number, num1: number, num2: number, operator: string): string[] {
  const correct = answer.toString();
  const distractors = new Set<string>();
  distractors.add(correct);

  // Common error patterns
  const candidates: number[] = [];
  if (operator === '+' || operator === '-') {
    candidates.push(answer + 1, answer - 1, answer + 10, answer - 10);
    // Digit errors
    if (answer >= 10) {
      const digits = answer.toString().split('');
      // Swap digits
      if (digits.length === 2) {
        candidates.push(parseInt(digits[1] + digits[0]));
      }
    }
    // Off-by-one on operands
    candidates.push(num1 + num2 + 1, num1 + num2 - 1);
    if (operator === '-') {
      candidates.push(num2 - num1, Math.abs(num1 - num2) + 1);
    }
  } else if (operator === '×') {
    candidates.push(answer + num1, answer - num1, answer + num2, answer - num2);
    // Wrong operation (add instead of multiply)
    candidates.push(num1 + num2);
  }

  for (const c of candidates) {
    if (distractors.size >= 4) break;
    const s = c.toString();
    if (c >= 0 && c !== answer && !distractors.has(s)) {
      distractors.add(s);
    }
  }

  // Fill remaining with random offsets
  let offset = 2;
  while (distractors.size < 4) {
    const c = answer + offset;
    if (c >= 0 && !distractors.has(c.toString())) {
      distractors.add(c.toString());
    }
    const c2 = answer - offset;
    if (c2 >= 0 && !distractors.has(c2.toString())) {
      distractors.add(c2.toString());
    }
    offset++;
  }

  return Array.from(distractors).slice(0, 4);
}

export function generateAlgebraQuizQuestions(config: AlgebraConfig): {
  questions: AlgebraQuizQuestion[];
  itemSets: McItem[][];
} {
  const { questions: rawQuestions, itemSets } = generateAlgebraQuestions(config);
  const currency = config.language === 'zh' ? '元' : '$';

  const questions = rawQuestions.map(q => {
    const itemDisplay = q.items.map(item => `${item.item.emoji} × ${item.quantity}`).join(' + ');
    const questionText = `${itemDisplay} = ?`;
    const correctAnswer = `${q.total}${currency}`;

    // Generate numeric distractors, then append currency
    const rawDistractors = generateNumericDistractors(q.total, 0, 0, '+');
    const distractors = rawDistractors
      .filter(v => parseInt(v) !== q.total)
      .map(v => `${v}${currency}`);

    // Ensure we have exactly 3 distractors
    while (distractors.length < 3) {
      const fake = q.total + (distractors.length + 1) * 5;
      const fakeStr = `${fake}${currency}`;
      if (!distractors.includes(fakeStr) && fakeStr !== correctAnswer) {
        distractors.push(fakeStr);
      }
    }

    const options = [correctAnswer, ...distractors.slice(0, 3)];
    const { shuffled, correctIndex } = shuffleOptions(options);

    return {
      id: q.id,
      questionText,
      options: shuffled,
      correctIndex,
      items: q.items,
      total: q.total,
    };
  });

  return { questions, itemSets };
}

export function generateChineseQuizQuestions(config: PoemConfig): ChineseQuizQuestion[] {
  const exercises = generatePoemExercises(config);
  return exercises.map(ex => {
    const blanks: ChineseQuizBlank[] = [];
    ex.poem.lines.forEach((line, lineIdx) => {
      line.blanks.forEach(charIdx => {
        blanks.push({
          lineIndex: lineIdx,
          charIndex: charIdx,
          correctAnswer: line.text[charIdx],
          hint: '', // TODO: add pinyin if cnchar available in quiz context
        });
      });
    });
    return {
      id: ex.id,
      poem: ex.poem,
      blanks,
    };
  });
}

export function generateEnglishQuizQuestions(words: string[]): EnglishQuizQuestion[] {
  return words.map((word, i) => {
    // Hint: show first and last letter, underscores for middle
    let hint: string;
    if (word.length <= 2) {
      hint = word.length === 1 ? '_' : `${word[0]}_`;
    } else {
      hint = word[0] + '_'.repeat(word.length - 2) + word[word.length - 1];
    }
    return {
      id: `eng-${i}-${word}`,
      word,
      hint,
    };
  });
}

// ========== Answer Checking ==========

export function checkAnswer(userAnswer: string, correctAnswer: string, type: 'numeric' | 'chinese' | 'english'): boolean {
  switch (type) {
    case 'numeric':
      return parseInt(userAnswer) === parseInt(correctAnswer);
    case 'chinese':
      return userAnswer.trim() === correctAnswer;
    case 'english':
      return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    default:
      return false;
  }
}

// ========== Utility ==========

function shuffleOptions<T>(options: T[]): { shuffled: T[]; correctIndex: number } {
  const correct = options[0];
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  const correctIndex = shuffled.indexOf(correct);
  return { shuffled, correctIndex };
}

// ========== Quiz Session Storage ==========

export interface QuizSession {
  id: string;
  subject: QuizSubject;
  timestamp: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  duration: number;  // seconds
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  correct: boolean;
}

const QUIZ_SESSIONS_KEY = 'duomi-quiz-sessions';

export function saveQuizSession(session: Omit<QuizSession, 'id'>): QuizSession {
  const sessions = getAllQuizSessions();
  const newSession: QuizSession = {
    ...session,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  sessions.push(newSession);
  localStorage.setItem(QUIZ_SESSIONS_KEY, JSON.stringify(sessions));
  return newSession;
}

export function getAllQuizSessions(): QuizSession[] {
  try {
    const data = localStorage.getItem(QUIZ_SESSIONS_KEY);
    if (!data) return [];
    return JSON.parse(data) as QuizSession[];
  } catch {
    return [];
  }
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors (or only pre-existing ones).

- [ ] **Step 3: Commit**

```bash
git add src/lib/quiz-engine.ts
git commit -m "feat: add quiz engine library with question generation and answer checking"
```

---

### Task 2: Stats Aggregator

**Files:**
- Create: `src/lib/stats-aggregator.ts`

- [ ] **Step 1: Write the stats aggregator**

Create `src/lib/stats-aggregator.ts` that reads from both `study_records` and `quiz_sessions` to compute unified statistics:

```typescript
import { getAllRecords } from './study-storage';
import { getAllQuizSessions, QuizSubject } from './quiz-engine';

export interface AggregatedStats {
  totalSessions: number;          // total quiz sessions
  totalCorrect: number;           // total correct answers across all sessions
  totalQuestions: number;         // total questions attempted
  overallAccuracy: number;        // 0-1
  totalDurationSeconds: number;   // total quiz time in seconds
  subjectStats: Record<QuizSubject, SubjectStats>;
  perfectSessions: number;        // sessions with 100% accuracy
  currentStreak: number;          // consecutive sessions with >50% accuracy
  firstSessionDate: string | null;
}

export interface SubjectStats {
  sessions: number;
  correct: number;
  total: number;
  accuracy: number;
  durationSeconds: number;
}

const DEFAULT_SUBJECT_STATS: SubjectStats = {
  sessions: 0,
  correct: 0,
  total: 0,
  accuracy: 0,
  durationSeconds: 0,
};

// Cache to avoid repeated localStorage reads
let cache: AggregatedStats | null = null;
let cacheVersion = 0;

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

  // Calculate current streak: consecutive sessions with >50% accuracy from most recent
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

  const totalStudySessions = studyRecords.length + quizSessions.length;
  const totalStudyDuration = studyRecords.reduce((sum, r) => sum + r.duration, 0) * 60 + totalDurationSeconds;

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
  };
  cacheVersion += 1;
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/stats-aggregator.ts
git commit -m "feat: add stats aggregator for unified quiz + study record statistics"
```

---

### Task 3: Achievement Registry

**Files:**
- Create: `src/lib/achievement-registry.ts`

- [ ] **Step 1: Write the achievement registry**

Create `src/lib/achievement-registry.ts` defining all achievements:

```typescript
import { AggregatedStats } from './stats-aggregator';

export type AchievementCategory = 'milestone' | 'perfect' | 'subject' | 'collection';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  check: (stats: AggregatedStats) => boolean;
  progressLabel: (stats: AggregatedStats) => string;
  progressValue: (stats: AggregatedStats) => number;
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
    check: (stats) => stats.totalSessions >= 1 || stats.totalStudySessions >= 1,
    progressLabel: (stats) => `${Math.max(stats.totalSessions, 1 >= 1 ? stats.totalSessions : 0)}/1`,
    progressValue: (stats) => (stats.totalSessions >= 1 || stats.totalStudySessions >= 1 ? 1 : 0),
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
    check: (stats) => false, // Uses studyRecords consecutiveDays, checked separately
    progressLabel: () => '0/7',
    progressValue: () => 0,
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
    progressValue: (stats) => (stats.totalSessions >= 1 ? stats.perfectSessions : 0),
    progressMax: 1,
  },
  {
    id: 'triple-perfect',
    name: '三连胜',
    description: '连续 3 次练习全对',
    icon: '🏅',
    category: 'perfect',
    check: (stats) => false, // Requires session-level streak tracking
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
  // Collection category achievements represent collecting/unlocking other achievements
  {
    id: 'collector-5',
    name: '初级收藏家',
    description: '解锁 5 个成就',
    icon: '🗺️',
    category: 'collection',
    check: (unlockedCount) => (unlockedCount as number) >= 5,
    progressLabel: (unlockedCount) => `${unlockedCount as number}/5`,
    progressValue: (unlockedCount) => Math.min(unlockedCount as number, 5),
    progressMax: 5,
  },
  {
    id: 'collector-10',
    name: '资深收藏家',
    description: '解锁 10 个成就',
    icon: '🗺️',
    category: 'collection',
    check: (unlockedCount) => (unlockedCount as number) >= 10,
    progressLabel: (unlockedCount) => `${unlockedCount as number}/10`,
    progressValue: (unlockedCount) => Math.min(unlockedCount as number, 10),
    progressMax: 10,
  },
];

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/achievement-registry.ts
git commit -m "feat: add achievement registry with 15 achievements across 4 categories"
```

---

### Task 4: Achievement Engine

**Files:**
- Create: `src/lib/achievement-engine.ts`

- [ ] **Step 1: Write the achievement engine**

Create `src/lib/achievement-engine.ts` — pure logic for evaluating and unlocking achievements:

```typescript
import { ACHIEVEMENTS, Achievement, getAchievementById } from './achievement-registry';
import { rebuildStats, AggregatedStats } from './stats-aggregator';
import { calculateConsecutiveDays } from './study-storage';

const UNLOCKED_KEY = 'duomi-achievements-unlocked';

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string; // ISO 8601
}

export function getUnlockedAchievements(): UnlockedAchievement[] {
  try {
    const data = localStorage.getItem(UNLOCKED_KEY);
    if (!data) return [];
    return JSON.parse(data) as UnlockedAchievement[];
  } catch {
    return [];
  }
}

export function evaluateAchievements(): UnlockedAchievement[] {
  const stats = rebuildStats();
  const consecutiveDays = calculateConsecutiveDays();
  const unlocked = getUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map(u => u.achievementId));
  const newUnlocks: UnlockedAchievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;

    let isUnlocked = false;

    // Special handling for seven-day-warrior (uses study records)
    if (achievement.id === 'seven-day-warrior') {
      isUnlocked = consecutiveDays >= 7;
    }
    // Special handling for triple-perfect (needs session-level analysis)
    else if (achievement.id === 'triple-perfect') {
      isUnlocked = checkTriplePerfect(stats);
    }
    // Collection achievements get special param
    else if (achievement.category === 'collection') {
      isUnlocked = achievement.check(unlocked.length as any);
    }
    else {
      isUnlocked = achievement.check(stats);
    }

    if (isUnlocked) {
      const unlock: UnlockedAchievement = {
        achievementId: achievement.id,
        unlockedAt: new Date().toISOString(),
      };
      unlocked.push(unlock);
      newUnlocks.push(unlock);
    }
  }

  if (newUnlocks.length > 0) {
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
  }

  return newUnlocks;
}

function checkTriplePerfect(stats: AggregatedStats): boolean {
  // Check if there are 3 consecutive perfect sessions
  const { getAllQuizSessions } = require('./quiz-engine');
  const sessions = getAllQuizSessions()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  let streak = 0;
  for (const session of sessions) {
    if (session.accuracy === 1 && session.totalQuestions > 0) {
      streak += 1;
      if (streak >= 3) return true;
    } else {
      streak = 0;
    }
  }
  return false;
}

export function unlockAchievement(achievementId: string): UnlockedAchievement | null {
  const achievement = getAchievementById(achievementId);
  if (!achievement) return null;

  const unlocked = getUnlockedAchievements();
  if (unlocked.some(u => u.achievementId === achievementId)) return null;

  const unlock: UnlockedAchievement = {
    achievementId,
    unlockedAt: new Date().toISOString(),
  };
  unlocked.push(unlock);
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
  return unlock;
}

export function isUnlocked(achievementId: string): boolean {
  return getUnlockedAchievements().some(u => u.achievementId === achievementId);
}

export function getUnlockedCount(): number {
  return getUnlockedAchievements().length;
}

export function clearUnlocks(): void {
  localStorage.removeItem(UNLOCKED_KEY);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/achievement-engine.ts
git commit -m "feat: add achievement engine with evaluation and persistence"
```

---

### Task 5: useQuiz Hook

**Files:**
- Create: `src/hooks/useQuiz.ts`

- [ ] **Step 1: Write the useQuiz hook**

Create `src/hooks/useQuiz.ts` — shared quiz state management:

```typescript
import { useState, useCallback, useRef } from 'react';

export interface QuizAnswerRecord {
  questionIndex: number;
  answer: string;
}

export interface QuizState {
  currentQuestion: number;
  answers: QuizAnswerRecord[];
  isComplete: boolean;
  startTime: number | null;
}

export function useQuiz(totalQuestions: number) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestion(index);
    }
  }, [totalQuestions]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion, totalQuestions]);

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const setAnswer = useCallback((questionIndex: number, answer: string) => {
    setAnswers(prev => {
      const next = new Map(prev);
      next.set(questionIndex, answer);
      return next;
    });
  }, []);

  const answeredCount = answers.size;
  const isAllAnswered = answeredCount >= totalQuestions;

  const submit = useCallback(() => {
    setIsComplete(true);
  }, []);

  const reset = useCallback(() => {
    setCurrentQuestion(0);
    setAnswers(new Map());
    setIsComplete(false);
    startTimeRef.current = Date.now();
  }, []);

  const getElapsedSeconds = useCallback(() => {
    return Math.round((Date.now() - startTimeRef.current) / 1000);
  }, []);

  return {
    currentQuestion,
    answers,
    isComplete,
    totalQuestions,
    answeredCount,
    isAllAnswered,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    setAnswer,
    submit,
    reset,
    getElapsedSeconds,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useQuiz.ts
git commit -m "feat: add useQuiz hook for shared quiz state management"
```

---

### Task 6: useAchievements Hook

**Files:**
- Create: `src/hooks/useAchievements.ts`

- [ ] **Step 1: Write the useAchievements hook**

Create `src/hooks/useAchievements.ts` — React bridge for achievement system:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { evaluateAchievements, getUnlockedAchievements, UnlockedAchievement, getUnlockedCount } from '@/lib/achievement-engine';
import { invalidateCache } from '@/lib/stats-aggregator';

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [pendingUnlocks, setPendingUnlocks] = useState<UnlockedAchievement[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    setUnlocked(getUnlockedAchievements());
    setUnlockedCount(getUnlockedCount());
  }, []);

  const checkAndUnlock = useCallback(() => {
    invalidateCache();
    const newUnlocks = evaluateAchievements();
    if (newUnlocks.length > 0) {
      setUnlocked(getUnlockedAchievements());
      setUnlockedCount(getUnlockedCount());
      setPendingUnlocks(newUnlocks);
    }
  }, []);

  const dismissPending = useCallback(() => {
    setPendingUnlocks([]);
  }, []);

  return {
    unlocked,
    pendingUnlocks,
    unlockedCount,
    checkAndUnlock,
    dismissPending,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAchievements.ts
git commit -m "feat: add useAchievements React hook"
```

---

### Task 7: Shared Quiz UI Components

**Files:**
- Create: `src/components/QuizProgressBar.tsx`
- Create: `src/components/QuizNav.tsx`
- Create: `src/components/QuizResult.tsx`

- [ ] **Step 1: Write QuizProgressBar**

Create `src/components/QuizProgressBar.tsx`:

```tsx
interface QuizProgressBarProps {
  answered: number;
  total: number;
}

export function QuizProgressBar({ answered, total }: QuizProgressBarProps) {
  const percentage = total > 0 ? (answered / total) * 100 : 0;

  return (
    <div className="w-full bg-black/30 rounded-sm border-2 border-white/20 h-6 overflow-hidden">
      <div
        className="h-full bg-[#4CAF50] transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
        {answered} / {total}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write QuizNav**

Create `src/components/QuizNav.tsx`:

```tsx
interface QuizNavProps {
  current: number;
  total: number;
  answeredIndices: Set<number>;
  onGoTo: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function QuizNav({ current, total, answeredIndices, onGoTo, onPrev, onNext }: QuizNavProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Question number dots */}
      <div className="flex flex-wrap gap-1 justify-center">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            className={`w-7 h-7 text-xs font-bold border-2 transition-all ${
              i === current
                ? 'bg-yellow-400 text-black border-black scale-110'
                : answeredIndices.has(i)
                  ? 'bg-[#4CAF50] text-white border-black'
                  : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Prev/Next buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          disabled={current === 0}
          className="mc-btn bg-white text-black py-2 px-4 text-sm disabled:opacity-40"
        >
          ← 上一题
        </button>
        <button
          onClick={onNext}
          disabled={current === total - 1}
          className="mc-btn bg-white text-black py-2 px-4 text-sm disabled:opacity-40"
        >
          下一题 →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write QuizResult**

Create `src/components/QuizResult.tsx`:

```tsx
import { ArrowLeft, RefreshCw, Printer, Star } from 'lucide-react';
import Link from 'next/link';

interface QuizResultProps {
  subject: string;
  totalQuestions: number;
  correctCount: number;
  elapsedSeconds: number;
  wrongAnswers: Array<{ questionIndex: number; questionText: string; userAnswer: string; correctAnswer: string }>;
  onRetry: () => void;
  onExportPdf?: () => void;
}

export function QuizResult({
  subject,
  totalQuestions,
  correctCount,
  elapsedSeconds,
  wrongAnswers,
  onRetry,
  onExportPdf,
}: QuizResultProps) {
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const isPerfect = accuracy === 100;

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
      <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-2xl w-full text-center">
        {/* Header */}
        <div className="text-6xl mb-4">{isPerfect ? '🏆' : '🎉'}</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#333] mb-2">
          {isPerfect ? '完美通关！' : '完成！'}
        </h1>
        <p className="text-lg text-gray-600 mb-6">{subject}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border-2 border-black p-4">
            <div className="text-4xl font-bold text-[#4CAF50]">{accuracy}%</div>
            <div className="text-sm text-gray-500 mt-1">正确率</div>
            <div className="text-lg font-bold text-[#333] mt-1">{correctCount}/{totalQuestions}</div>
          </div>
          <div className="bg-white border-2 border-black p-4">
            <div className="text-4xl font-bold text-[#2196F3]">{minutes}:{seconds.toString().padStart(2, '0')}</div>
            <div className="text-sm text-gray-500 mt-1">用时</div>
          </div>
        </div>

        {/* Wrong answers review */}
        {wrongAnswers.length > 0 && (
          <div className="mb-8 text-left">
            <h2 className="text-xl font-bold text-[#333] mb-3 flex items-center gap-2">
              <span className="text-red-500">❌</span> 错题回顾
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {wrongAnswers.map((wa, i) => (
                <div key={i} className="bg-red-50 border-2 border-red-200 rounded p-3 text-sm">
                  <div className="font-bold text-[#333]">
                    第 {wa.questionIndex + 1} 题: {wa.questionText}
                  </div>
                  <div className="text-red-600 mt-1">你的答案: {wa.userAnswer}</div>
                  <div className="text-green-600">正确答案: {wa.correctAnswer}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="mc-btn bg-[#4CAF50] text-white flex-1 py-3 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> 重新练习
          </button>
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="mc-btn bg-[#2196F3] text-white flex-1 py-3 flex items-center justify-center gap-2"
            >
              <Printer className="h-4 w-4" /> 导出PDF
            </button>
          )}
          <Link href="/" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/QuizProgressBar.tsx src/components/QuizNav.tsx src/components/QuizResult.tsx
git commit -m "feat: add shared quiz UI components (progress bar, nav, result)"
```

---

### Task 8: Math Quiz Page

**Files:**
- Create: `src/app/math/quiz/page.tsx`
- Modify: `src/app/math/page.tsx` (add "在线做题" button)
- Modify: `messages/zh.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Write the math quiz page**

Create `src/app/math/quiz/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { generateMathQuestions, MathConfig } from '@/lib/math-generator';
import { generateMathQuizQuestions, saveQuizSession } from '@/lib/quiz-engine';
import { useQuiz } from '@/hooks/useQuiz';
import { useAchievements } from '@/hooks/useAchievements';
import { QuizProgressBar } from '@/components/QuizProgressBar';
import { QuizNav } from '@/components/QuizNav';
import { QuizResult } from '@/components/QuizResult';
import { AchievementToast } from '@/components/AchievementToast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';

export default function MathQuizPage() {
  const { t, mounted } = useTranslation();
  const [config] = useState<MathConfig>({
    operation: 'mix',
    max: 20,
    count: 20,
    mode: 'normal',
  });
  const [started, setStarted] = useState(false);

  const questions = useState(() => {
    const raw = generateMathQuestions(config);
    return generateMathQuizQuestions(config);
  })[0];

  const quiz = useQuiz(questions.length);

  // Result computation
  const [results, setResults] = useState<{ correctCount: number; wrongAnswers: any[] } | null>(null);
  const { pendingUnlocks, checkAndUnlock, dismissPending } = useAchievements();

  const handleSubmit = () => {
    let correctCount = 0;
    const wrongAnswers: any[] = [];

    questions.forEach((q, i) => {
      const userAnswer = quiz.answers.get(i) || '';
      const isCorrect = parseInt(userAnswer) === q.correctIndex ? false : userAnswer === q.options[q.correctIndex];
      // Actually compare by value:
      const correct = userAnswer === q.options[q.correctIndex];
      if (correct) {
        correctCount++;
      } else {
        wrongAnswers.push({
          questionIndex: i,
          questionText: q.questionText,
          userAnswer: userAnswer || '未作答',
          correctAnswer: q.options[q.correctIndex],
        });
      }
    });

    const elapsed = quiz.getElapsedSeconds();

    saveQuizSession({
      subject: 'math',
      timestamp: new Date().toISOString(),
      totalQuestions: questions.length,
      correctCount,
      accuracy: questions.length > 0 ? correctCount / questions.length : 0,
      duration: elapsed,
      answers: questions.map((q, i) => ({
        questionId: q.id,
        userAnswer: quiz.answers.get(i) || '',
        correct: quiz.answers.get(i) === q.options[q.correctIndex],
      })),
    });

    setResults({ correctCount, wrongAnswers });
    checkAndUnlock();
  };

  if (!mounted) return <div className="min-h-screen bg-[#795548] flex items-center justify-center text-white">Loading...</div>;

  if (results) {
    return (
      <>
        <QuizResult
          subject="数学在线练习"
          totalQuestions={questions.length}
          correctCount={results.correctCount}
          elapsedSeconds={quiz.getElapsedSeconds()}
          wrongAnswers={results.wrongAnswers}
          onRetry={() => window.location.reload()}
        />
        {pendingUnlocks.length > 0 && (
          <AchievementToast unlocks={pendingUnlocks} onDismiss={dismissPending} />
        )}
      </>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
        <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">🧮</div>
          <h1 className="text-3xl font-bold text-[#333] mb-2">数学在线练习</h1>
          <p className="text-gray-600 mb-6">
            {questions.length} 道{config.operation === 'mix' ? '混合' : config.operation === 'add' ? '加法' : config.operation === 'sub' ? '减法' : '乘法'}题
            · 最大值 {config.max}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setStarted(true)}
              className="mc-btn bg-[#4CAF50] text-white flex-1 py-3"
            >
              开始答题
            </button>
            <Link href="/math" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> 返回
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[quiz.currentQuestion];
  const answeredIndices = new Set(quiz.answers.keys());

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      {/* Header */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <Link href="/math" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回数学
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">数学在线练习</h1>
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-4 relative">
          <QuizProgressBar answered={quiz.answeredCount} total={quiz.totalQuestions} />
        </div>

        {/* Question area */}
        <div className="mc-card bg-white p-6 sm:p-12 mb-6">
          <div className="text-center mb-6">
            <span className="text-sm text-gray-400">第 {quiz.currentQuestion + 1} / {quiz.totalQuestions} 题</span>
            <h2 className="text-3xl sm:text-5xl font-bold text-[#333] mt-4">{currentQ.questionText}</h2>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => quiz.setAnswer(quiz.currentQuestion, opt)}
                className={`mc-btn py-6 text-xl sm:text-2xl ${
                  quiz.answers.get(quiz.currentQuestion) === opt
                    ? 'bg-[#4CAF50] text-white border-black'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <QuizNav
            current={quiz.currentQuestion}
            total={quiz.totalQuestions}
            answeredIndices={answeredIndices}
            onGoTo={quiz.goToQuestion}
            onPrev={quiz.prevQuestion}
            onNext={quiz.nextQuestion}
          />
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!quiz.isAllAnswered}
            className="mc-btn bg-[#4CAF50] text-white py-4 px-12 text-xl disabled:opacity-40 flex items-center gap-2 mx-auto"
          >
            <CheckCircle className="h-5 w-5" /> 提交答案
          </button>
          {!quiz.isAllAnswered && (
            <p className="text-white/60 mt-2 text-sm">
              还有 {quiz.totalQuestions - quiz.answeredCount} 题未完成
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add "在线做题" button to math page**

Read `src/app/math/page.tsx`, and after the `handleGenerate` button in the sidebar (around line 231), add a Link to the quiz page. Find the line with `{t('Math.craftSheet')}` button and add after the StudyRecordButton block:

```tsx
{/* 在线做题按钮 */}
<Link href="/math/quiz" className="mc-btn w-full bg-[#FF9800] text-white text-lg sm:text-xl hover:bg-[#F57C00] flex items-center justify-center gap-2 py-3">
  <span>🎮 在线做题</span>
</Link>
```

- [ ] **Step 3: Add i18n keys**

In `messages/zh.json`, add to the `Math` section:
```json
"onlineQuiz": "在线做题",
"onlineQuizStart": "开始答题",
```

In `messages/en.json`, add to the `Math` section:
```json
"onlineQuiz": "Online Quiz",
"onlineQuizStart": "Start Quiz",
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/math/quiz/page.tsx src/app/math/page.tsx messages/zh.json messages/en.json
git commit -m "feat: add math online quiz page with online quiz button on math page"
```

---

### Task 9: Algebra Quiz Page

**Files:**
- Create: `src/app/math/algebra/quiz/page.tsx`
- Modify: `src/app/math/algebra/page.tsx`

- [ ] **Step 1: Write the algebra quiz page**

Create `src/app/math/algebra/quiz/page.tsx` — similar structure to math quiz but with algebra question rendering:

```tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { AlgebraConfig } from '@/lib/algebra-generator';
import { generateAlgebraQuizQuestions, saveQuizSession } from '@/lib/quiz-engine';
import { useQuiz } from '@/hooks/useQuiz';
import { useAchievements } from '@/hooks/useAchievements';
import { QuizProgressBar } from '@/components/QuizProgressBar';
import { QuizNav } from '@/components/QuizNav';
import { QuizResult } from '@/components/QuizResult';
import { AchievementToast } from '@/components/AchievementToast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ItemPriceList } from '@/components/McItemIcon';

export default function AlgebraQuizPage() {
  const [config] = useState<AlgebraConfig>({
    difficulty: 2,
    count: 20,
    language: 'zh',
  });
  const [started, setStarted] = useState(false);

  const { questions, itemSets } = useState(() =>
    generateAlgebraQuizQuestions(config)
  )[0];

  const quiz = useQuiz(questions.length);
  const [results, setResults] = useState<{ correctCount: number; wrongAnswers: any[] } | null>(null);
  const { pendingUnlocks, checkAndUnlock, dismissPending } = useAchievements();

  const handleSubmit = () => {
    let correctCount = 0;
    const wrongAnswers: any[] = [];

    questions.forEach((q, i) => {
      const userAnswer = quiz.answers.get(i) || '';
      const correct = userAnswer === q.options[q.correctIndex];
      if (correct) {
        correctCount++;
      } else {
        wrongAnswers.push({
          questionIndex: i,
          questionText: q.questionText,
          userAnswer: userAnswer || '未作答',
          correctAnswer: q.options[q.correctIndex],
        });
      }
    });

    const elapsed = quiz.getElapsedSeconds();

    saveQuizSession({
      subject: 'algebra',
      timestamp: new Date().toISOString(),
      totalQuestions: questions.length,
      correctCount,
      accuracy: questions.length > 0 ? correctCount / questions.length : 0,
      duration: elapsed,
      answers: questions.map((q, i) => ({
        questionId: q.id,
        userAnswer: quiz.answers.get(i) || '',
        correct: quiz.answers.get(i) === q.options[q.correctIndex],
      })),
    });

    setResults({ correctCount, wrongAnswers });
    checkAndUnlock();
  };

  if (results) {
    return (
      <>
        <QuizResult
          subject="代数在线挑战"
          totalQuestions={questions.length}
          correctCount={results.correctCount}
          elapsedSeconds={quiz.getElapsedSeconds()}
          wrongAnswers={results.wrongAnswers}
          onRetry={() => window.location.reload()}
        />
        {pendingUnlocks.length > 0 && (
          <AchievementToast unlocks={pendingUnlocks} onDismiss={dismissPending} />
        )}
      </>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
        <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-bold text-[#333] mb-2">代数在线挑战</h1>
          <p className="text-gray-600 mb-6">{questions.length} 道题目</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setStarted(true)} className="mc-btn bg-[#4CAF50] text-white flex-1 py-3">
              开始答题
            </button>
            <Link href="/math/algebra" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> 返回
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[quiz.currentQuestion];
  const currentSetIndex = Math.floor(quiz.currentQuestion / 5);
  const currentSetItems = itemSets[currentSetIndex] || [];
  const answeredIndices = new Set(quiz.answers.keys());

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <Link href="/math/algebra" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回代数
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">代数在线挑战</h1>
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-4 relative">
          <QuizProgressBar answered={quiz.answeredCount} total={quiz.totalQuestions} />
        </div>

        <div className="mc-card bg-white p-6 sm:p-12 mb-6">
          {/* Price list for current item set */}
          {currentSetItems.length > 0 && (
            <div className="mb-6">
              <ItemPriceList items={currentSetItems} language={config.language} />
            </div>
          )}

          <div className="text-center mb-6">
            <span className="text-sm text-gray-400">第 {quiz.currentQuestion + 1} / {quiz.totalQuestions} 题</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#333] mt-4">{currentQ.questionText}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => quiz.setAnswer(quiz.currentQuestion, opt)}
                className={`mc-btn py-6 text-lg sm:text-xl ${
                  quiz.answers.get(quiz.currentQuestion) === opt
                    ? 'bg-[#4CAF50] text-white border-black'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <QuizNav
            current={quiz.currentQuestion}
            total={quiz.totalQuestions}
            answeredIndices={answeredIndices}
            onGoTo={quiz.goToQuestion}
            onPrev={quiz.prevQuestion}
            onNext={quiz.nextQuestion}
          />
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!quiz.isAllAnswered}
            className="mc-btn bg-[#4CAF50] text-white py-4 px-12 text-xl disabled:opacity-40 flex items-center gap-2 mx-auto"
          >
            <CheckCircle className="h-5 w-5" /> 提交答案
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add "在线做题" button to algebra page**

In `src/app/math/algebra/page.tsx`, after the generate button (around line 179), add:

```tsx
{/* 在线做题按钮 */}
<Link href="/math/algebra/quiz" className="mc-btn w-full bg-[#FF9800] text-white text-lg sm:text-xl hover:bg-[#F57C00] flex items-center justify-center gap-2 py-3">
  <span>🎮 在线做题</span>
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/math/algebra/quiz/page.tsx src/app/math/algebra/page.tsx
git commit -m "feat: add algebra online quiz page"
```

---

### Task 10: Chinese Quiz Page

**Files:**
- Create: `src/app/chinese/quiz/page.tsx`
- Modify: `src/app/chinese/page.tsx`

- [ ] **Step 1: Write the Chinese quiz page**

Create `src/app/chinese/quiz/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { PoemConfig } from '@/lib/poem-generator';
import { generateChineseQuizQuestions, saveQuizSession } from '@/lib/quiz-engine';
import { useQuiz } from '@/hooks/useQuiz';
import { useAchievements } from '@/hooks/useAchievements';
import { QuizProgressBar } from '@/components/QuizProgressBar';
import { QuizNav } from '@/components/QuizNav';
import { QuizResult } from '@/components/QuizResult';
import { AchievementToast } from '@/components/AchievementToast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function ChineseQuizPage() {
  const [config] = useState<PoemConfig>({
    difficulty: 1,
    count: 3,
    showAnswers: false,
    showPinyin: true,
  });
  const [started, setStarted] = useState(false);

  const questions = useState(() =>
    generateChineseQuizQuestions(config)
  )[0];

  const quiz = useQuiz(questions.length);
  const [results, setResults] = useState<{ correctCount: number; wrongAnswers: any[] } | null>(null);
  const { pendingUnlocks, checkAndUnlock, dismissPending } = useAchievements();

  const handleSubmit = () => {
    let correctCount = 0;
    const wrongAnswers: any[] = [];

    questions.forEach((q, qi) => {
      q.blanks.forEach((blank, bi) => {
        const answerKey = `${qi}-${bi}`;
        const userAnswer = quiz.answers.get(qi * 100 + bi) || '';
        const isCorrect = userAnswer.trim() === blank.correctAnswer;
        if (isCorrect) {
          correctCount++;
        } else {
          wrongAnswers.push({
            questionIndex: qi,
            questionText: `${q.poem.title} - 第 ${blank.lineIndex + 1} 句`,
            userAnswer: userAnswer || '未作答',
            correctAnswer: blank.correctAnswer,
          });
        }
      });
    });

    const totalBlanks = questions.reduce((sum, q) => sum + q.blanks.length, 0);
    const elapsed = quiz.getElapsedSeconds();

    saveQuizSession({
      subject: 'chinese-poem',
      timestamp: new Date().toISOString(),
      totalQuestions: totalBlanks,
      correctCount,
      accuracy: totalBlanks > 0 ? correctCount / totalBlanks : 0,
      duration: elapsed,
      answers: [],
    });

    setResults({ correctCount, wrongAnswers });
    checkAndUnlock();
  };

  if (results) {
    return (
      <>
        <QuizResult
          subject="语文在线古诗填空"
          totalQuestions={questions.reduce((sum, q) => sum + q.blanks.length, 0)}
          correctCount={results.correctCount}
          elapsedSeconds={quiz.getElapsedSeconds()}
          wrongAnswers={results.wrongAnswers}
          onRetry={() => window.location.reload()}
        />
        {pendingUnlocks.length > 0 && (
          <AchievementToast unlocks={pendingUnlocks} onDismiss={dismissPending} />
        )}
      </>
    );
  }

  if (!started) {
    const diffLabel = config.difficulty === 1 ? '⭐ 初级' : config.difficulty === 2 ? '⭐⭐ 中级' : '⭐⭐⭐ 高级';
    return (
      <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
        <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-[#333] mb-2">古诗填空在线练习</h1>
          <p className="text-gray-600 mb-6">{diffLabel} · {questions.length} 首诗</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setStarted(true)} className="mc-btn bg-[#F59E0B] text-white flex-1 py-3">
              开始答题
            </button>
            <Link href="/chinese" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> 返回
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[quiz.currentQuestion];
  const answeredIndices = new Set(quiz.answers.keys());

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <Link href="/chinese" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回语文
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">古诗填空在线练习</h1>
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-4 relative">
          <QuizProgressBar answered={quiz.answeredCount} total={quiz.totalQuestions} />
        </div>

        {/* Poem display with blanks */}
        <div className="mc-card bg-white p-6 sm:p-12 mb-6">
          <div className="text-center mb-4">
            <span className="text-sm text-gray-400">第 {quiz.currentQuestion + 1} / {quiz.totalQuestions} 首</span>
            <h2 className="text-2xl font-bold text-[#333] mt-2">{currentQ.poem.title}</h2>
            <p className="text-gray-500">【{currentQ.poem.dynasty}】{currentQ.poem.author}</p>
          </div>

          <div className="space-y-4 text-center">
            {currentQ.poem.lines.map((line, lineIdx) => (
              <div key={lineIdx} className="text-xl sm:text-3xl font-serif leading-relaxed">
                {line.text.split('').map((char, charIdx) => {
                  const blankInfo = currentQ.blanks.find(b => b.lineIndex === lineIdx && b.charIndex === charIdx);
                  if (blankInfo) {
                    const blankKey = quiz.currentQuestion * 100 + currentQ.blanks.indexOf(blankInfo);
                    const userAnswer = quiz.answers.get(blankKey) || '';
                    return (
                      <input
                        key={charIdx}
                        type="text"
                        maxLength={1}
                        value={userAnswer}
                        onChange={(e) => quiz.setAnswer(blankKey, e.target.value)}
                        className="inline-block w-8 sm:w-10 h-10 sm:h-12 text-center border-b-2 border-[#F59E0B] bg-yellow-50 text-lg sm:text-2xl focus:outline-none focus:border-[#F59E0B] focus:bg-yellow-100 font-serif"
                        style={{ fontFamily: '"KaiTi", "楷体", serif' }}
                      />
                    );
                  }
                  return <span key={charIdx}>{char}</span>;
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <QuizNav
            current={quiz.currentQuestion}
            total={quiz.totalQuestions}
            answeredIndices={answeredIndices}
            onGoTo={quiz.goToQuestion}
            onPrev={quiz.prevQuestion}
            onNext={quiz.nextQuestion}
          />
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="mc-btn bg-[#F59E0B] text-white py-4 px-12 text-xl flex items-center gap-2 mx-auto"
          >
            <CheckCircle className="h-5 w-5" /> 提交答案
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add "在线做题" button to chinese page**

In `src/app/chinese/page.tsx`, in the sidebar, after the character mode save button (around line 276) and after the poem mode save buttons (around line 356), add quiz links:

```tsx
{/* 在线做题按钮 */}
<Link href="/chinese/quiz" className="mc-btn w-full bg-[#FF9800] text-white text-lg sm:text-xl hover:bg-[#F57C00] flex items-center justify-center gap-2 py-3">
  <span>🎮 在线做题</span>
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/chinese/quiz/page.tsx src/app/chinese/page.tsx
git commit -m "feat: add chinese online quiz page"
```

---

### Task 11: English Quiz Page

**Files:**
- Create: `src/app/english/quiz/page.tsx`
- Modify: `src/app/english/page.tsx`

- [ ] **Step 1: Write the English quiz page**

Create `src/app/english/quiz/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { generateEnglishQuizQuestions, saveQuizSession } from '@/lib/quiz-engine';
import { useQuiz } from '@/hooks/useQuiz';
import { useAchievements } from '@/hooks/useAchievements';
import { QuizProgressBar } from '@/components/QuizProgressBar';
import { QuizNav } from '@/components/QuizNav';
import { QuizResult } from '@/components/QuizResult';
import { AchievementToast } from '@/components/AchievementToast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Default word list for English quiz
const DEFAULT_WORDS = ['Apple', 'Banana', 'Cat', 'Dog', 'Elephant', 'Fish', 'Grape', 'Hat', 'Ice', 'Jump'];

export default function EnglishQuizPage() {
  const [words] = useState(() => DEFAULT_WORDS);
  const [started, setStarted] = useState(false);

  const questions = useState(() =>
    generateEnglishQuizQuestions(words)
  )[0];

  const quiz = useQuiz(questions.length);
  const [results, setResults] = useState<{ correctCount: number; wrongAnswers: any[] } | null>(null);
  const { pendingUnlocks, checkAndUnlock, dismissPending } = useAchievements();

  const handleSubmit = () => {
    let correctCount = 0;
    const wrongAnswers: any[] = [];

    questions.forEach((q, i) => {
      const userAnswer = quiz.answers.get(i) || '';
      const isCorrect = userAnswer.trim().toLowerCase() === q.word.toLowerCase();
      if (isCorrect) {
        correctCount++;
      } else {
        wrongAnswers.push({
          questionIndex: i,
          questionText: `拼写: ${q.hint}`,
          userAnswer: userAnswer || '未作答',
          correctAnswer: q.word,
        });
      }
    });

    const elapsed = quiz.getElapsedSeconds();

    saveQuizSession({
      subject: 'english',
      timestamp: new Date().toISOString(),
      totalQuestions: questions.length,
      correctCount,
      accuracy: questions.length > 0 ? correctCount / questions.length : 0,
      duration: elapsed,
      answers: questions.map((q, i) => ({
        questionId: q.id,
        userAnswer: quiz.answers.get(i) || '',
        correct: quiz.answers.get(i)?.trim().toLowerCase() === q.word.toLowerCase(),
      })),
    });

    setResults({ correctCount, wrongAnswers });
    checkAndUnlock();
  };

  if (results) {
    return (
      <>
        <QuizResult
          subject="英语在线拼写练习"
          totalQuestions={questions.length}
          correctCount={results.correctCount}
          elapsedSeconds={quiz.getElapsedSeconds()}
          wrongAnswers={results.wrongAnswers}
          onRetry={() => window.location.reload()}
        />
        {pendingUnlocks.length > 0 && (
          <AchievementToast unlocks={pendingUnlocks} onDismiss={dismissPending} />
        )}
      </>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
        <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">🔤</div>
          <h1 className="text-3xl font-bold text-[#333] mb-2">英语拼写在线练习</h1>
          <p className="text-gray-600 mb-6">{questions.length} 个单词</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setStarted(true)} className="mc-btn bg-[#3B82F6] text-white flex-1 py-3">
              开始答题
            </button>
            <Link href="/english" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> 返回
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[quiz.currentQuestion];
  const answeredIndices = new Set(quiz.answers.keys());

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <Link href="/english" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回英语
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">英语拼写在线练习</h1>
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-4 relative">
          <QuizProgressBar answered={quiz.answeredCount} total={quiz.totalQuestions} />
        </div>

        <div className="mc-card bg-white p-6 sm:p-12 mb-6">
          <div className="text-center mb-6">
            <span className="text-sm text-gray-400">第 {quiz.currentQuestion + 1} / {quiz.totalQuestions} 题</span>
            <div className="mt-4">
              <p className="text-gray-500 mb-2">提示:</p>
              <p className="text-3xl sm:text-5xl font-bold text-[#333] tracking-widest font-mono">{currentQ.hint}</p>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={quiz.answers.get(quiz.currentQuestion) || ''}
              onChange={(e) => quiz.setAnswer(quiz.currentQuestion, e.target.value)}
              placeholder="输入单词..."
              className="w-full border-2 border-black p-4 text-2xl text-center focus:outline-none focus:ring-2 focus:ring-[#3B82F6] font-sans"
            />
          </div>
        </div>

        <div className="mb-6">
          <QuizNav
            current={quiz.currentQuestion}
            total={quiz.totalQuestions}
            answeredIndices={answeredIndices}
            onGoTo={quiz.goToQuestion}
            onPrev={quiz.prevQuestion}
            onNext={quiz.nextQuestion}
          />
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!quiz.isAllAnswered}
            className="mc-btn bg-[#3B82F6] text-white py-4 px-12 text-xl disabled:opacity-40 flex items-center gap-2 mx-auto"
          >
            <CheckCircle className="h-5 w-5" /> 提交答案
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add "在线做题" button to english page**

In `src/app/english/page.tsx`, after the save PDF button (around line 153), add:

```tsx
{/* 在线做题按钮 */}
<Link href="/english/quiz" className="mc-btn w-full bg-[#FF9800] text-white text-lg sm:text-xl hover:bg-[#F57C00] flex items-center justify-center gap-2 py-3">
  <span>🎮 在线做题</span>
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/english/quiz/page.tsx src/app/english/page.tsx
git commit -m "feat: add english online quiz page"
```

---

### Task 12: Achievement Toast

**Files:**
- Create: `src/components/AchievementToast.tsx`

- [ ] **Step 1: Write the AchievementToast component**

Create `src/components/AchievementToast.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { UnlockedAchievement } from '@/lib/achievement-engine';
import { getAchievementById } from '@/lib/achievement-registry';

interface AchievementToastProps {
  unlocks: UnlockedAchievement[];
  onDismiss: () => void;
}

export function AchievementToast({ unlocks, onDismiss }: AchievementToastProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (unlocks.length === 0) return;

    const showTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (currentIndex < unlocks.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsVisible(true);
        } else {
          onDismiss();
        }
      }, 500);
    }, 2500);

    return () => clearTimeout(showTimer);
  }, [currentIndex, unlocks.length, onDismiss]);

  if (unlocks.length === 0) return null;

  const unlock = unlocks[currentIndex];
  const achievement = getAchievementById(unlock.achievementId);
  if (!achievement) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[100] transition-all duration-500 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="mc-card bg-[#FFD700] p-4 flex items-center gap-3 animate-bounce-once">
        <div className="text-4xl">{achievement.icon}</div>
        <div>
          <div className="text-xs font-bold text-black/60 uppercase">成就解锁!</div>
          <div className="text-lg font-bold text-black">{achievement.name}</div>
          <div className="text-sm text-black/70">{achievement.description}</div>
        </div>
      </div>
    </div>
  );
}
```

Add the bounce animation to `src/app/globals.css`:

```css
@keyframes bounce-once {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

.animate-bounce-once {
  animation: bounce-once 0.5s ease-out;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AchievementToast.tsx src/app/globals.css
git commit -m "feat: add achievement toast component with bounce animation"
```

---

### Task 13: Achievement Card Component

**Files:**
- Create: `src/components/AchievementCard.tsx`

- [ ] **Step 1: Write the AchievementCard component**

Create `src/components/AchievementCard.tsx`:

```tsx
import { Achievement } from '@/lib/achievement-registry';
import { AggregatedStats } from '@/lib/stats-aggregator';
import { UnlockedAchievement } from '@/lib/achievement-engine';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockData?: UnlockedAchievement;
  stats: AggregatedStats;
  unlockedCount: number;
}

export function AchievementCard({ achievement, isUnlocked, unlockData, stats, unlockedCount }: AchievementCardProps) {
  const progressValue = achievement.category === 'collection'
    ? achievement.progressValue(unlockedCount as any)
    : achievement.progressValue(stats);
  const progressMax = achievement.progressMax;
  const progressLabel = achievement.category === 'collection'
    ? achievement.progressLabel(unlockedCount as any)
    : achievement.progressLabel(stats);
  const progressPercent = progressMax > 0 ? Math.min((progressValue / progressMax) * 100, 100) : 0;

  return (
    <div
      className={`mc-card p-4 relative transition-all ${
        isUnlocked
          ? 'bg-white hover:scale-105'
          : 'bg-gray-200'
      }`}
    >
      {/* Icon */}
      <div className="text-4xl sm:text-5xl mb-2 text-center">
        {isUnlocked ? achievement.icon : (
          <span className="opacity-30 grayscale">🔒</span>
        )}
      </div>

      {/* Name */}
      <h3 className="text-center text-sm sm:text-base font-bold text-[#333] mb-1">
        {isUnlocked ? achievement.name : '???'}
      </h3>

      {/* Description */}
      {isUnlocked ? (
        <p className="text-center text-xs text-gray-500 mb-2">{achievement.description}</p>
      ) : (
        <p className="text-center text-xs text-gray-400 mb-2">{achievement.description}</p>
      )}

      {/* Unlocked date */}
      {isUnlocked && unlockData && (
        <p className="text-center text-xs text-[#4CAF50] mb-2">
          {new Date(unlockData.unlockedAt).toLocaleDateString('zh-CN')}
        </p>
      )}

      {/* Progress bar for locked achievements */}
      {!isUnlocked && progressMax > 0 && (
        <div className="w-full bg-gray-300 rounded-sm h-3 overflow-hidden">
          <div
            className="h-full bg-[#F59E0B] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Progress label */}
      {!isUnlocked && (
        <p className="text-center text-xs text-gray-400 mt-1">{progressLabel}</p>
      )}

      {/* Locked overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-black/20 rounded-sm" />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AchievementCard.tsx
git commit -m "feat: add achievement card component"
```

---

### Task 14: Achievements Page

**Files:**
- Create: `src/app/achievements/page.tsx`

- [ ] **Step 1: Write the achievements page**

Create `src/app/achievements/page.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Star, Target, BookOpen, Map } from 'lucide-react';
import Link from 'next/link';
import { AchievementCard } from '@/components/AchievementCard';
import { ACHIEVEMENTS, AchievementCategory, getAchievementsByCategory } from '@/lib/achievement-registry';
import { getUnlockedAchievements } from '@/lib/achievement-engine';
import { getStats, AggregatedStats } from '@/lib/stats-aggregator';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const categoryIcons: Record<AchievementCategory, React.ReactNode> = {
  milestone: <Trophy className="h-5 w-5" />,
  perfect: <Star className="h-5 w-5" />,
  subject: <BookOpen className="h-5 w-5" />,
  collection: <Map className="h-5 w-5" />,
};

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
  const [unlockedMap, setUnlockedMap] = useState<Record<string, { unlockedAt: string }>>({});

  useEffect(() => {
    setStats(getStats());
    const unlocked = getUnlockedAchievements();
    const ids = new Set(unlocked.map(u => u.achievementId));
    setUnlockedAchievements(ids);
    const map: Record<string, { unlockedAt: string }> = {};
    unlocked.forEach(u => { map[u.achievementId] = { unlockedAt: u.unlockedAt }; });
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
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-bold border-4 transition-all active:translate-y-1 whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${
              activeTab === cat
                ? 'bg-[#FFD700] text-black border-black shadow-lg'
                : 'bg-[#C6C6C6] text-gray-700 border-gray-400 hover:bg-gray-200'
            }`}
          >
            {categoryIcons[cat]} {categoryLabels[cat]}
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
        成就殿堂 — 记录每一份努力 🏆
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/achievements/page.tsx
git commit -m "feat: add achievements page with category tabs and progress tracking"
```

---

### Task 15: Home Page Achievement Entry

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add achievement entry card to home page**

Read `src/app/page.tsx`. Add a new card in the main menu grid after the History block (after line 106):

```tsx
{/* Achievements Block */}
<Link href="/achievements" className="group">
  <div className="mc-card h-full p-4 sm:p-6 bg-[#9C27B0] hover:bg-[#7B1FA2] transition-transform hover:-translate-y-2 relative overflow-hidden">
    <div className="absolute top-2 right-2 text-3xl sm:text-4xl opacity-50 rotate-12">🏆</div>
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 drop-shadow-md">成就殿堂</h2>
    <p className="text-white/90 text-base sm:text-lg leading-relaxed font-sans whitespace-pre-line">
      解锁成就，收集徽章。
      见证你的成长之路！
    </p>
    <div className="mt-4 sm:mt-6 inline-block bg-black/20 px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-base text-white font-bold border-2 border-white/50 group-hover:bg-black/30">
      查看成就 &rarr;
    </div>
  </div>
</Link>
```

Update the grid columns from `lg:grid-cols-4` to `lg:grid-cols-5` on line 49:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-8 w-full max-w-7xl z-10">
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add achievement entry card to home page"
```

---

### Task 16: Fix Achievement Registry Type Issues and Add Study Records Integration

**Files:**
- Modify: `src/lib/achievement-registry.ts`
- Modify: `src/lib/achievement-engine.ts`
- Modify: `src/lib/stats-aggregator.ts`

- [ ] **Step 1: Fix the seven-day-warrior and first-pickaxe achievements to use combined data**

The achievement registry's `first-pickaxe` progress function has a bug. Also `seven-day-warrior` needs consecutive days from study records. Fix `src/lib/stats-aggregator.ts` to include study record count:

Update the `AggregatedStats` interface and `rebuildStats` function to include `totalStudyRecords` (count of manual study records from StudyRecordButton):

In `src/lib/stats-aggregator.ts`, add `totalStudyRecords` to `AggregatedStats`:
```typescript
export interface AggregatedStats {
  // ... existing fields
  totalStudyRecords: number;  // count from study_records (manual records)
}
```

And set it in `rebuildStats`:
```typescript
const totalStudyRecords = studyRecords.length;
// ... in return:
cache = {
  // ... existing fields
  totalStudyRecords,
};
```

- [ ] **Step 2: Fix first-pickaxe achievement check**

In `src/lib/achievement-registry.ts`, fix the first-pickaxe:
```typescript
{
  id: 'first-pickaxe',
  name: '第一镐',
  description: '完成第一次学习',
  icon: '⛏️',
  category: 'milestone',
  check: (stats) => stats.totalSessions >= 1 || stats.totalStudyRecords >= 1,
  progressLabel: (stats) => {
    const total = Math.max(stats.totalSessions, stats.totalStudyRecords);
    return `${Math.min(total, 1)}/1`;
  },
  progressValue: (stats) => (stats.totalSessions >= 1 || stats.totalStudyRecords >= 1 ? 1 : 0),
  progressMax: 1,
},
```

- [ ] **Step 3: Fix seven-day-warrior to use consecutive days from study records**

In `src/lib/achievement-engine.ts`, the seven-day-warrior check already uses `calculateConsecutiveDays()`. Update the progress in the registry:

```typescript
{
  id: 'seven-day-warrior',
  name: '七天战士',
  description: '连续学习 7 天',
  icon: '⚔️',
  category: 'milestone',
  check: () => false, // handled specially in engine
  progressLabel: () => '0/7',
  progressValue: () => 0,
  progressMax: 7,
},
```

And in the engine's evaluateAchievements, handle it correctly:
```typescript
if (achievement.id === 'seven-day-warrior') {
  isUnlocked = consecutiveDays >= 7;
}
```

For the progress display, we need to pass consecutiveDays to the stats. Add `consecutiveDays` to `AggregatedStats` and populate it from `calculateConsecutiveDays()` in `rebuildStats`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/achievement-registry.ts src/lib/achievement-engine.ts src/lib/stats-aggregator.ts
git commit -m "fix: correct achievement progress tracking with combined study record data"
```

---

### Task 17: Add i18n Keys for All New Features

**Files:**
- Modify: `messages/zh.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add all new translation keys**

In `messages/zh.json`, add new sections:

```json
"Quiz": {
  "title": "在线练习",
  "start": "开始答题",
  "submit": "提交答案",
  "retry": "重新练习",
  "exportPdf": "导出PDF",
  "perfect": "完美通关！",
  "complete": "完成！",
  "accuracy": "正确率",
  "time": "用时",
  "wrongReview": "错题回顾",
  "yourAnswer": "你的答案",
  "correctAnswer": "正确答案",
  "backToHome": "返回首页",
  "notAllAnswered": "还有 {count} 题未完成"
},
"Achievements": {
  "title": "成就殿堂",
  "totalProgress": "总进度",
  "unlocked": "已解锁",
  "all": "全部",
  "milestones": "学习里程碑",
  "perfect": "全对成就",
  "subject": "学科专精",
  "collection": "收集图鉴",
  "footer": "成就殿堂 — 记录每一份努力"
}
```

In `messages/en.json`, add corresponding English keys:

```json
"Quiz": {
  "title": "Online Quiz",
  "start": "Start Quiz",
  "submit": "Submit Answers",
  "retry": "Retry",
  "exportPdf": "Export PDF",
  "perfect": "Perfect Score!",
  "complete": "Complete!",
  "accuracy": "Accuracy",
  "time": "Time",
  "wrongReview": "Wrong Answers Review",
  "yourAnswer": "Your Answer",
  "correctAnswer": "Correct Answer",
  "backToHome": "Back to Home",
  "notAllAnswered": "{count} questions remaining"
},
"Achievements": {
  "title": "Achievement Hall",
  "totalProgress": "Total Progress",
  "unlocked": "Unlocked",
  "all": "All",
  "milestones": "Milestones",
  "perfect": "Perfect Score",
  "subject": "Subject Mastery",
  "collection": "Collection",
  "footer": "Achievement Hall — Record every effort"
}
```

Also add `"onlineQuiz": "在线做题"` to `Math`, `Chinese`, `English`, `Algebra` sections in zh.json, and `"onlineQuiz": "Online Quiz"` in en.json.

- [ ] **Step 2: Commit**

```bash
git add messages/zh.json messages/en.json
git commit -m "feat: add i18n keys for quiz and achievements"
```

---

### Task 18: Build Verification

**Files:** N/A

- [ ] **Step 1: Run TypeScript type check**

Run: `npx tsc --noEmit`

Expected: No errors.

- [ ] **Step 2: Run Next.js build**

Run: `npm run build`

Expected: Build succeeds.

- [ ] **Step 3: Fix any build errors**

If there are errors, fix them and re-run the build.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build errors"
```