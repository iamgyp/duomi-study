/**
 * Oxford Phonics World Levels 1-5 Vocabulary for Typing Practice.
 * Structured by phonics rules for young learners (Grade 1-2).
 */

import type { TypingTarget } from './lessons';

export interface PhonicsWord {
  word: string;
  meaning: string;
  icon: string;
  level: 1 | 2 | 3 | 4 | 5;
  rule: string;
}

export interface PhonicsLevelDef {
  level: 1 | 2 | 3 | 4 | 5;
  id: string;
  titleKey: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  words: PhonicsWord[];
}

export const PHONICS_WORDS: PhonicsWord[] = [
  // ── Level 1: The Alphabet (字母与字母音) ───────────────────────
  { word: 'ant', meaning: '蚂蚁', icon: '🐜', level: 1, rule: 'Letter A' },
  { word: 'bed', meaning: '床', icon: '🛏️', level: 1, rule: 'Letter B' },
  { word: 'cat', meaning: '猫', icon: '🐱', level: 1, rule: 'Letter C' },
  { word: 'dog', meaning: '狗', icon: '🐶', level: 1, rule: 'Letter D' },
  { word: 'egg', meaning: '蛋', icon: '🥚', level: 1, rule: 'Letter E' },
  { word: 'fish', meaning: '鱼', icon: '🐟', level: 1, rule: 'Letter F' },
  { word: 'hat', meaning: '帽子', icon: '🎩', level: 1, rule: 'Letter H' },
  { word: 'ink', meaning: '墨水', icon: '🖋️', level: 1, rule: 'Letter I' },
  { word: 'jet', meaning: '喷气机', icon: '✈️', level: 1, rule: 'Letter J' },
  { word: 'kite', meaning: '风筝', icon: '🪁', level: 1, rule: 'Letter K' },
  { word: 'lion', meaning: '狮子', icon: '🦁', level: 1, rule: 'Letter L' },
  { word: 'map', meaning: '地图', icon: '🗺️', level: 1, rule: 'Letter M' },
  { word: 'nut', meaning: '坚果', icon: '🥜', level: 1, rule: 'Letter N' },
  { word: 'ox', meaning: '公牛', icon: '🐂', level: 1, rule: 'Letter O' },
  { word: 'pig', meaning: '小猪', icon: '🐷', level: 1, rule: 'Letter P' },
  { word: 'red', meaning: '红色', icon: '🔴', level: 1, rule: 'Letter R' },
  { word: 'sun', meaning: '太阳', icon: '☀️', level: 1, rule: 'Letter S' },
  { word: 'top', meaning: '陀螺', icon: '🎪', level: 1, rule: 'Letter T' },
  { word: 'up', meaning: '向上', icon: '⬆️', level: 1, rule: 'Letter U' },
  { word: 'van', meaning: '小货车', icon: '🚐', level: 1, rule: 'Letter V' },
  { word: 'web', meaning: '蜘蛛网', icon: '🕸️', level: 1, rule: 'Letter W' },
  { word: 'box', meaning: '箱子', icon: '📦', level: 1, rule: 'Letter X' },
  { word: 'yak', meaning: '牦牛', icon: '🦬', level: 1, rule: 'Letter Y' },
  { word: 'zip', meaning: '拉链', icon: '🤐', level: 1, rule: 'Letter Z' },

  // ── Level 2: Short Vowels (短元音 CVC) ─────────────────────────
  { word: 'bat', meaning: '蝙蝠/球棒', icon: '🦇', level: 2, rule: 'Short A' },
  { word: 'cap', meaning: '鸭舌帽', icon: '🧢', level: 2, rule: 'Short A' },
  { word: 'dad', meaning: '爸爸', icon: '👨', level: 2, rule: 'Short A' },
  { word: 'fan', meaning: '风扇', icon: '🪭', level: 2, rule: 'Short A' },
  { word: 'jam', meaning: '果酱', icon: '🍯', level: 2, rule: 'Short A' },
  { word: 'pan', meaning: '平底锅', icon: '🍳', level: 2, rule: 'Short A' },
  { word: 'hen', meaning: '母鸡', icon: '🐔', level: 2, rule: 'Short E' },
  { word: 'leg', meaning: '腿', icon: '🦵', level: 2, rule: 'Short E' },
  { word: 'net', meaning: '网', icon: '🥅', level: 2, rule: 'Short E' },
  { word: 'pen', meaning: '钢笔', icon: '🖊️', level: 2, rule: 'Short E' },
  { word: 'bin', meaning: '垃圾桶', icon: '🗑️', level: 2, rule: 'Short I' },
  { word: 'dig', meaning: '挖矿', icon: '⛏️', level: 2, rule: 'Short I' },
  { word: 'hit', meaning: '击中', icon: '🎯', level: 2, rule: 'Short I' },
  { word: 'kid', meaning: '小孩', icon: '🧒', level: 2, rule: 'Short I' },
  { word: 'pin', meaning: '别针', icon: '📌', level: 2, rule: 'Short I' },
  { word: 'win', meaning: '获胜', icon: '🏆', level: 2, rule: 'Short I' },
  { word: 'fox', meaning: '狐狸', icon: '🦊', level: 2, rule: 'Short O' },
  { word: 'hot', meaning: '热', icon: '♨️', level: 2, rule: 'Short O' },
  { word: 'mop', meaning: '拖把', icon: '🧹', level: 2, rule: 'Short O' },
  { word: 'pot', meaning: '罐子', icon: '🍲', level: 2, rule: 'Short O' },
  { word: 'bug', meaning: '小虫', icon: '🐛', level: 2, rule: 'Short U' },
  { word: 'cup', meaning: '茶杯', icon: '☕', level: 2, rule: 'Short U' },
  { word: 'gum', meaning: '口香糖', icon: '🍬', level: 2, rule: 'Short U' },
  { word: 'hut', meaning: '小屋', icon: '🛖', level: 2, rule: 'Short U' },
  { word: 'mud', meaning: '泥巴', icon: '🪵', level: 2, rule: 'Short U' },
  { word: 'run', meaning: '奔跑', icon: '🏃', level: 2, rule: 'Short U' },

  // ── Level 3: Long Vowels (长元音 Magic e) ──────────────────────
  { word: 'bake', meaning: '烘焙', icon: '🍞', level: 3, rule: 'a_e' },
  { word: 'cake', meaning: '蛋糕', icon: '🎂', level: 3, rule: 'a_e' },
  { word: 'game', meaning: '游戏', icon: '🎮', level: 3, rule: 'a_e' },
  { word: 'lake', meaning: '湖泊', icon: '🏞️', level: 3, rule: 'a_e' },
  { word: 'name', meaning: '名字', icon: '🏷️', level: 3, rule: 'a_e' },
  { word: 'wave', meaning: '海浪', icon: '🌊', level: 3, rule: 'a_e' },
  { word: 'bike', meaning: '自行车', icon: '🚲', level: 3, rule: 'i_e' },
  { word: 'hike', meaning: '徒步', icon: '🥾', level: 3, rule: 'i_e' },
  { word: 'line', meaning: '直线', icon: '📏', level: 3, rule: 'i_e' },
  { word: 'nine', meaning: '数字9', icon: '9️⃣', level: 3, rule: 'i_e' },
  { word: 'rice', meaning: '米饭', icon: '🍚', level: 3, rule: 'i_e' },
  { word: 'time', meaning: '时间', icon: '⏰', level: 3, rule: 'i_e' },
  { word: 'bone', meaning: '骨头', icon: '🦴', level: 3, rule: 'o_e' },
  { word: 'cone', meaning: '圆锥', icon: '🍦', level: 3, rule: 'o_e' },
  { word: 'home', meaning: '家', icon: '🏠', level: 3, rule: 'o_e' },
  { word: 'hope', meaning: '希望', icon: '🌟', level: 3, rule: 'o_e' },
  { word: 'nose', meaning: '鼻子', icon: '👃', level: 3, rule: 'o_e' },
  { word: 'rose', meaning: '玫瑰', icon: '🌹', level: 3, rule: 'o_e' },
  { word: 'rope', meaning: '绳子', icon: '🪢', level: 3, rule: 'o_e' },
  { word: 'cute', meaning: '可爱', icon: '😺', level: 3, rule: 'u_e' },
  { word: 'cube', meaning: '方块', icon: '🧊', level: 3, rule: 'u_e' },
  { word: 'flute', meaning: '长笛', icon: '🪈', level: 3, rule: 'u_e' },
  { word: 'mule', meaning: '骡子', icon: '🫏', level: 3, rule: 'u_e' },
  { word: 'tube', meaning: '试管', icon: '🧪', level: 3, rule: 'u_e' },

  // ── Level 4: Consonant Blends (辅音组合) ───────────────────────
  { word: 'ship', meaning: '大船', icon: '🚢', level: 4, rule: 'sh' },
  { word: 'chick', meaning: '小鸡', icon: '🐥', level: 4, rule: 'ch' },
  { word: 'rich', meaning: '富有', icon: '💰', level: 4, rule: 'ch' },
  { word: 'thin', meaning: '瘦/薄', icon: '🪶', level: 4, rule: 'th' },
  { word: 'whale', meaning: '鲸鱼', icon: '🐋', level: 4, rule: 'wh' },
  { word: 'white', meaning: '白色', icon: '⚪', level: 4, rule: 'wh' },
  { word: 'black', meaning: '黑色', icon: '⚫', level: 4, rule: 'bl' },
  { word: 'clock', meaning: '时钟', icon: '⏰', level: 4, rule: 'cl' },
  { word: 'flag', meaning: '旗帜', icon: '🚩', level: 4, rule: 'fl' },
  { word: 'glass', meaning: '玻璃杯', icon: '🥛', level: 4, rule: 'gl' },
  { word: 'slide', meaning: '滑梯', icon: '🛝', level: 4, rule: 'sl' },
  { word: 'crab', meaning: '螃蟹', icon: '🦀', level: 4, rule: 'cr' },
  { word: 'frog', meaning: '青蛙', icon: '🐸', level: 4, rule: 'fr' },
  { word: 'drum', meaning: '小鼓', icon: '🥁', level: 4, rule: 'dr' },
  { word: 'grape', meaning: '葡萄', icon: '🍇', level: 4, rule: 'gr' },
  { word: 'tree', meaning: '大树', icon: '🌳', level: 4, rule: 'tr' },
  { word: 'train', meaning: '火车', icon: '🚂', level: 4, rule: 'tr' },
  { word: 'star', meaning: '星星', icon: '⭐', level: 4, rule: 'st' },
  { word: 'step', meaning: '脚步/台阶', icon: '🪜', level: 4, rule: 'st' },
  { word: 'spoon', meaning: '汤匙', icon: '🥄', level: 4, rule: 'sp' },
  { word: 'snake', meaning: '小蛇', icon: '🐍', level: 4, rule: 'sn' },
  { word: 'swim', meaning: '游泳', icon: '🏊', level: 4, rule: 'sw' },

  // ── Level 5: Letter Combinations (元音组合) ────────────────────
  { word: 'bee', meaning: '蜜蜂', icon: '🐝', level: 5, rule: 'ee' },
  { word: 'sea', meaning: '大海', icon: '🌊', level: 5, rule: 'ea' },
  { word: 'tea', meaning: '茶', icon: '🍵', level: 5, rule: 'ea' },
  { word: 'leaf', meaning: '树叶', icon: '🍃', level: 5, rule: 'ea' },
  { word: 'meat', meaning: '肉', icon: '🥩', level: 5, rule: 'ea' },
  { word: 'read', meaning: '读书', icon: '📖', level: 5, rule: 'ea' },
  { word: 'rain', meaning: '下雨', icon: '🌧️', level: 5, rule: 'ai' },
  { word: 'tail', meaning: '尾巴', icon: '🐕', level: 5, rule: 'ai' },
  { word: 'day', meaning: '白天', icon: '☀️', level: 5, rule: 'ay' },
  { word: 'play', meaning: '玩耍', icon: '🎮', level: 5, rule: 'ay' },
  { word: 'stay', meaning: '停留', icon: '🏠', level: 5, rule: 'ay' },
  { word: 'boat', meaning: '小船', icon: '⛵', level: 5, rule: 'oa' },
  { word: 'coat', meaning: '大衣', icon: '🧥', level: 5, rule: 'oa' },
  { word: 'road', meaning: '马路', icon: '🛣️', level: 5, rule: 'oa' },
  { word: 'snow', meaning: '下雪', icon: '❄️', level: 5, rule: 'ow' },
  { word: 'slow', meaning: '慢速', icon: '🐢', level: 5, rule: 'ow' },
  { word: 'book', meaning: '书本', icon: '📚', level: 5, rule: 'oo' },
  { word: 'cook', meaning: '做饭', icon: '🍳', level: 5, rule: 'oo' },
  { word: 'moon', meaning: '月亮', icon: '🌕', level: 5, rule: 'oo' },
  { word: 'zoo', meaning: '动物园', icon: '🦁', level: 5, rule: 'oo' },
  { word: 'coin', meaning: '硬币', icon: '🪙', level: 5, rule: 'oi' },
  { word: 'boy', meaning: '男孩', icon: '👦', level: 5, rule: 'oy' },
  { word: 'toy', meaning: '玩具', icon: '🧸', level: 5, rule: 'oy' },
  { word: 'cloud', meaning: '白云', icon: '☁️', level: 5, rule: 'ou' },
  { word: 'house', meaning: '房屋', icon: '🏠', level: 5, rule: 'ou' },
  { word: 'mouse', meaning: '老鼠', icon: '🐭', level: 5, rule: 'ou' },
  { word: 'cow', meaning: '奶牛', icon: '🐄', level: 5, rule: 'ow' },
  { word: 'owl', meaning: '猫头鹰', icon: '🦉', level: 5, rule: 'ow' },
];

