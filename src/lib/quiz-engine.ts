import { generateMathQuestions, MathConfig, MathQuestion } from './math-generator';
import { generateAlgebraQuestions, AlgebraConfig, AlgebraQuestion, McItem } from './algebra-generator';
import { generatePoemExercises, PoemConfig, PoemExercise } from './poem-generator';
import { Poem, PoemLine } from './poem-data';

// ── Subject union ────────────────────────────────────────────────────────────

export type QuizSubject = 'math' | 'algebra' | 'chinese-poem' | 'english';

// ── Question types ───────────────────────────────────────────────────────────

export type MathQuizQuestion = {
  id: string;
  questionText: string;
  options: [string, string, string, string];
  correctIndex: number;
  num1: number;
  num2: number;
  operator: '+' | '-' | '×' | '÷';
};

export type AlgebraQuizQuestion = {
  id: string;
  questionText: string;
  options: [string, string, string, string];
  correctIndex: number;
  items: { item: McItem; quantity: number }[];
  total: number;
};

export type ChineseQuizBlank = {
  lineIndex: number;
  charIndex: number;
  correctAnswer: string;
  hint: string;
};

export type ChineseQuizQuestion = {
  id: string;
  poem: Poem;
  blanks: ChineseQuizBlank[];
};

export type EnglishQuizQuestion = {
  id: string;
  word: string;
  hint: string;
};

// ── Session types ────────────────────────────────────────────────────────────

export type QuizAnswer = {
  questionId: string;
  userAnswer: string;
  correct: boolean;
};

export type QuizSession = {
  id: string;
  subject: QuizSubject;
  timestamp: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  duration: number;
  answers: QuizAnswer[];
};

// ── Distractor generation ────────────────────────────────────────────────────

export function generateNumericDistractors(
  answer: number,
  num1: number,
  num2: number,
  operator: string,
): string[] {
  const distractors = new Set<string>();
  const candidates: number[] = [];

  // Offset by ±1
  candidates.push(answer + 1, answer - 1);

  // Offset by ±10
  candidates.push(answer + 10, answer - 10);

  // Digit swap (for two-digit numbers)
  if (answer >= 10 && answer <= 99) {
    const tens = Math.floor(answer / 10);
    const ones = answer % 10;
    if (ones !== 0) {
      candidates.push(ones * 10 + tens);
    }
  }

  // Wrong operation
  if (operator === '+') {
    candidates.push(num1 - num2, num1 * num2);
  } else if (operator === '-') {
    candidates.push(num1 + num2, num2 - num1);
  } else if (operator === '×') {
    candidates.push(num1 + num2, num1 - num2);
  }

  // Off-by-2 as fallback
  candidates.push(answer + 2, answer - 2);

  for (const n of candidates) {
    if (n !== answer && n >= 0 && !distractors.has(String(n))) {
      distractors.add(String(n));
    }
  }

  // Fill remaining slots with random offsets if needed
  let offset = 3;
  while (distractors.size < 3) {
    const candidate = answer + offset;
    if (candidate !== answer && candidate >= 0) {
      distractors.add(String(candidate));
    }
    offset++;
  }

  return Array.from(distractors).slice(0, 3);
}

// ── Shuffle utility ──────────────────────────────────────────────────────────

/** Fisher-Yates shuffle. The first element (index 0) is treated as the correct answer. Returns shuffled array + new index of the correct item. */
export function shuffleOptions<T>(options: T[]): {
  shuffled: T[];
  correctIndex: number;
} {
  if (options.length === 0) return { shuffled: [], correctIndex: -1 };

  const correct = options[0];
  const arr = [...options];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return {
    shuffled: arr,
    correctIndex: arr.indexOf(correct),
  };
}

// ── Math quiz generation ─────────────────────────────────────────────────────

export function generateMathQuizQuestions(config: MathConfig): MathQuizQuestion[] {
  const base = generateMathQuestions(config);

  return base.map((q: MathQuestion) => {
    const questionText = `${q.num1} ${q.operator} ${q.num2} = ?`;
    const correctStr = String(q.answer);

    const distractors = generateNumericDistractors(q.answer, q.num1, q.num2, q.operator);

    const allOptions: string[] = [correctStr, ...distractors.slice(0, 3)];

    // Pad with extra distractors if we somehow got fewer than 3
    while (allOptions.length < 4) {
      const fallback = String(q.answer + allOptions.length + 1);
      if (!allOptions.includes(fallback)) {
        allOptions.push(fallback);
      }
    }

    const { shuffled, correctIndex } = shuffleOptions(allOptions);

    return {
      id: `math-${q.id}`,
      questionText,
      options: shuffled as [string, string, string, string],
      correctIndex,
      num1: q.num1,
      num2: q.num2,
      operator: q.operator,
    };
  });
}

