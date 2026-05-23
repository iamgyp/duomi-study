# Speed Challenge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a timed mental math speed challenge mode where students answer as many questions as possible within a countdown, with input-based answers and speed metrics.

**Architecture:** New routes under `/math/speed-challenge/` (config + quiz). Reuses `saveQuizSession` and achievement engine. New `useSpeedQuiz` hook handles countdown + continuous question generation. Three new UI components: `CountdownTimer`, `SpeedResult`, and inline quiz UI.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, localStorage.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/speed-generator.ts` | Speed question generator (single question on demand) |
| Create | `src/hooks/useSpeedQuiz.ts` | Countdown timer + question loop + scoring hook |
| Create | `src/components/CountdownTimer.tsx` | Visual countdown progress bar |
| Create | `src/components/SpeedResult.tsx` | Result display with speed metrics |
| Create | `src/app/math/speed-challenge/page.tsx` | Config page |
| Create | `src/app/math/speed-challenge/quiz/page.tsx` | Quiz page + inline result |
| Modify | `src/lib/quiz-engine.ts:8` | Add `'speed-challenge'` to `QuizSubject` union |
| Modify | `src/lib/stats-aggregator.ts:40-45` | Add `'speed-challenge'` to subjectStats init |
| Modify | `src/lib/wrong-answers.ts:16-30` | Add speed-challenge labels and routes |
| Modify | `src/lib/achievement-registry.ts` | Add 4 new achievements |
| Modify | `src/lib/achievement-engine.ts:35-46` | Add special check for `lightning-10` |
| Modify | `src/app/math/page.tsx:243-247` | Add speed challenge entry button |
| Modify | `messages/zh.json` | Add `SpeedChallenge` translations |
| Modify | `messages/en.json` | Add `SpeedChallenge` translations |
| Modify | `src/hooks/useTranslation.ts:7-15` | Add `SpeedChallenge` to `TranslationMessages` |

---

### Task 1: Extend Core Types (`QuizSubject`, Stats, Wrong Answers)

**Files:**
- Modify: `src/lib/quiz-engine.ts`
- Modify: `src/lib/stats-aggregator.ts`
- Modify: `src/lib/wrong-answers.ts`

These three files form the data layer. We extend `QuizSubject` so all downstream code (stats, wrong answers) recognizes the new subject.

- [ ] **Step 1: Extend `QuizSubject` in `quiz-engine.ts`**

In `src/lib/quiz-engine.ts`, line 8, change:

```typescript
export type QuizSubject = 'math' | 'algebra' | 'chinese-poem' | 'english';
```

to:

```typescript
export type QuizSubject = 'math' | 'algebra' | 'chinese-poem' | 'english' | 'speed-challenge';
```

This is the only change needed. `QuizSession`, `QuizAnswer`, `saveQuizSession`, and `getAllQuizSessions` are already generic enough to handle the new subject.

- [ ] **Step 2: Add `speed-challenge` to stats aggregator**

In `src/lib/stats-aggregator.ts`, the `subjectStats` initialization in `rebuildStats()` (around line 40-45) needs the new key:

```typescript
const subjectStats: Record<QuizSubject, SubjectStats> = {
  math: { ...DEFAULT_SUBJECT_STATS },
  algebra: { ...DEFAULT_SUBJECT_STATS },
  'chinese-poem': { ...DEFAULT_SUBJECT_STATS },
  english: { ...DEFAULT_SUBJECT_STATS },
  'speed-challenge': { ...DEFAULT_SUBJECT_STATS },
};
```

- [ ] **Step 3: Add `speed-challenge` to wrong-answers maps**

In `src/lib/wrong-answers.ts`:

Line 16 — add to `SUBJECT_ORDER`:
```typescript
const SUBJECT_ORDER: QuizSubject[] = ['math', 'algebra', 'chinese-poem', 'english', 'speed-challenge'];
```

Lines 18-23 — add to `SUBJECT_LABELS`:
```typescript
export const SUBJECT_LABELS: Record<QuizSubject, string> = {
  math: '数学',
  algebra: '代数',
  'chinese-poem': '语文',
  english: '英语',
  'speed-challenge': '速算挑战',
};
```

Lines 25-30 — add to `SUBJECT_ROUTES`:
```typescript
export const SUBJECT_ROUTES: Record<QuizSubject, string> = {
  math: '/math/quiz',
  algebra: '/math/algebra/quiz',
  'chinese-poem': '/chinese/quiz',
  english: '/english/quiz',
  'speed-challenge': '/math/speed-challenge/quiz',
};
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors (existing errors are OK — this project had pre-existing ones).

- [ ] **Step 5: Commit**