export const PHONICS_LEVELS: PhonicsLevelDef[] = [
  {
    level: 1,
    id: 'phonics-l1',
    titleKey: 'Typing.phonics.l1',
    title: 'Level 1: 字母与字母音',
    subtitle: 'The Alphabet · 认识 26 个字母的基本自然发音',
    icon: '🔤',
    badge: '入门 26 音',
    words: PHONICS_WORDS.filter((w) => w.level === 1),
  },
  {
    level: 2,
    id: 'phonics-l2',
    titleKey: 'Typing.phonics.l2',
    title: 'Level 2: 短元音 CVC',
    subtitle: 'Short Vowels · 辅音+短元音+辅音拼读 (a, e, i, o, u)',
    icon: '🐱',
    badge: 'CVC 短元音',
    words: PHONICS_WORDS.filter((w) => w.level === 2),
  },
  {
    level: 3,
    id: 'phonics-l3',
    titleKey: 'Typing.phonics.l3',
    title: 'Level 3: 长元音 Magic e',
    subtitle: 'Long Vowels · 魔法字母 e 的长元音规则 (lake, bike, home...)',
    icon: '✨',
    badge: 'Magic e 长音',
    words: PHONICS_WORDS.filter((w) => w.level === 3),
  },
  {
    level: 4,
    id: 'phonics-l4',
    titleKey: 'Typing.phonics.l4',
    title: 'Level 4: 辅音组合',
    subtitle: 'Consonant Blends · 常见辅音字母组合 (ship, tree, frog...)',
    icon: '🐸',
    badge: '辅音组合拼读',
    words: PHONICS_WORDS.filter((w) => w.level === 4),
  },
  {
    level: 5,
    id: 'phonics-l5',
    titleKey: 'Typing.phonics.l5',
    title: 'Level 5: 元音组合',
    subtitle: 'Letter Combinations · 进阶双元音与变音 (rain, boat, moon...)',
    icon: '🌈',
    badge: '进阶双元音',
    words: PHONICS_WORDS.filter((w) => w.level === 5),
  },
];

export function getPhonicsLevel(level: number): PhonicsLevelDef {
  return PHONICS_LEVELS.find((l) => l.level === level) ?? PHONICS_LEVELS[0];
}

export function pickPhonicsTarget(level: number, exclude: Set<string> = new Set()): TypingTarget {
  const lvl = getPhonicsLevel(level);
  let pool = lvl.words.filter((w) => !exclude.has(w.word[0]));
  if (pool.length === 0) pool = lvl.words;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  return {
    display: picked.word.toUpperCase(),
    answer: picked.word.toLowerCase(),
    hint: `${picked.icon} ${picked.meaning}`,
  };
}

export function makePhonicsBossTarget(level: number): TypingTarget {
  const lvl = getPhonicsLevel(level);
  // Pick a longer word or 2 short words combined
  const candidates = [...lvl.words].sort((a, b) => b.word.length - a.word.length);
  const picked = candidates[Math.floor(Math.random() * Math.min(5, candidates.length))];

  return {
    display: `${picked.icon} ${picked.word.toUpperCase()}`,
    answer: picked.word.toLowerCase(),
    hint: `⭐ BOSS 单词: ${picked.meaning}`,
  };
}
