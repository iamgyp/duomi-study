/**
 * Math problem generators for Keyboard Defender typing game.
 *
 * Focuses purely on Mixed Addition and Subtraction (混合加减法):
 * - 10以内混合加减法 (Within 10: mixed addition & subtraction)
 * - 20以内混合加减法 (Within 20: mixed addition & subtraction, Grade 1 focus)
 * - 50以内混合加减法 (Within 50: mixed addition & subtraction)
 * - 100以内混合加减法 (Within 100: mixed addition & subtraction, Grade 2 focus)
 *
 * The player sees the equation (e.g. "8 + 7 =") and types the numerical answer (e.g. "15").
 */

import type { TypingTarget } from './lessons';

export type MathLessonId =
  | 'math-mix-10'
  | 'math-mix-20'
  | 'math-mix-50'
  | 'math-mix-100';

export interface MathLessonDef {
  id: MathLessonId;
  titleKey: string;
  icon: string;
  descriptionKey: string;
  range: number;
}

export const MATH_LESSONS: MathLessonDef[] = [
  {
    id: 'math-mix-10',
    titleKey: 'Typing.math.mix10',
    icon: '🌱',
    descriptionKey: 'Typing.math.mix10Desc',
    range: 10,
  },
  {
    id: 'math-mix-20',
    titleKey: 'Typing.math.mix20',
    icon: '🧮',
    descriptionKey: 'Typing.math.mix20Desc',
    range: 20,
  },
  {
    id: 'math-mix-50',
    titleKey: 'Typing.math.mix50',
    icon: '⚡',
    descriptionKey: 'Typing.math.mix50Desc',
    range: 50,
  },
  {
    id: 'math-mix-100',
    titleKey: 'Typing.math.mix100',
    icon: '👑',
    descriptionKey: 'Typing.math.mix100Desc',
    range: 100,
  },
];

export function getMathLesson(id: string | null): MathLessonDef {
  return MATH_LESSONS.find((l) => l.id === id) ?? MATH_LESSONS[1]; // default to 20以内混合
}

/**
 * Random integer between min and max inclusive.
 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a mixed addition/subtraction equation based on numeric range.
 */
function generateMixedEquation(range: number): { expr: string; ans: number } {
  const isAdd = Math.random() < 0.5;

  if (isAdd) {
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
    const { expr, ans } = generateMixedEquation(lesson.range);
    const answerStr = String(ans);
    if (!exclude.has(answerStr)) {
      return {
        display: expr,
        answer: answerStr,
        hideAnswerPreview: true,
      };
    }
  }

  const fallback = generateMixedEquation(lesson.range);
  return {
    display: fallback.expr,
    answer: String(fallback.ans),
    hideAnswerPreview: true,
  };
}

/**
 * Generates a Boss wave target (3-part continuous math chain, or large number)
 */
export function makeMathBossTarget(lessonId: string): TypingTarget {
  const lesson = getMathLesson(lessonId);

  if (lesson.range <= 10) {
    const a = randInt(4, 7);
    const b = randInt(1, 3);
    const c = randInt(1, 2);
    const ans = a + b - c;
    return {
      display: `${a} + ${b} - ${c} =`,
      answer: String(ans),
      hideAnswerPreview: true,
    };
  } else if (lesson.range <= 20) {
    // 3 numbers: a + b - c
    const a = randInt(8, 15);
    const b = randInt(2, 5);
    const c = randInt(1, 5);
    const ans = a + b - c;
    return {
      display: `${a} + ${b} - ${c} =`,
      answer: String(ans),
      hideAnswerPreview: true,
    };
  } else {
    // Within 50 / 100
    const a = randInt(20, lesson.range - 10);
    const b = randInt(5, 15);
    const ans = a + b;
    return {
      display: `BOSS: ${a} + ${b} =`,
      answer: String(ans),
      hideAnswerPreview: true,
    };
  }
}