```bash
git add src/lib/quiz-engine.ts src/lib/stats-aggregator.ts src/lib/wrong-answers.ts
git commit -m "feat: add speed-challenge to QuizSubject union and stats"
```

---

### Task 2: Create Speed Question Generator

**Files:**
- Create: `src/lib/speed-generator.ts`

This module generates one speed question at a time. It reuses the same logic as `generateNormalQuestion` from `math-generator.ts` but exposes a simple single-call API. Speed mode doesn't use `make-ten` or `take-ten` (those are pedagogical modes, not speed modes).

- [ ] **Step 1: Create `src/lib/speed-generator.ts`**

```typescript
export type SpeedQuizConfig = {
  timeLimitSeconds: 30 | 60 | 120;
  max: number;
  operation: 'add' | 'sub' | 'mul' | 'mix';
};

export type SpeedQuestion = {
  id: string;
  num1: number;
  num2: number;
  operator: '+' | '-' | '×';
  answer: number;
  questionText: string;
};

let idCounter = 0;

export function generateSpeedQuestion(config: SpeedQuizConfig): SpeedQuestion {
  let q: SpeedQuestion | null = null;
  let attempts = 0;

  while (!q && attempts < 50) {
    attempts++;
    q = generateOne(config.operation, config.max);
  }

  // Fallback if generation fails (shouldn't happen)
  if (!q) {
    q = { id: '', num1: 1, num2: 1, operator: '+', answer: 2, questionText: '1 + 1 = ?' };
  }

  idCounter++;
  q.id = `speed-${Date.now()}-${idCounter}`;
  return q;
}

function generateOne(op: string, max: number): SpeedQuestion | null {
  const operator = op === 'mix'
    ? (Math.random() > 0.5 ? '+' : '-')
    : (op === 'mul' ? '×' : (op === 'sub' ? '-' : '+'));

  let num1 = Math.floor(Math.random() * max) + 1;
  let num2 = Math.floor(Math.random() * max) + 1;

  if (operator === '+') {
    if (num1 + num2 > max) return null;
    return {
      id: '',
      num1,
      num2,
      operator: '+',
      answer: num1 + num2,
      questionText: `${num1} + ${num2} = ?`,
    };
  }

  if (operator === '-') {
    if (num1 < num2) {
      [num1, num2] = [num2, num1];
    }
    return {
      id: '',
      num1,
      num2,
      operator: '-',
      answer: num1 - num2,
      questionText: `${num1} - ${num2} = ?`,
    };
  }

  // multiplication
  const m = Math.min(max, 9);
  num1 = Math.floor(Math.random() * m) + 1;
  num2 = Math.floor(Math.random() * m) + 1;
  return {
    id: '',
    num1,
    num2,
    operator: '×',
    answer: num1 * num2,
    questionText: `${num1} × ${num2} = ?`,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/speed-generator.ts
git commit -m "feat: add speed question generator"
```

---

### Task 3: Create `useSpeedQuiz` Hook

**Files:**
- Create: `src/hooks/useSpeedQuiz.ts`

This hook manages the entire speed quiz game loop: countdown timer, question generation, answer submission, scoring. It differs from `useQuiz` in that it's time-driven (not question-count-driven), generates questions on demand, and auto-advances on answer.

- [ ] **Step 1: Create `src/hooks/useSpeedQuiz.ts`**

