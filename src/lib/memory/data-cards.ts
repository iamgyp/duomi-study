/**
 * Card dataset and pair generators for Ender Memory Flip game.
 */

export type CardCategoryType = 'minecraft' | 'pinyin' | 'math' | 'english';

export interface CardPair {
  id: string;
  itemA: {
    display: string;
    subText?: string;
    icon?: string;
  };
  itemB: {
    display: string;
    subText?: string;
    icon?: string;
  };
}

export interface CardCategoryDef {
  id: CardCategoryType;
  title: string;
  icon: string;
  description: string;
  badge: string;
}

export const CARD_CATEGORIES: CardCategoryDef[] = [
  {
    id: 'minecraft',
    title: '像素图鉴',
    icon: '💎',
    description: '钻石、金苹果、火把、苦力怕等经典道具配对',
    badge: '纯图鉴·直觉',
  },
  {
    id: 'pinyin',
    title: '拼音汉字',
    icon: '🇨🇳',
    description: '汉字与拼音互认配对（如 日 ↔ rì，山 ↔ shān）',
    badge: '语文双向联想',
  },
  {
    id: 'math',
    title: '算式速算',
    icon: '🧮',
    description: '加减乘除算式与正确答案互配（如 3×4 ↔ 12）',
    badge: '心算匹配',
  },
  {
    id: 'english',
    title: '英语图词',
    icon: '🇬🇧',
    description: '英文单词与中文图解配对（如 cat ↔ 🐱 猫咪）',
    badge: '图词双向记忆',
  },
];

export interface GridConfig {
  id: '2x2' | '2x3' | '3x4' | '4x4';
  title: string;
  cols: number;
  rows: number;
  pairsNeeded: number;
}

export const GRID_CONFIGS: GridConfig[] = [
  { id: '2x2', title: '2×2 (4张·启蒙)', cols: 2, rows: 2, pairsNeeded: 2 },
  { id: '2x3', title: '2×3 (6张·热身)', cols: 3, rows: 2, pairsNeeded: 3 },
  { id: '3x4', title: '3×4 (12张·标准)', cols: 4, rows: 3, pairsNeeded: 6 },
  { id: '4x4', title: '4×4 (16张·大师)', cols: 4, rows: 4, pairsNeeded: 8 },
];

// ── 题库库源 ──────────────────────────────────────────────────

const MINECRAFT_PAIRS: CardPair[] = [
  { id: 'mc-diamond', itemA: { display: '💎 钻石', subText: 'Diamond' }, itemB: { display: '💎 钻石', subText: 'Diamond' } },
  { id: 'mc-gold-apple', itemA: { display: '🍏 金苹果', subText: 'Golden Apple' }, itemB: { display: '🍏 金苹果', subText: 'Golden Apple' } },
  { id: 'mc-torch', itemA: { display: '🔥 火把', subText: 'Torch' }, itemB: { display: '🔥 火把', subText: 'Torch' } },
  { id: 'mc-creeper', itemA: { display: '🟩 苦力怕', subText: 'Creeper' }, itemB: { display: '🟩 苦力怕', subText: 'Creeper' } },
  { id: 'mc-sword', itemA: { display: '⚔️ 铁剑', subText: 'Iron Sword' }, itemB: { display: '⚔️ 铁剑', subText: 'Iron Sword' } },
  { id: 'mc-pickaxe', itemA: { display: '⛏️ 钻石镐', subText: 'Pickaxe' }, itemB: { display: '⛏️ 钻石镐', subText: 'Pickaxe' } },
  { id: 'mc-book', itemA: { display: '📖 附魔书', subText: 'Enchanted Book' }, itemB: { display: '📖 附魔书', subText: 'Enchanted Book' } },
  { id: 'mc-pearl', itemA: { display: '🟣 末影珍珠', subText: 'Ender Pearl' }, itemB: { display: '🟣 末影珍珠', subText: 'Ender Pearl' } },
  { id: 'mc-tnt', itemA: { display: '🧨 TNT', subText: 'Explosive' }, itemB: { display: '🧨 TNT', subText: 'Explosive' } },
  { id: 'mc-bread', itemA: { display: '🍞 面包', subText: 'Bread' }, itemB: { display: '🍞 面包', subText: 'Bread' } },
];

const PINYIN_PAIRS: CardPair[] = [
  { id: 'py-ri', itemA: { display: '日', subText: '汉字' }, itemB: { display: 'rì', subText: '拼音' } },
  { id: 'py-yue', itemA: { display: '月', subText: '汉字' }, itemB: { display: 'yuè', subText: '拼音' } },
  { id: 'py-shan', itemA: { display: '山', subText: '汉字' }, itemB: { display: 'shān', subText: '拼音' } },
  { id: 'py-shui', itemA: { display: '水', subText: '汉字' }, itemB: { display: 'shuǐ', subText: '拼音' } },
  { id: 'py-huo', itemA: { display: '火', subText: '汉字' }, itemB: { display: 'huǒ', subText: '拼音' } },
  { id: 'py-tian', itemA: { display: '田', subText: '汉字' }, itemB: { display: 'tián', subText: '拼音' } },
  { id: 'py-he', itemA: { display: '禾', subText: '汉字' }, itemB: { display: 'hé', subText: '拼音' } },
  { id: 'py-mu', itemA: { display: '木', subText: '汉字' }, itemB: { display: 'mù', subText: '拼音' } },
  { id: 'py-tu', itemA: { display: '土', subText: '汉字' }, itemB: { display: 'tǔ', subText: '拼音' } },
  { id: 'py-shi', itemA: { display: '石', subText: '汉字' }, itemB: { display: 'shí', subText: '拼音' } },
];

