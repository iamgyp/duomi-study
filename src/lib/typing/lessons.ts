/**
 * Key-position lessons and local progress storage for the typing game.
 */

export interface TypingTarget {
  /** text shown above the mob */
  display: string;
  /** keys the player must type, lowercase */
  answer: string;
  /** optional small hint shown under display (e.g. pinyin / meaning) */
  hint?: string;
  /** if true, don't show the letters/answer breakdown preview below (e.g. math mode, let player calculate) */
  hideAnswerPreview?: boolean;
}

export interface KeyLesson {
  id: string;
  /** i18n key for the title */
  titleKey: string;
  icon: string;
  /** new keys focused in this lesson */
  keys: string[];
  /** previously learned keys mixed in (lower weight) */
  review: string[];
}

const HOME = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];
const TOP = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
const BOTTOM = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
const ALL_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

export const KEY_LESSONS: KeyLesson[] = [
  { id: 'fj', titleKey: 'Typing.lessons.fj', icon: '👆', keys: ['f', 'j'], review: [] },
  { id: 'home', titleKey: 'Typing.lessons.home', icon: '🏠', keys: HOME, review: [] },
  { id: 'gh', titleKey: 'Typing.lessons.gh', icon: '↔️', keys: ['g', 'h'], review: HOME },
  { id: 'top', titleKey: 'Typing.lessons.top', icon: '⬆️', keys: TOP, review: [...HOME, 'g', 'h'] },
  { id: 'bottom', titleKey: 'Typing.lessons.bottom', icon: '⬇️', keys: BOTTOM, review: [...HOME, 'g', 'h', ...TOP] },
  { id: 'all', titleKey: 'Typing.lessons.all', icon: '🔤', keys: ALL_LETTERS, review: [] },
  { id: 'digits', titleKey: 'Typing.lessons.digits', icon: '🔢', keys: '1234567890'.split(''), review: [] },
];

export function getLesson(id: string | null): KeyLesson {
  return KEY_LESSONS.find((l) => l.id === id) ?? KEY_LESSONS[0];
}

/** Pick a random key from the lesson (new keys ~70%, review keys ~30%). */
export function pickLessonKey(lesson: KeyLesson, exclude: Set<string> = new Set()): string {
  const useReview = lesson.review.length > 0 && Math.random() < 0.3;
  let pool = (useReview ? lesson.review : lesson.keys).filter((key) => !exclude.has(key));
  if (pool.length === 0) pool = [...lesson.keys, ...lesson.review].filter((key) => !exclude.has(key));
  if (pool.length === 0) pool = lesson.keys;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function lessonTarget(key: string): TypingTarget {
  return { display: key.toUpperCase(), answer: key };
}

// ── Progress ────────────────────────────────────────────────────────────────

export interface LessonProgress {
  stars: number;
  bestAccuracy: number;
  bestKpm: number;
  plays: number;
}

export interface WeaponDef {
  id: string;
  name: string;
  icon: string;
  reqXp: number;
  bonus: string;
}

export const WEAPONS: WeaponDef[] = [
  { id: 'wood', name: '木剑猎弓', icon: '🗡️', reqXp: 0, bonus: '基础冒险武器' },
  { id: 'iron', name: '铁剑劲弓', icon: '⚔️', reqXp: 100, bonus: '进阶守卫武器' },
  { id: 'diamond', name: '钻石神剑', icon: '💎', reqXp: 300, bonus: '精英勇士武器' },
  { id: 'netherite', name: '下界合金圣剑', icon: '🌌', reqXp: 600, bonus: '传奇王者武器' },
];

export function getWeaponByXp(xp: number): WeaponDef {
  const unlocked = WEAPONS.filter((w) => xp >= w.reqXp);
  return unlocked[unlocked.length - 1] ?? WEAPONS[0];
}

export interface TypingProgress {
  lessons: Record<string, LessonProgress>;
  xp: number;
  missedKeysTotal?: Record<string, number>;
}

const STORAGE_KEY = 'duomi-typing-progress';

export function getTypingProgress(): TypingProgress {
  if (typeof window === 'undefined') return { lessons: {}, xp: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lessons: {}, xp: 0 };
    const parsed = JSON.parse(raw) as Partial<TypingProgress>;
    return {
      lessons: parsed.lessons ?? {},
      xp: parsed.xp ?? 0,
      missedKeysTotal: parsed.missedKeysTotal ?? {},
    };
  } catch {
    return { lessons: {}, xp: 0 };
  }
}

export function isLessonUnlocked(progress: TypingProgress, index: number): boolean {
  if (index === 0) return true;
  const prev = KEY_LESSONS[index - 1];
  return (progress.lessons[prev.id]?.stars ?? 0) >= 1;
}

export function recordLessonResult(
  lessonId: string,
  result: {
    stars: number;
    accuracy: number;
    kpm: number;
    xp: number;
    missedKeys?: Record<string, number>;
  },
): TypingProgress {
  const progress = getTypingProgress();
  const prev = progress.lessons[lessonId] ?? { stars: 0, bestAccuracy: 0, bestKpm: 0, plays: 0 };
  progress.lessons[lessonId] = {
    stars: Math.max(prev.stars, result.stars),
    bestAccuracy: Math.max(prev.bestAccuracy, result.accuracy),
    bestKpm: Math.max(prev.bestKpm, result.kpm),
    plays: prev.plays + 1,
  };
  progress.xp += result.xp;

  if (result.missedKeys) {
    if (!progress.missedKeysTotal) progress.missedKeysTotal = {};
    for (const [k, count] of Object.entries(result.missedKeys)) {
      progress.missedKeysTotal[k] = (progress.missedKeysTotal[k] ?? 0) + count;
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore quota errors
  }
  return progress;
}
