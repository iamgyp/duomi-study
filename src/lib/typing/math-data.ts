/**
 * Math problem generators for Keyboard Defender typing game.
 *
 * De-emphasizes grade levels and provides comprehensive elementary mental math:
 * 1. 基础加减 (10以内 / 20以内进退位 / 50以内 / 100以内)
 * 2. 小学乘除 (九九表内乘法 / 表内除法 / 乘除混合 / 四则大满贯)
 *
 * The player sees the equation (e.g. "7 × 8 =" or "56 ÷ 7 =") and types the numerical answer (e.g. "56" or "8").
 */

import type { TypingTarget } from './lessons';

export type MathLessonId =
  | 'math-mix-10'
  | 'math-mix-20'
  | 'math-mix-50'
  | 'math-mix-100'
  | 'math-mul-9x9'
  | 'math-div-9x9'
  | 'math-mul-div-mix'
  | 'math-all-mix';

export interface MathLessonDef {
  id: MathLessonId;
  title: string;
  category: 'add-sub' | 'mul-div' | 'all';
  categoryLabel: string;
  icon: string;
  description: string;
  badge: string;
}

export const MATH_LESSONS: MathLessonDef[] = [
  // ── 加减心算进阶 ──────────────────────────────────────────
  {
    id: 'math-mix-10',
    title: '10以内加减法',
    category: 'add-sub',
    categoryLabel: '基础启蒙',
    icon: '🌱',
    description: '一位数加法与减法混合速算，打牢心算肌肉记忆',
    badge: '➕➖ 范围≤10',
  },
  {
    id: 'math-mix-20',
    title: '20以内进退位加减',
    category: 'add-sub',
    categoryLabel: '核心速算',
    icon: '🧮',
    description: '进位加法与退位减法核心专项，锻炼灵活反应',
    badge: '➕➖ 进退位',
  },
  {
    id: 'math-mix-50',
    title: '50以内两位数加减',
    category: 'add-sub',
    categoryLabel: '进阶强化',
    icon: '⚡',
    description: '两位数与一位数/两位数混合加减速算对抗',
    badge: '➕➖ 两位数',
  },
  {
    id: 'math-mix-100',
    title: '100以内加减法对抗',
    category: 'add-sub',
    categoryLabel: '百数对决',
    icon: '👑',
    description: '百以内进退位混合终极速度对抗，挑战极限手速',
    badge: '➕➖ 范围≤100',
  },

  // ── 小学乘除速算 ──────────────────────────────────────────
  {
    id: 'math-mul-9x9',
    title: '九九表内乘法',
    category: 'mul-div',
    categoryLabel: '乘法专项',
    icon: '✖️',
    description: '1~9 乘法口诀经典心算，快速击破前方怪物',
    badge: '✖️ 表内乘法',
  },
  {
    id: 'math-div-9x9',
    title: '九九表内除法',
    category: 'mul-div',
    categoryLabel: '除法专项',
    icon: '➗',
    description: '乘法口诀逆运算，整除求商秒杀强敌',
    badge: '➗ 表内整除',
  },
  {
    id: 'math-mul-div-mix',
    title: '乘除法双向混合',
    category: 'mul-div',
    categoryLabel: '乘除冲关',
    icon: '⚔️',
    description: '乘法与除法随机交替对抗，考验极速切换思维',
    badge: '✖️➗ 乘除双向',
  },
  {
    id: 'math-all-mix',
    title: '四则运算大满贯',
    category: 'all',
    categoryLabel: '全能决战',
    icon: '🏆',
    description: '加减乘除四则运算全面混合，成为神算守卫者！',
    badge: '➕➖✖️➗ 全能',
  },
];

export function getMathLesson(id: string | null): MathLessonDef {
  return MATH_LESSONS.find((l) => l.id === id) ?? MATH_LESSONS[1];
}

/**
 * 产生 [min, max] 之间的随机整数
 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 加减混合算式生成
 */
