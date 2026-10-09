/**
 * Pinyin & Chinese Character Datasets for Typing Practice.
 * Covers Initials/Finals, Grade 1-2 standard curriculum characters and words.
 */

import cnchar from 'cnchar';
import type { TypingTarget } from './lessons';

export interface PinyinLessonGroup {
  id: string;
  titleKey: string;
  title: string;
  subtitle: string;
  icon: string;
  category: 'letters' | 'grade1' | 'grade2';
  items: { text: string; hint?: string }[];
}

// ── 1. 声母、韵母与整体认读音节 ──────────────────────────────────────────────
export const PINYIN_INITIALS = [
  'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h',
  'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w',
];

export const PINYIN_FINALS = [
  'a', 'o', 'e', 'i', 'u', 'v',
  'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 've', 'er',
  'an', 'en', 'in', 'un', 'vn', 'ang', 'eng', 'ing', 'ong',
];

export const PINYIN_WHOLE = [
  'zhi', 'chi', 'shi', 'ri', 'zi', 'ci', 'si',
  'yi', 'wu', 'yu', 'ye', 'yue', 'yuan', 'yin', 'yun', 'ying',
];

// ── 2. 部编版一二年级字词库 ──────────────────────────────────────────────────
export const GRADE1_UP_CHARS = [
  '天', '地', '人', '你', '我', '他', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
  '上', '下', '左', '右', '口', '目', '耳', '手', '足', '日', '月', '水', '火', '山', '石', '田',
  '禾', '对', '雨', '云', '风', '花', '鸟', '虫', '大', '小', '多', '少', '牛', '羊', '早', '书',
];

export const GRADE1_UP_WORDS = [
  '大小', '上下', '人口', '日光', '月亮', '水火', '山石', '田地', '白云', '小鸟',
  '雨水', '花朵', '泥土', '小草', '早起', '书本', '木头', '森林', '天空', '开心',
];

export const GRADE1_DOWN_CHARS = [
  '春', '冬', '雪', '飞', '入', '姓', '什', '么', '双', '国', '王', '方', '青', '清', '气', '晴',
  '情', '请', '生', '字', '红', '时', '动', '万', '丁', '百', '齐', '说', '话', '朋', '友', '春',
  '高', '低', '绿', '红', '黄', '蓝', '白', '黑', '长', '短', '快', '慢', '笑', '走', '跑', '跳',
];

export const GRADE1_DOWN_WORDS = [
  '春风', '冬雪', '国王', '青山', '清水', '天气', '晴天', '心情', '生字', '红色',
  '时间', '活动', '百万', '齐心', '说话', '朋友', '高低', '绿色', '长短', '跑跳',
];

export const GRADE2_UP_CHARS = [
  '哪', '宽', '顶', '眼', '睛', '肚', '皮', '孩', '跳', '变', '极', '片', '傍', '海', '洋', '作',
  '坏', '给', '带', '桥', '柱', '底', '杆', '秤', '做', '岁', '站', '船', '然', '画', '幅', '评',
  '奖', '候', '报', '纸', '拿', '并', '封', '信', '今', '写', '圆', '珠', '笔', '灯', '电', '闪',
];

export const GRADE2_UP_WORDS = [
  '海洋', '眼睛', '肚皮', '孩子', '跳舞', '变化', '北极', '桥梁', '岁数', '站立',
  '小船', '图画', '评奖', '报纸', '书信', '圆珠笔', '灯光', '闪电', '星空', '探索',
];

export const GRADE2_DOWN_CHARS = [
  '诗', '村', '童', '碧', '妆', '绿', '丝', '剪', '冲', '寻', '姑', '娘', '吐', '柳', '荡', '桃',
  '杏', '鲜', '邮', '递', '员', '原', '叔', '局', '堆', '礼', '邓', '植', '格', '引', '满', '休',
  '息', '精', '彩', '梦', '想', '森', '林', '温', '暖', '美', '丽', '希', '望', '阳', '光', '彩',
];

export const GRADE2_DOWN_WORDS = [
  '乡村', '儿童', '碧绿', '剪刀', '寻找', '姑娘', '柳树', '鲜花', '邮递员', '原野',
  '礼物', '植树', '休息', '精彩', '梦想', '森林', '温暖', '美丽', '希望', '阳光',
];