```typescript
import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSpeedQuestion, SpeedQuizConfig, SpeedQuestion } from '@/lib/speed-generator';

export type SpeedQuizState = 'idle' | 'running' | 'timeUp';

export interface SpeedQuizAnswer {
  questionIndex: number;
  question: SpeedQuestion;
  userAnswer: string;
  correct: boolean;
}

export interface UseSpeedQuizReturn {
  state: SpeedQuizState;
  timeRemaining: number;
  currentQuestion: SpeedQuestion | null;
  answers: SpeedQuizAnswer[];
  correctCount: number;
  attemptedCount: number;
  questionInput: string;
  feedback: 'correct' | 'wrong' | null;

  start: () => void;
  submitAnswer: (input: string) => void;
  reset: () => void;
  setQuestionInput: (value: string) => void;
}

export function useSpeedQuiz(config: SpeedQuizConfig): UseSpeedQuizReturn {
  const [state, setState] = useState<SpeedQuizState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(config.timeLimitSeconds);
  const [currentQuestion, setCurrentQuestion] = useState<SpeedQuestion | null>(null);
  const [answers, setAnswers] = useState<SpeedQuizAnswer[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionInput, setQuestionInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generateNextQuestion = useCallback(() => {
    const next = generateSpeedQuestion(config);
    setCurrentQuestion(next);
    setQuestionInput('');
  }, [config]);

  const start = useCallback(() => {
    setState('running');
    setTimeRemaining(config.timeLimitSeconds);
    setAnswers([]);
    setCorrectCount(0);
    setFeedback(null);
    generateNextQuestion();

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setState('timeUp');
          setCurrentQuestion(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [config, generateNextQuestion]);

  const submitAnswer = useCallback((input: string) => {
    if (state !== 'running' || !currentQuestion) return;

    const trimmed = input.trim();
    if (trimmed === '') return; // ignore empty submissions

    const isCorrect = parseInt(trimmed, 10) === currentQuestion.answer;

    const answer: SpeedQuizAnswer = {
      questionIndex: answers.length,
      question: currentQuestion,
      userAnswer: trimmed,
      correct: isCorrect,
    };

    setAnswers((prev) => [...prev, answer]);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

    // Show brief feedback then generate next question
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      generateNextQuestion();
    }, 500);
  }, [state, currentQuestion, answers.length, generateNextQuestion]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setState('idle');
    setTimeRemaining(config.timeLimitSeconds);
    setCurrentQuestion(null);
    setAnswers([]);
    setCorrectCount(0);
    setQuestionInput('');
    setFeedback(null);
  }, [config.timeLimitSeconds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  return {
    state,
    timeRemaining,
    currentQuestion,
    answers,
    correctCount,
    attemptedCount: answers.length,
    questionInput,
    feedback,
    start,
    submitAnswer,
    reset,
    setQuestionInput,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSpeedQuiz.ts
git commit -m "feat: add useSpeedQuiz hook with countdown and scoring"
```

---

### Task 4: Create CountdownTimer Component

**Files:**
- Create: `src/components/CountdownTimer.tsx`

A visual countdown progress bar with color transitions and optional time-up state.

- [ ] **Step 1: Create `src/components/CountdownTimer.tsx`**

```tsx
'use client';

interface CountdownTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
  state: 'running' | 'timeUp';
}

export function CountdownTimer({ secondsRemaining, totalSeconds, state }: CountdownTimerProps) {
  const ratio = totalSeconds > 0 ? secondsRemaining / totalSeconds : 0;

  let barColor = '#4CAF50'; // green
  if (ratio <= 0.1) {
    barColor = '#EF4444'; // red
  } else if (ratio <= 0.25) {
    barColor = '#EF4444'; // red
  } else if (ratio <= 0.5) {
    barColor = '#F59E0B'; // yellow
  }

  const isFlashing = ratio <= 0.1 && state === 'running';

  if (state === 'timeUp') {
    return (
      <div className="w-full bg-black/30 rounded-sm border-2 border-white/20 h-12 overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center text-red-400 text-2xl font-bold animate-pulse">
          TIME UP!
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black/30 rounded-sm border-2 border-white/20 h-12 overflow-hidden relative">
      <div
        className={`h-full transition-all duration-1000 ${isFlashing ? 'animate-pulse' : ''}`}
        style={{
          width: `${ratio * 100}%`,
          backgroundColor: barColor,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold drop-shadow-md">
        {secondsRemaining}s
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CountdownTimer.tsx
git commit -m "feat: add CountdownTimer component"
```

---

### Task 5: Create SpeedResult Component

**Files:**
- Create: `src/components/SpeedResult.tsx`

Result display showing score, accuracy, speed metric (questions per minute), wrong answer review, and retry/home buttons. Follows the existing `QuizResult` visual style (Minecraft card layout).

- [ ] **Step 1: Create `src/components/SpeedResult.tsx`**