// ── Algebra quiz generation ──────────────────────────────────────────────────

export function generateAlgebraQuizQuestions(config: AlgebraConfig): {
  questions: AlgebraQuizQuestion[];
  itemSets: McItem[][];
} {
  const { questions, itemSets } = generateAlgebraQuestions(config);

  const quizQuestions = questions.map((q: AlgebraQuestion) => {
    const correctStr = String(q.total);

    // Generate distractors by varying the total
    const distractors = new Set<string>();
    const candidates = [
      q.total + 1,
      q.total - 1,
      q.total + 10,
      q.total - 10,
      q.total + 2,
      q.total - 2,
    ];

    // Also vary individual item prices * quantities
    for (const entry of q.items) {
      const subTotal = entry.item.price * entry.quantity;
      candidates.push(q.total - subTotal + subTotal + 1);
      candidates.push(q.total - subTotal + Math.max(0, subTotal - 1));
    }

    for (const n of candidates) {
      if (n !== q.total && n >= 0 && !distractors.has(String(n))) {
        distractors.add(String(n));
      }
    }

    let offset = 3;
    while (distractors.size < 3) {
      const candidate = q.total + offset;
      if (candidate !== q.total && candidate >= 0) {
        distractors.add(String(candidate));
      }
      offset++;
    }

    const currency = config.language === 'zh' ? '元' : '$';
    const allOptions: string[] = [`${correctStr}${currency}`];
    const distractorNums = Array.from(distractors).slice(0, 3);
    for (const d of distractorNums) {
      allOptions.push(`${d}${currency}`);
    }

    while (allOptions.length < 4) {
      const fallback = `${q.total + allOptions.length + 1}${currency}`;
      if (!allOptions.includes(fallback)) {
        allOptions.push(fallback);
      }
    }

    const { shuffled, correctIndex } = shuffleOptions(allOptions);

    const expression = q.expression;
    const questionText = `${expression} = ?`;

    return {
      id: `alg-${q.id}`,
      questionText,
      options: shuffled as [string, string, string, string],
      correctIndex,
      items: q.items,
      total: q.total,
    };
  });

  return { questions: quizQuestions, itemSets };
}

// ── Chinese poem quiz generation ─────────────────────────────────────────────

export function generateChineseQuizQuestions(config: PoemConfig): ChineseQuizQuestion[] {
  const exercises = generatePoemExercises(config);

  return exercises.map((ex) => {
    const blanks: ChineseQuizBlank[] = [];

    ex.poem.lines.forEach((line: PoemLine, lineIndex: number) => {
      for (const charIndex of line.blanks) {
        if (charIndex < line.text.length) {
          const correctAnswer = line.text[charIndex];
          blanks.push({
            lineIndex,
            charIndex,
            correctAnswer,
            hint: `第 ${lineIndex + 1} 句第 ${charIndex + 1} 个字`,
          });
        }
      }
    });

    return {
      id: ex.id,
      poem: ex.poem,
      blanks,
    };
  });
}

// ── English quiz generation ──────────────────────────────────────────────────

export function generateEnglishQuizQuestions(words: string[]): EnglishQuizQuestion[] {
  return words.map((word) => {
    const cleaned = word.trim();
    let hint: string;

    if (cleaned.length <= 2) {
      hint = cleaned;
    } else {
      const first = cleaned[0];
      const last = cleaned[cleaned.length - 1];
      const masked = '_ '.repeat(cleaned.length - 2).trim();
      hint = `${first} ${masked} ${last}`;
    }

    return {
      id: `en-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      word: cleaned,
      hint,
    };
  });
}

// ── Answer checking ──────────────────────────────────────────────────────────

export function checkAnswer(
  userAnswer: string,
  correctAnswer: string,
  type: 'numeric' | 'chinese' | 'english',
): boolean {
  switch (type) {
    case 'numeric': {
      return parseInt(userAnswer, 10) === parseInt(correctAnswer, 10);
    }
    case 'chinese': {
      return userAnswer.trim() === correctAnswer.trim();
    }
    case 'english': {
      return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    }
  }
}

// ── Session persistence ──────────────────────────────────────────────────────

const STORAGE_KEY = 'duomi-quiz-sessions';

export function saveQuizSession(session: Omit<QuizSession, 'id'>): QuizSession {
  const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullSession: QuizSession = { ...session, id };

  try {
    const existing = getAllQuizSessions();
    existing.push(fullSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // localStorage not available or quota exceeded
  }

  return fullSession;
}

export function getAllQuizSessions(): QuizSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as QuizSession[];
  } catch {
    return [];
  }
}
