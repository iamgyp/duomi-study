/**
 * Seeded random number generator for deterministic daily challenges.
 * Uses a simple mulberry32 algorithm.
 */

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTodaySeed(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export interface DailyChallenge {
  date: string;
  questions: Array<{
    questionText: string;
    options: [string, string, string, string];
    correctIndex: number;
  }>;
  timeLimitSeconds: number;
}

export function generateDailyChallenge(): DailyChallenge {
  const today = getTodaySeed();
  const rng = mulberry32(dateSeed(today));

  const questionCount = 10;
  const timeLimit = 60;
  const questions: DailyChallenge['questions'] = [];

  const ops = ['+', '-', '×', '÷'] as const;

  for (let i = 0; i < questionCount; i++) {
    const op = ops[Math.floor(rng() * ops.length)];
    let num1: number, num2: number, answer: number;

    if (op === '+') {
      num1 = Math.floor(rng() * 20) + 1;
      num2 = Math.floor(rng() * (20 - num1)) + 1;
      answer = num1 + num2;
    } else if (op === '-') {
      num1 = Math.floor(rng() * 20) + 1;
      num2 = Math.floor(rng() * num1) + 1;
      answer = num1 - num2;
    } else if (op === '×') {
      num1 = Math.floor(rng() * 9) + 1;
      num2 = Math.floor(rng() * 9) + 1;
      answer = num1 * num2;
    } else {
      num2 = Math.floor(rng() * 9) + 1;
      answer = Math.floor(rng() * 9) + 1;
      num1 = num2 * answer;
    }

    const questionText = `${num1} ${op} ${num2} = ?`;

    // Generate wrong options
    const wrongAnswers = new Set<number>();
    wrongAnswers.add(answer + 1);
    wrongAnswers.add(answer - 1);
    wrongAnswers.add(answer + Math.floor(rng() * 5) + 2);
    // Ensure we have at least 3 wrong unique answers
    let offset = 2;
    while (wrongAnswers.size < 3) {
      wrongAnswers.add(answer + offset);
      offset++;
    }
    // Remove negative and the correct answer
    wrongAnswers.delete(answer);
    const wrongArr = [...wrongAnswers].filter(a => a >= 0).slice(0, 3);
    // Fill if needed
    while (wrongArr.length < 3) {
      wrongArr.push(answer + wrongArr.length + 5);
    }

    const options: string[] = [String(answer), ...wrongArr.slice(0, 3).map(String)];
    // Shuffle options
    for (let j = options.length - 1; j > 0; j--) {
      const k = Math.floor(rng() * (j + 1));
      [options[j], options[k]] = [options[k], options[j]];
    }
    const correctIndex = options.indexOf(String(answer));

    questions.push({
      questionText,
      options: options as [string, string, string, string],
      correctIndex,
    });
  }

  return { date: today, questions, timeLimitSeconds: timeLimit };
}

// Daily challenge completion tracking
const DAILY_STORAGE_KEY = 'duomi-daily-challenges';

export interface DailyResult {
  date: string;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  timeUsed: number; // seconds used out of limit
}

function loadDailyResults(): Record<string, DailyResult> {
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDailyResult(result: DailyResult): void {
  const results = loadDailyResults();
  results[result.date] = result;
  localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(results));
}

export function getDailyResult(date?: string): DailyResult | null {
  const results = loadDailyResults();
  return results[date || getTodaySeed()] || null;
}

export function getAllDailyResults(): DailyResult[] {
  return Object.values(loadDailyResults()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getDailyStreak(): number {
  const results = loadDailyResults();
  const dates = Object.keys(results).sort().reverse();
  if (dates.length === 0) return 0;

  let streak = 0;
  let expected = new Date();

  // Check if today has a result, if not start from yesterday
  if (!results[getTodaySeed()]) {
    expected.setDate(expected.getDate() - 1);
  }

  for (const date of dates) {
    const expectedStr = expected.toISOString().slice(0, 10);
    if (date === expectedStr) {
      streak++;
      expected.setDate(expected.getDate() - 1);
    } else if (date < expectedStr) {
      break;
    }
  }

  return streak;
}