// ── 3. 课程组织分组 ────────────────────────────────────────────────────────
export const PINYIN_LESSONS: PinyinLessonGroup[] = [
  {
    id: 'pinyin-initials',
    titleKey: 'Typing.pinyin.initials',
    title: '声母练习 (23个)',
    subtitle: 'b, p, m, f, d, t, n, l, g, k, h, j, q, x...',
    icon: '🔤',
    category: 'letters',
    items: PINYIN_INITIALS.map((s) => ({ text: s, hint: s })),
  },
  {
    id: 'pinyin-finals',
    titleKey: 'Typing.pinyin.finals',
    title: '韵母练习 (24个)',
    subtitle: 'a, o, e, i, u, ü(v), ai, ei, ui, ao, an, ang...',
    icon: '🎵',
    category: 'letters',
    items: PINYIN_FINALS.map((s) => ({ text: s, hint: s })),
  },
  {
    id: 'pinyin-whole',
    titleKey: 'Typing.pinyin.whole',
    title: '整体认读音节 (16个)',
    subtitle: 'zhi, chi, shi, ri, zi, ci, si, yi, wu, yu...',
    icon: '🧩',
    category: 'letters',
    items: PINYIN_WHOLE.map((s) => ({ text: s, hint: s })),
  },
  {
    id: 'pinyin-g1-chars',
    titleKey: 'Typing.pinyin.g1chars',
    title: '基础启蒙 · 常用生字',
    subtitle: '天地人你我他，日月水火土 (看字打拼音)',
    icon: '🌱',
    category: 'grade1',
    items: GRADE1_UP_CHARS.map((c) => ({ text: c })),
  },
  {
    id: 'pinyin-g1-words',
    titleKey: 'Typing.pinyin.g1words',
    title: '生活常用 · 双字词语',
    subtitle: '大小、上下、白天、月亮、天空、小鸟...',
    icon: '📖',
    category: 'grade1',
    items: GRADE1_UP_WORDS.map((w) => ({ text: w })),
  },
  {
    id: 'pinyin-g1down-chars',
    titleKey: 'Typing.pinyin.g1downChars',
    title: '进阶拓展 · 常见生字',
    subtitle: '春风冬雪青草红花，常用部编生字',
    icon: '🌸',
    category: 'grade1',
    items: GRADE1_DOWN_CHARS.map((c) => ({ text: c })),
  },
  {
    id: 'pinyin-g2-chars',
    titleKey: 'Typing.pinyin.g2chars',
    title: '丰富识字 · 进阶生字',
    subtitle: '海洋、眼睛、孩子、变极、图画、圆珠笔',
    icon: '🌊',
    category: 'grade2',
    items: GRADE2_UP_CHARS.map((c) => ({ text: c })),
  },
  {
    id: 'pinyin-g2-words',
    titleKey: 'Typing.pinyin.g2words',
    title: '词汇大师 · 词语大冲关',
    subtitle: '乡村、儿童、寻找、森林、温暖、美丽、阳光',
    icon: '🏰',
    category: 'grade2',
    items: GRADE2_DOWN_WORDS.map((w) => ({ text: w })),
  },
];

export function getPinyinLesson(id: string): PinyinLessonGroup {
  return PINYIN_LESSONS.find((l) => l.id === id) ?? PINYIN_LESSONS[0];
}

/**
 * 将汉字转换为 TypingTarget (display 显示汉字，answer 为小写拼音，hint 为带声调拼音)
 */
export function makeChineseTarget(
  text: string,
  showToneHint = true,
): TypingTarget {
  // 单独字母（声母/韵母/整体认读音节）
  if (/^[a-zA-Z]+$/.test(text)) {
    return {
      display: text.toUpperCase(),
      answer: text.toLowerCase(),
      hint: text,
    };
  }

  // 汉字
  try {
    const spellEngine = cnchar as unknown as {
      spell: (t: string, mode?: string) => string;
    };
    const plainPinyin = spellEngine.spell(text, 'low').replace(/ü/g, 'v').toLowerCase();
    const tonePinyin = spellEngine.spell(text, 'tone');

    return {
      display: text,
      answer: plainPinyin,
      hint: showToneHint ? tonePinyin : undefined,
    };
  } catch {
    return {
      display: text,
      answer: text.toLowerCase(),
    };
  }
}

/**
 * 随机获取一个拼音/汉字目标
 */
export function pickPinyinTarget(
  lessonId: string,
  showToneHint = true,
  exclude: Set<string> = new Set(),
): TypingTarget {
  const lesson = getPinyinLesson(lessonId);
  let pool = lesson.items.filter((item) => {
    const tgt = makeChineseTarget(item.text, showToneHint);
    return !exclude.has(tgt.answer[0]);
  });
  if (pool.length === 0) pool = lesson.items;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  return makeChineseTarget(picked.text, showToneHint);
}

/**
 * 拼音关卡的 BOSS 目标（较长词语或连打）
 */
export function makePinyinBossTarget(lessonId: string, showToneHint = true): TypingTarget {
  const lesson = getPinyinLesson(lessonId);
  const words = lesson.items.filter((i) => i.text.length >= 2);
  const picked = words.length > 0
    ? words[Math.floor(Math.random() * words.length)]
    : lesson.items[Math.floor(Math.random() * lesson.items.length)];

  return makeChineseTarget(picked.text, showToneHint);
}
