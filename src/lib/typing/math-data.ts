/**
 * Math problem generators for Keyboard Defender typing game.
 *
 * Designed for Grade 1-2 students:
 * - 20以内加减法 (Within 20: add/sub/mix)
 * - 50以内加减法 (Within 50: add/sub/mix)
 * - 100以内加减法 (Within 100: add/sub/mix)
 *
 * The player sees the equation (e.g. "8 + 7 = ?") and types the numerical answer (e.g. "15").
 */

import type { TypingTarget } from './lessons';

export type MathLessonId =
  | 'math-add-10'
  | 'math-sub-10'
  | 'math-mix-20'
  | 'math-add-20'
  | 'math-sub-20'
  | 'math-add-50'
  | 'math-sub-50'
  | 'math-mix-50'
  | 'math-add-100'
  | 'math-sub-100'
  | 'math-mix-100';

export interface MathLessonDef {
  id: MathLessonId;
  titleKey: string;
  icon: string;
  descriptionKey: string;
  range: number;
  type: 'add' | 'sub' | 'mix';
}

export const MATH_LESSONS: MathLessonDef[] = [
  {
    id: 'math-add-10',
    titleKey: 'Typing.math.add10',
    icon: '➕',
    descriptionKey: 'Typing.math.add10Desc',
    range: 10,
    type: 'add',
  },
  {
    id: 'math-sub-10',
    titleKey: 'Typing.math.sub10',
    icon: '➖',
    descriptionKey: 'Typing.math.sub10Desc',
    range: 10,
    type: 'sub',
  },
  {
    id: 'math-mix-20',
    titleKey: 'Typing.math.mix20',
    icon: '🧮',
    descriptionKey: 'Typing.math.mix20Desc',
    range: 20,
    type: 'mix',
  },
  {
    id: 'math-add-20',
    titleKey: 'Typing.math.add20',
    icon: '➕',
    descriptionKey: 'Typing.math.add20Desc',
    range: 20,
    type: 'add',
  },
  {
    id: 'math-sub-20',
    titleKey: 'Typing.math.sub20',
    icon: '➖',
    descriptionKey: 'Typing.math.sub20Desc',
    range: 20,
    type: 'sub',
  },
  {
    id: 'math-mix-50',
    titleKey: 'Typing.math.mix50',
    icon: '⚡',
    descriptionKey: 'Typing.math.mix50Desc',
    range: 50,
    type: 'mix',
  },
  {
    id: 'math-add-50',
    titleKey: 'Typing.math.add50',
    icon: '➕',
    descriptionKey: 'Typing.math.add50Desc',
    range: 50,
    type: 'add',
  },
  {
    id: 'math-sub-50',
    titleKey: 'Typing.math.sub50',
    icon: '➖',
    descriptionKey: 'Typing.math.sub50Desc',
    range: 50,
    type: 'sub',
  },
  {
    id: 'math-mix-100',
    titleKey: 'Typing.math.mix100',
    icon: '👑',
    descriptionKey: 'Typing.math.mix100Desc',
    range: 100,
    type: 'mix',
  },
  {
    id: 'math-add-100',
    titleKey: 'Typing.math.add100',
    icon: '➕',
    descriptionKey: 'Typing.math.add100Desc',
    range: 100,
    type: 'add',
  },
  {
    id: 'math-sub-100',
    titleKey: 'Typing.math.sub100',
    icon: '➖',
    descriptionKey: 'Typing.math.sub100Desc',
    range: 100,
    type: 'sub',
  },
];

export function getMathLesson(id: string | null): MathLessonDef {
  return MATH_LESSONS.find((l) => l.id === id) ?? MATH_LESSONS[2]; // default to 20以内混合
}

/**
 * Random integer between min and max inclusive.
 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates an equation based on range and operator type.
 */
function generateEquation(range: number, type: 'add' | 'sub' | 'mix'): { expr: string; ans: number } {
  const op = type === 'mix' ? (Math.random() < 0.5 ? '+' : '-') : type === 'add' ? '+' : '-';

  if (op === '+') {
    let a: number;
    let b: number;
    if (range <= 10) {
      a = randInt(1, 9);
      b = randInt(1, 10 - a);
    } else if (range <= 20) {
      a = randInt(2, 18);
      b = randInt(1, 20 - a);
    } else if (range <= 50) {
      a = randInt(5, 45);
      b = randInt(1, 50 - a);
    } else {
      a = randInt(10, 89);
      b = randInt(1, 100 - a);
    }
    return { expr: `${a} + ${b} =`, ans: a + b };
  } else {
    let a: number;
    let b: number;
    if (range <= 10) {
      a = randInt(2, 10);
      b = randInt(1, a);
    } else if (range <= 20) {
      a = randInt(5, 20);
      b = randInt(1, a);
    } else if (range <= 50) {
      a = randInt(10, 50);
      b = randInt(1, a);
    } else {
      a = randInt(20, 100);
      b = randInt(1, a);
    }
    return { expr: `${a} - ${b} =`, ans: a - b };
  }
}

/**
 * Generates a typing target for math lessons.
 */
export function pickMathTarget(lessonId: string, exclude: Set<string>): TypingTarget {
  const lesson = getMathLesson(lessonId);

  // Attempt up to 20 times to pick an equation whose answer isn't in exclude
  for (let attempt = 0; attempt < 20; attempt++) {
    const { expr, ans } = generateEquation(lesson.range, lesson.type);
    const answerStr = String(ans);
    if (!exclude.has(answerStr)) {
      return {
        display: expr,
        answer: answerStr,
        hint: `输入答案数字: ${answerStr}`,
      };
    }
  }

  const fallback = generateEquation(lesson.range, lesson.type);
  return {
    display: fallback.expr,
    answer: String(fallback.ans),
    hint: `输入答案数字: ${fallback.ans}`,
  };
}

/**
 * Generates a Boss wave target (3-part continuous math chain, or large number)
 */
export function makeMathBossTarget(lessonId: string): TypingTarget {
  const lesson = getMathLesson(lessonId);

  if (lesson.range <= 20) {
    // 3 numbers: a + b - c or a - b + c
    const a = randInt(8, 15);
    const b = randInt(2, 5);
    const c = randInt(1, 5);
    const ans = a + b - c;
    return {
      display: `${a} + ${b} - ${c} =`,
      answer: String(ans),
      hint: `末影龙挑战: 算算最终答案！`,
    };
  } else {
    // Within 50 / 100
    const a = randInt(20, lesson.range - 10);
    const b = randInt(5, 15);
    const ans = a + b;
    return {
      display: `BOSS: ${a} + ${b} =`,
      answer: String(ans),
      hint: `末影龙终极挑战！`,
    };
  }
}