```tsx
'use client';

import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react';
import Link from 'next/link';
import { SpeedQuizAnswer } from '@/hooks/useSpeedQuiz';

interface SpeedResultProps {
  correctCount: number;
  attemptedCount: number;
  timeLimitSeconds: number;
  wrongAnswers: SpeedQuizAnswer[];
  onRetry: () => void;
}

export function SpeedResult({
  correctCount,
  attemptedCount,
  timeLimitSeconds,
  wrongAnswers,
  onRetry,
}: SpeedResultProps) {
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const questionsPerMinute = timeLimitSeconds > 0
    ? ((correctCount / timeLimitSeconds) * 60).toFixed(1)
    : '0.0';
  const isPerfect = accuracy === 100 && attemptedCount > 0;

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
      <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-2xl w-full text-center">
        <div className="text-6xl mb-4">{isPerfect ? '🏆' : '⚡'}</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#333] mb-2">
          {isPerfect ? '完美通关！' : '时间到！'}
        </h1>
        <p className="text-lg text-gray-600 mb-6">口算速算挑战</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border-2 border-black p-4">
            <div className="text-4xl font-bold text-[#4CAF50]">{accuracy}%</div>
            <div className="text-sm text-gray-500 mt-1">正确率</div>
            <div className="text-lg font-bold text-[#333] mt-1">{correctCount}/{attemptedCount}</div>
          </div>
          <div className="bg-white border-2 border-black p-4">
            <div className="text-4xl font-bold text-[#F59E0B]">{questionsPerMinute}</div>
            <div className="text-sm text-gray-500 mt-1">每分钟题数</div>
          </div>
          <div className="bg-white border-2 border-black p-4">
            <div className="text-4xl font-bold text-[#2196F3]">{timeLimitSeconds}s</div>
            <div className="text-sm text-gray-500 mt-1">用时</div>
          </div>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="mb-8 text-left">
            <h2 className="text-xl font-bold text-[#333] mb-3 flex items-center gap-2">
              <span className="text-red-500">❌</span> 错题回顾
            </h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {wrongAnswers.map((wa, i) => (
                <div key={i} className="bg-red-50 border-2 border-red-200 rounded p-3">
                  <div className="text-sm">
                    <span className="font-bold text-[#333]">{wa.question.questionText}</span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-red-600">你的答案: {wa.userAnswer}</span>
                    <span className="text-green-600 ml-3">正确答案: {wa.question.answer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="mc-btn bg-[#4CAF50] text-white flex-1 py-3 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> 再试一次
          </button>
          <Link href="/math/speed-challenge" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> 返回设置
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SpeedResult.tsx
git commit -m "feat: add SpeedResult component with speed metrics"
```

---

### Task 6: Create Speed Challenge Config Page

**Files:**
- Create: `src/app/math/speed-challenge/page.tsx`

Config page matching the style of existing config pages (math, algebra). Three controls: time limit, max value, operation type. "开始挑战" button navigates to quiz page with URL params.