function generateAddSubEquation(range: number): { expr: string; ans: number } {
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
 * 表内乘法生成 (1~9)
 */
function generateMultiplicationEquation(): { expr: string; ans: number } {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  return { expr: `${a} × ${b} =`, ans: a * b };
}

/**
 * 表内除法生成 (整除)
 */
function generateDivisionEquation(): { expr: string; ans: number } {
  const divisor = randInt(2, 9);
  const quotient = randInt(2, 9);
  const dividend = divisor * quotient;
  return { expr: `${dividend} ÷ ${divisor} =`, ans: quotient };
}

/**
 * 依据 lessonId 生成对应算式
 */
function generateEquationByLesson(lessonId: MathLessonId): { expr: string; ans: number } {
  switch (lessonId) {
    case 'math-mix-10':
      return generateAddSubEquation(10);
    case 'math-mix-20':
      return generateAddSubEquation(20);
    case 'math-mix-50':
      return generateAddSubEquation(50);
    case 'math-mix-100':
      return generateAddSubEquation(100);
    case 'math-mul-9x9':
      return generateMultiplicationEquation();
    case 'math-div-9x9':
      return generateDivisionEquation();
    case 'math-mul-div-mix':
      return Math.random() < 0.5
        ? generateMultiplicationEquation()
        : generateDivisionEquation();
    case 'math-all-mix': {
      const r = Math.random();
      if (r < 0.3) return generateMultiplicationEquation();
      if (r < 0.6) return generateDivisionEquation();
      if (r < 0.8) return generateAddSubEquation(20);
      return generateAddSubEquation(50);
    }
    default:
      return generateAddSubEquation(20);
  }
}

/**
 * 为游戏引擎挑选下一个数学目标
 */
export function pickMathTarget(lessonId: string, exclude: Set<string>): TypingTarget {
  const validLessonId = (
    MATH_LESSONS.some((l) => l.id === lessonId) ? lessonId : 'math-mix-20'
  ) as MathLessonId;

  // 尝试生成未被当前屏幕占用的答案
  for (let attempt = 0; attempt < 20; attempt++) {
    const { expr, ans } = generateEquationByLesson(validLessonId);
    const answerStr = String(ans);
    if (!exclude.has(answerStr)) {
      return {
        display: expr,
        answer: answerStr,
        hideAnswerPreview: true,
      };
    }
  }

  const fallback = generateEquationByLesson(validLessonId);
  return {
    display: fallback.expr,
    answer: String(fallback.ans),
    hideAnswerPreview: true,
  };
}

/**
 * 为末影龙 BOSS 战生成综合连续混合算式
 */
export function makeMathBossTarget(lessonId: string): TypingTarget {
  const validLessonId = (
    MATH_LESSONS.some((l) => l.id === lessonId) ? lessonId : 'math-mix-20'
  ) as MathLessonId;

  switch (validLessonId) {
    case 'math-mix-10': {
      const a = randInt(4, 7);
      const b = randInt(1, 3);
      const c = randInt(1, 2);
      return {
        display: `${a} + ${b} - ${c} =`,
        answer: String(a + b - c),
        hideAnswerPreview: true,
      };
    }
    case 'math-mix-20': {
      const a = randInt(8, 14);
      const b = randInt(2, 6);
      const c = randInt(1, 5);
      return {
        display: `${a} + ${b} - ${c} =`,
        answer: String(a + b - c),
        hideAnswerPreview: true,
      };
    }
    case 'math-mix-50':
    case 'math-mix-100': {
      const a = randInt(25, 60);
      const b = randInt(10, 25);
      return {
        display: `BOSS: ${a} + ${b} =`,
        answer: String(a + b),
        hideAnswerPreview: true,
      };
    }
    case 'math-mul-9x9': {
      // 乘加连算：a × b + c
      const a = randInt(2, 6);
      const b = randInt(2, 6);
      const c = randInt(2, 8);
      const ans = a * b + c;
      return {
        display: `BOSS: ${a} × ${b} + ${c} =`,
        answer: String(ans),
        hideAnswerPreview: true,
      };
    }
    case 'math-div-9x9': {
      // 除加连算：a ÷ b + c
      const b = randInt(2, 6);
      const q = randInt(3, 8);
      const a = b * q;
      const c = randInt(2, 9);
      const ans = q + c;
      return {
        display: `BOSS: ${a} ÷ ${b} + ${c} =`,
        answer: String(ans),
        hideAnswerPreview: true,
      };
    }
    case 'math-mul-div-mix': {
      // 连乘除：a × b ÷ c
      const a = randInt(2, 6);
      const c = 2;
      const b = c * randInt(2, 4);
      const ans = (a * b) / c;
      return {
        display: `BOSS: ${a} × ${b} ÷ ${c} =`,
        answer: String(ans),
        hideAnswerPreview: true,
      };
    }
    case 'math-all-mix':
    default: {
      const a = randInt(3, 8);
      const b = randInt(3, 8);
      const c = randInt(5, 15);
      const ans = a * b - c;
      return {
        display: `BOSS: ${a} × ${b} - ${c} =`,
        answer: String(ans),
        hideAnswerPreview: true,
      };
    }
  }
}