const MATH_PAIRS: CardPair[] = [
  { id: 'math-3x4', itemA: { display: '3 × 4', subText: '算式' }, itemB: { display: '12', subText: '得数' } },
  { id: 'math-7+8', itemA: { display: '7 + 8', subText: '算式' }, itemB: { display: '15', subText: '得数' } },
  { id: 'math-20-7', itemA: { display: '20 - 7', subText: '算式' }, itemB: { display: '13', subText: '得数' } },
  { id: 'math-18/2', itemA: { display: '18 ÷ 2', subText: '算式' }, itemB: { display: '9', subText: '得数' } },
  { id: 'math-6x7', itemA: { display: '6 × 7', subText: '算式' }, itemB: { display: '42', subText: '得数' } },
  { id: 'math-9+9', itemA: { display: '9 + 9', subText: '算式' }, itemB: { display: '18', subText: '得数' } },
  { id: 'math-35/5', itemA: { display: '35 ÷ 5', subText: '算式' }, itemB: { display: '7', subText: '得数' } },
  { id: 'math-14-8', itemA: { display: '14 - 8', subText: '算式' }, itemB: { display: '6', subText: '得数' } },
  { id: 'math-5x5', itemA: { display: '5 × 5', subText: '算式' }, itemB: { display: '25', subText: '得数' } },
  { id: 'math-8x9', itemA: { display: '8 × 9', subText: '算式' }, itemB: { display: '72', subText: '得数' } },
];

const ENGLISH_PAIRS: CardPair[] = [
  { id: 'en-apple', itemA: { display: 'apple', subText: '英文' }, itemB: { display: '🍎 苹果', subText: '图意' } },
  { id: 'en-cat', itemA: { display: 'cat', subText: '英文' }, itemB: { display: '🐱 猫咪', subText: '图意' } },
  { id: 'en-dog', itemA: { display: 'dog', subText: '英文' }, itemB: { display: '🐶 小狗', subText: '图意' } },
  { id: 'en-sun', itemA: { display: 'sun', subText: '英文' }, itemB: { display: '☀️ 太阳', subText: '图意' } },
  { id: 'en-book', itemA: { display: 'book', subText: '英文' }, itemB: { display: '📖 书本', subText: '图意' } },
  { id: 'en-fish', itemA: { display: 'fish', subText: '英文' }, itemB: { display: '🐟 小鱼', subText: '图意' } },
  { id: 'en-tree', itemA: { display: 'tree', subText: '英文' }, itemB: { display: '🌲 大树', subText: '图意' } },
  { id: 'en-star', itemA: { display: 'star', subText: '英文' }, itemB: { display: '⭐ 星星', subText: '图意' } },
  { id: 'en-bird', itemA: { display: 'bird', subText: '英文' }, itemB: { display: '🐦 小鸟', subText: '图意' } },
  { id: 'en-moon', itemA: { display: 'moon', subText: '英文' }, itemB: { display: '🌙 月亮', subText: '图意' } },
];

export interface PlayCard {
  instanceId: string;
  pairId: string;
  side: 'A' | 'B';
  display: string;
  subText?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

/**
 * Generate a randomized deck of cards for the matching game.
 */
export function generateCardDeck(category: CardCategoryType, count: number): PlayCard[] {
  let pool: CardPair[];
  switch (category) {
    case 'minecraft':
      pool = MINECRAFT_PAIRS;
      break;
    case 'pinyin':
      pool = PINYIN_PAIRS;
      break;
    case 'math':
      pool = MATH_PAIRS;
      break;
    case 'english':
      pool = ENGLISH_PAIRS;
      break;
  }

  // Shuffle and pick pairs
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  const selectedPairs = shuffledPool.slice(0, count);

  const cards: PlayCard[] = [];
  selectedPairs.forEach((pair, idx) => {
    cards.push({
      instanceId: `${pair.id}-A-${idx}`,
      pairId: pair.id,
      side: 'A',
      display: pair.itemA.display,
      subText: pair.itemA.subText,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      instanceId: `${pair.id}-B-${idx}`,
      pairId: pair.id,
      side: 'B',
      display: pair.itemB.display,
      subText: pair.itemB.subText,
      isFlipped: false,
      isMatched: false,
    });
  });

  // Randomize placement
  return cards.sort(() => Math.random() - 0.5);
}