- [ ] **Step 1: Create `src/app/math/speed-challenge/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import { MobileSidebar } from '@/components/MobileSidebar';

export default function SpeedChallengePage() {
  const { t, mounted } = useTranslation();
  const router = useRouter();
  const [timeLimit, setTimeLimit] = useState<30 | 60 | 120>(60);
  const [max, setMax] = useState(20);
  const [operation, setOperation] = useState<'add' | 'sub' | 'mul' | 'mix'>('mix');

  const handleStart = () => {
    router.push(`/math/speed-challenge/quiz?timeLimit=${timeLimit}&max=${max}&operation=${operation}`);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#795548] flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const opLabel = operation === 'mix' ? '混合' : operation === 'add' ? '加法' : operation === 'sub' ? '减法' : '乘法';

  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      {/* Header */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-7xl mx-auto">
        <Link href="/math" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> {t('Common.backToMath')}
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 bg-black/40 px-4 sm:px-6 py-2 rounded-sm border-2 border-white/20 backdrop-blur-sm">
          <div className="text-3xl sm:text-4xl">⚡</div>
          <h1 className="text-2xl sm:text-4xl text-white drop-shadow-md tracking-wider">口算速算挑战</h1>
        </div>
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile Language Switcher */}
      <div className="sm:hidden mb-4 flex justify-center">
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 max-w-7xl mx-auto">
        {/* Sidebar Settings */}
        <MobileSidebar title="挑战设置">
          <div className="space-y-6 font-sans">
            {/* Time Limit */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">时间限制</label>
              <div className="flex gap-2">
                {([30, 60, 120] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setTimeLimit(sec)}
                    className={`flex-1 border-2 border-black py-2 text-sm font-bold transition-all active:translate-y-1 ${
                      timeLimit === sec
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {sec}秒
                  </button>
                ))}
              </div>
            </div>

            {/* Max Value */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">最大数值</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((num) => (
                  <button
                    key={num}
                    onClick={() => setMax(num)}
                    className={`border-2 border-black py-2 text-sm font-bold transition-all active:translate-y-1 ${
                      max === num
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Operation Type */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-[#333] uppercase">运算类型</label>
              <select
                className="w-full border-2 border-black bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono"
                value={operation}
                onChange={(e) => setOperation(e.target.value as any)}
              >
                <option value="add">加法 (+)</option>
                <option value="sub">减法 (-)</option>
                <option value="mul">乘法 (×)</option>
                <option value="mix">混合 (+/-)</option>
              </select>
            </div>

            <button
              onClick={handleStart}
              className="mc-btn w-full bg-[#9C27B0] text-white text-lg sm:text-xl hover:bg-[#7B1FA2] flex items-center justify-center gap-2 py-3"
            >
              <Zap className="h-5 w-5" /> 开始挑战
            </button>
          </div>
        </MobileSidebar>

        {/* Main Content: Preview / Info */}
        <div className="lg:col-span-3">
          <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 text-center">
            <div className="text-6xl mb-4">⚡</div>
            <h2 className="text-3xl font-bold text-[#333] mb-4">准备好了吗？</h2>
            <p className="text-gray-600 mb-6 text-lg">
              在限定时间内尽可能多地答题！
            </p>
            <div className="bg-white border-2 border-black p-4 mb-6 inline-block">
              <p className="text-xl font-bold text-[#333]">
                {timeLimit}秒 · 最大值{max} · {opLabel}
              </p>
            </div>
            <div className="text-gray-500 text-sm">
              输入答案后按 Enter 键确认，答对自动进入下一题。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/math/speed-challenge/page.tsx
git commit -m "feat: add speed challenge config page"
```

---

### Task 7: Create Speed Challenge Quiz Page

**Files:**
- Create: `src/app/math/speed-challenge/quiz/page.tsx`

This is the main quiz page. It reads config from URL params, uses `useSpeedQuiz` hook, shows `CountdownTimer`, input field, and inline `SpeedResult` when time's up.

- [ ] **Step 1: Create `src/app/math/speed-challenge/quiz/page.tsx`**

```tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SpeedQuizConfig, SpeedQuestion } from '@/lib/speed-generator';
import { useSpeedQuiz, SpeedQuizAnswer } from '@/hooks/useSpeedQuiz';
import { saveQuizSession } from '@/lib/quiz-engine';
import { useAchievements } from '@/hooks/useAchievements';
import { CountdownTimer } from '@/components/CountdownTimer';
import { SpeedResult } from '@/components/SpeedResult';
import { AchievementToast } from '@/components/AchievementToast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const defaultConfig: SpeedQuizConfig = {
  timeLimitSeconds: 60,
  max: 20,
  operation: 'mix',
};

export default function SpeedChallengeQuizPage() {
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);

  const config: SpeedQuizConfig = {
    timeLimitSeconds: (parseInt(searchParams.get('timeLimit') || '60', 10) as 30 | 60 | 120) || defaultConfig.timeLimitSeconds,
    max: parseInt(searchParams.get('max') || '20', 10) || defaultConfig.max,
    operation: (searchParams.get('operation') as SpeedQuizConfig['operation']) || defaultConfig.operation,
  };

  const quiz = useSpeedQuiz(config);
  const { pendingUnlocks, checkAndUnlock, dismissPending } = useAchievements();

  // Auto-focus input when question changes
  useEffect(() => {
    if (quiz.state === 'running' && quiz.currentQuestion && inputRef.current) {
      inputRef.current.focus();
    }
  }, [quiz.currentQuestion, quiz.state]);

  // Save session and check achievements when time's up
  useEffect(() => {
    if (quiz.state === 'timeUp' && !finished) {
      setFinished(true);

      const wrongAnswers = quiz.answers.filter((a) => !a.correct);

      saveQuizSession({
        subject: 'speed-challenge',
        timestamp: new Date().toISOString(),
        totalQuestions: quiz.attemptedCount,
        correctCount: quiz.correctCount,
        accuracy: quiz.attemptedCount > 0 ? quiz.correctCount / quiz.attemptedCount : 0,
        duration: config.timeLimitSeconds,
        answers: quiz.answers.map((a) => ({
          questionId: a.question.id,
          userAnswer: a.userAnswer,
          correct: a.correct,
        })),
      });

      checkAndUnlock();
    }
  }, [quiz.state, finished, quiz.answers, quiz.attemptedCount, quiz.correctCount, config.timeLimitSeconds, checkAndUnlock]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      quiz.submitAnswer(quiz.questionInput);
    }
  }, [quiz]);

  const handleRetry = () => {
    quiz.reset();
    setFinished(false);
    setStarted(false);
  };

  // Show result when time's up
  if (finished) {
    const wrongAnswers = quiz.answers.filter((a) => !a.correct);
    return (
      <>
        <SpeedResult
          correctCount={quiz.correctCount}
          attemptedCount={quiz.attemptedCount}
          timeLimitSeconds={config.timeLimitSeconds}
          wrongAnswers={wrongAnswers}
          onRetry={handleRetry}
        />
        {pendingUnlocks.length > 0 && (
          <AchievementToast unlocks={pendingUnlocks} onDismiss={dismissPending} />
        )}
      </>
    );
  }

  // Ready screen
  if (!started) {
    const opLabel = config.operation === 'mix' ? '混合' : config.operation === 'add' ? '加法' : config.operation === 'sub' ? '减法' : '乘法';
    return (
      <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)] flex items-center justify-center">
        <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">⚡</div>
          <h1 className="text-3xl font-bold text-[#333] mb-2">口算速算挑战</h1>
          <p className="text-gray-600 mb-6">
            {config.timeLimitSeconds}秒 · 最大值{config.max} · {opLabel}
          </p>
          <p className="text-gray-500 mb-6 text-sm">
            在限定时间内尽可能多地答题，输入答案后按 Enter 键确认。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setStarted(true)}
              className="mc-btn bg-[#9C27B0] text-white flex-1 py-3"
            >
              开始挑战
            </button>
            <Link href="/math/speed-challenge" className="mc-btn bg-white text-black flex-1 py-3 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> 返回设置
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz
  return (
    <div className="min-h-screen bg-[#795548] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 sm:p-8 font-[var(--font-pixel)]">
      {/* Header */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <Link href="/math/speed-challenge" className="mc-btn bg-white hover:bg-gray-100 flex items-center gap-2 text-base sm:text-xl w-full sm:w-auto justify-center">
          <ArrowLeft className="h-5 w-5" /> 返回设置
        </Link>
        <h1 className="text-2xl sm:text-3xl text-white drop-shadow-md">口算速算挑战</h1>
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Countdown Timer */}
        <div className="mb-6">
          <CountdownTimer
            secondsRemaining={quiz.timeRemaining}
            totalSeconds={config.timeLimitSeconds}
            state={quiz.state}
          />
        </div>

        {/* Score Display */}
        <div className="text-center mb-4">
          <span className="text-white/80 text-lg">
            已答对: <span className="text-green-400 font-bold text-2xl">{quiz.correctCount}</span> / {quiz.attemptedCount}
          </span>
        </div>

        {/* Question Card */}
        <div className="mc-card bg-white p-6 sm:p-12 mb-6">
          {quiz.currentQuestion ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-4xl sm:text-6xl font-bold text-[#333]">
                  {quiz.currentQuestion.questionText}
                </h2>
              </div>

              <div className="max-w-md mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={quiz.questionInput}
                  onChange={(e) => quiz.setQuestionInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入答案..."
                  disabled={quiz.state !== 'running'}
                  className={`w-full border-2 p-4 text-3xl text-center focus:outline-none focus:ring-2 font-sans transition-colors ${
                    quiz.feedback === 'correct'
                      ? 'border-green-500 bg-green-50 ring-green-400'
                      : quiz.feedback === 'wrong'
                      ? 'border-red-500 bg-red-50 ring-red-400'
                      : 'border-black focus:ring-[#9C27B0]'
                  }`}
                />
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 text-xl">准备中...</div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/math/speed-challenge/quiz/page.tsx
git commit -m "feat: add speed challenge quiz page with timer and input"
```

---

### Task 8: Add Entry Button to Math Page

**Files:**
- Modify: `src/app/math/page.tsx`

Add a new "⚡ 口算速算挑战" button in the sidebar, right after the existing "在线做题" button (around line 244-247).

- [ ] **Step 1: Add speed challenge button**

In `src/app/math/page.tsx`, find the block:

```tsx
{/* 在线做题按钮 */}
<Link href="/math/quiz" className="mc-btn w-full bg-[#FF9800] text-white text-lg sm:text-xl hover:bg-[#F57C00] flex items-center justify-center gap-2 py-3">
  <span>🎮 在线做题</span>
</Link>
```

Add immediately after it:

```tsx
{/* 口算速算挑战按钮 */}
<Link href="/math/speed-challenge" className="mc-btn w-full bg-[#9C27B0] text-white text-lg sm:text-xl hover:bg-[#7B1FA2] flex items-center justify-center gap-2 py-3">
  <span>⚡ 口算速算挑战</span>
</Link>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/math/page.tsx
git commit -m "feat: add speed challenge entry button to math sidebar"
```

---

### Task 9: Add i18n Translations

**Files:**
- Modify: `messages/zh.json`
- Modify: `messages/en.json`
- Modify: `src/hooks/useTranslation.ts`

- [ ] **Step 1: Add Chinese translations to `messages/zh.json`**

At the end of the JSON (before the closing `}`), add:

```json
,
  "SpeedChallenge": {
    "title": "口算速算挑战",
    "description": "在限定时间内尽可能多地答题！",
    "timeLimit": "时间限制",
    "timeLimit30s": "30秒",
    "timeLimit60s": "60秒",
    "timeLimit120s": "120秒",
    "startChallenge": "开始挑战",
    "ready": "准备好了吗？",
    "configSummary": "{time}秒 · 最大值{max} · {op}",
    "timeUp": "时间到！",
    "questionsPerMinute": "每分钟 {n} 题",
    "enterAnswer": "输入答案...",
    "retry": "再试一次",
    "backToConfig": "返回设置",
    "operationLabel": "运算类型",
    "correct": "正确!",
    "wrong": "错误!",
    "accuracy": "正确率",
    "speed": "每分钟题数",
    "timeUsed": "用时",
    "wrongReview": "错题回顾",
    "yourAnswer": "你的答案",
    "correctAnswer": "正确答案",
    "perfectComplete": "完美通关！",
    "instructions": "输入答案后按 Enter 键确认，答对自动进入下一题。"
  }
```

Note: The leading comma is needed because this is appended after the last existing key.

- [ ] **Step 2: Add English translations to `messages/en.json`**

At the end of the JSON (before the closing `}`), add:

```json
,
  "SpeedChallenge": {
    "title": "Mental Math Speed Challenge",
    "description": "Answer as many questions as you can in the time limit!",
    "timeLimit": "Time Limit",
    "timeLimit30s": "30 seconds",
    "timeLimit60s": "60 seconds",
    "timeLimit120s": "120 seconds",
    "startChallenge": "Start Challenge",
    "ready": "Ready?",
    "configSummary": "{time}s · Max {max} · {op}",
    "timeUp": "Time's Up!",
    "questionsPerMinute": "{n} questions/min",
    "enterAnswer": "Enter answer...",
    "retry": "Try Again",
    "backToConfig": "Back to Settings",
    "operationLabel": "Operation",
    "correct": "Correct!",
    "wrong": "Wrong!",
    "accuracy": "Accuracy",
    "speed": "Questions/min",
    "timeUsed": "Time Used",
    "wrongReview": "Wrong Answers",
    "yourAnswer": "Your answer",
    "correctAnswer": "Correct answer",
    "perfectComplete": "Perfect!",
    "instructions": "Type your answer and press Enter. Correct answers auto-advance."
  }
```

- [ ] **Step 3: Update `TranslationMessages` interface in `useTranslation.ts`**

In `src/hooks/useTranslation.ts`, add `SpeedChallenge` to the interface (around line 14):

```typescript
interface TranslationMessages {
  Common: Record<string, string>;
  Home: Record<string, string>;
  Math: Record<string, string>;
  Algebra: Record<string, string>;
  Chinese: Record<string, string>;
  English: Record<string, string>;
  Footer: Record<string, string>;
  SpeedChallenge: Record<string, string>;
}
```

- [ ] **Step 4: Commit**

```bash
git add messages/zh.json messages/en.json src/hooks/useTranslation.ts
git commit -m "feat: add SpeedChallenge i18n translations"
```

---

### Task 10: Add Speed Challenge Achievements

**Files:**
- Modify: `src/lib/achievement-registry.ts`
- Modify: `src/lib/achievement-engine.ts`

Add 4 new achievements: `speed-starter`, `speed-demon`, `lightning-10`, `math-sharpshooter`.

- [ ] **Step 1: Add achievements to registry**

In `src/lib/achievement-registry.ts`, add after the `collector-10` entry (before the closing `];`):

```typescript
  // === Speed Challenge ===
  {
    id: 'speed-starter',
    name: '速算新手',
    description: '完成第一次口算速算挑战',
    icon: '⚡',
    category: 'milestone',
    check: (stats) => stats.subjectStats['speed-challenge'].sessions >= 1,
    progressLabel: (stats) => `${stats.subjectStats['speed-challenge'].sessions}/1`,
    progressValue: (stats) => Math.min(stats.subjectStats['speed-challenge'].sessions, 1),
    progressMax: 1,
  },
  {
    id: 'speed-demon',
    name: '速算达人',
    description: '完成 10 次口算速算挑战',
    icon: '💨',
    category: 'milestone',
    check: (stats) => stats.subjectStats['speed-challenge'].sessions >= 10,
    progressLabel: (stats) => `${stats.subjectStats['speed-challenge'].sessions}/10`,
    progressValue: (stats) => Math.min(stats.subjectStats['speed-challenge'].sessions, 10),
    progressMax: 10,
  },
  {
    id: 'lightning-10',
    name: '闪电十题',
    description: '在60秒内答对10题',
    icon: '🌩️',
    category: 'perfect',
    check: () => false, // handled specially in engine
    progressLabel: () => '在60秒挑战中达到10题',
    progressValue: () => 0,
    progressMax: 1,
  },
  {
    id: 'math-sharpshooter',
    name: '数学神射手',
    description: '数学类（含速算）累计做对 1000 题',
    icon: '🎯',
    category: 'perfect',
    check: (stats) =>
      stats.subjectStats.math.correct +
      stats.subjectStats['speed-challenge'].correct >= 1000,
    progressLabel: (stats) => {
      const total = stats.subjectStats.math.correct + stats.subjectStats['speed-challenge'].correct;
      return `${total}/1000`;
    },
    progressValue: (stats) => {
      const total = stats.subjectStats.math.correct + stats.subjectStats['speed-challenge'].correct;
      return Math.min(total, 1000);
    },
    progressMax: 1000,
  },
```

- [ ] **Step 2: Add special check for `lightning-10` in achievement engine**

In `src/lib/achievement-engine.ts`, in the `evaluateAchievements` function, add a check for `lightning-10` alongside the existing special checks for `seven-day-warrior` and `triple-perfect` (around line 35-40):

```typescript
    if (achievement.id === 'seven-day-warrior') {
      isUnlocked = consecutiveDays >= 7;
    }
    else if (achievement.id === 'triple-perfect') {
      isUnlocked = checkTriplePerfect();
    }
    else if (achievement.id === 'lightning-10') {
      isUnlocked = checkLightning10();
    }
    else if (achievement.category === 'collection') {
```

Then add the helper function at the bottom of the file (after `checkTriplePerfect`):

```typescript
function checkLightning10(): boolean {
  const sessions = getAllQuizSessions();
  return sessions.some(
    (s) =>
      s.subject === 'speed-challenge' &&
      s.correctCount >= 10 &&
      s.duration <= 60,
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/achievement-registry.ts src/lib/achievement-engine.ts
git commit -m "feat: add speed challenge achievements"
```

---

### Task 11: Verification

- [ ] **Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No new errors related to speed challenge code. Existing pre-existing errors are OK.

- [ ] **Step 2: Build the project**

Run: `npm run build`
Expected: Build succeeds without errors.

- [ ] **Step 3: Manual test flow**

1. `npm run dev` — start dev server
2. Visit `http://localhost:3000/math` — confirm "⚡ 口算速算挑战" button visible in sidebar
3. Click button — confirm config page loads with time/max/operation controls
4. Select 60s / max 20 / mix — click "开始挑战"
5. Confirm ready screen shows config summary
6. Click "开始挑战" — confirm countdown starts, first question appears
7. Type answer + Enter — confirm instant feedback (green flash for correct, red for wrong), auto next question
8. Wait for timer to reach 0 — confirm "TIME UP!" and result page shows
9. Verify result shows: correct count, accuracy %, questions per minute, wrong answer review
10. Click "再试一次" — confirm resets to ready screen
11. Visit `/history` — confirm speed challenge session appears in stats
12. Visit `/achievements` — confirm speed achievements show progress

- [ ] **Step 4: Run lint**

Run: `npm run lint`
Expected: No lint errors.

---

## Self-Review

### 1. Spec Coverage Check

| Spec Section | Covered In Task |
|-------------|----------------|
| Route structure `/math/speed-challenge/` | Tasks 6, 7 |
| Config page (time/max/op) | Task 6 |
| Quiz page with countdown | Task 7 |
| Session storage reuse | Task 7 (`saveQuizSession`) |
| `CountdownTimer` component | Task 4 |
| `SpeedResult` component | Task 5 |
| Input-based answering + Enter key | Task 7 |
| Speed metrics (questions/minute) | Task 5 |
| Extend `QuizSubject` | Task 1 |
| Extend `stats-aggregator` | Task 1 |
| Extend `wrong-answers.ts` | Task 1 |
| Entry button on math page | Task 8 |
| i18n translations | Task 9 |
| 4 new achievements | Task 10 |
| No PDF export | Task 5 (no PDF button in `SpeedResult`) |

All spec requirements covered.

### 2. Placeholder Scan

No TBD, TODO, "fill in later", or vague instructions found. Every step contains complete code.

### 3. Type Consistency

- `SpeedQuizConfig` defined in Task 2, used in Tasks 3, 6, 7 — consistent
- `SpeedQuestion` defined in Task 2, used in Tasks 3, 5, 7 — consistent
- `SpeedQuizAnswer` defined in Task 3, used in Tasks 5, 7 — consistent
- `'speed-challenge'` string used consistently in Tasks 1, 7, 10
- `QuizSubject` extended in Task 1, enables type-safe usage in all downstream files
- `SpeedResult` receives `wrongAnswers: SpeedQuizAnswer[]` from Task 7's filter — types match

### 4. Scope Check

Plan covers one focused feature. Each task produces working, independently testable changes. Tasks 1-5 can be verified before Task 6-7 pages exist.
