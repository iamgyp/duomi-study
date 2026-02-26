// 代数应用题生成器 - Minecraft 商店主题

export type ItemCategory = 'weapon' | 'tool' | 'food' | 'material' | 'armor';

export interface McItem {
  id: string;
  name: string;
  price: number;
  category: ItemCategory;
  emoji: string; // 用于网页预览
  icon: string;  // 用于 PDF（图片文件名）
}

export interface AlgebraQuestion {
  id: string;
  items: { item: McItem; quantity: number }[];
  total: number;
  expression: string;
}

export interface AlgebraConfig {
  difficulty: 1 | 2 | 3; // 1=单项，2=两项，3=三项
  count: 10 | 20 | 50;
  language: 'zh' | 'en'; // 价格表语言
}

// 40 种物品清单（价格 2-20 元）- 剑类只保留一种
export const MC_ITEMS: McItem[] = [
  // ⚔️ 武器 (6 种) - 剑只保留铁剑
  { id: 'iron-sword', name: '铁剑', price: 12, category: 'weapon', emoji: '⚔️', icon: 'iron_sword.png' },
  { id: 'bow', name: '弓', price: 15, category: 'weapon', emoji: '🏹', icon: 'bow.png' },
  { id: 'crossbow', name: '弩', price: 18, category: 'weapon', emoji: '🏹', icon: 'crossbow.png' },
  { id: 'trident', name: '三叉戟', price: 20, category: 'weapon', emoji: '🔱', icon: 'trident.png' },
  { id: 'axe', name: '斧', price: 10, category: 'weapon', emoji: '🪓', icon: 'iron_axe.png' },
  { id: 'mace', name: '锤', price: 16, category: 'weapon', emoji: '⚒️', icon: 'mace.png' },
  
  // 🛠️ 工具 (8 种)
  { id: 'wood-pickaxe', name: '木镐', price: 4, category: 'tool', emoji: '⛏️', icon: 'wood_pickaxe.png' },
  { id: 'stone-pickaxe', name: '石镐', price: 7, category: 'tool', emoji: '⛏️', icon: 'stone_pickaxe.png' },
  { id: 'iron-pickaxe', name: '铁镐', price: 12, category: 'tool', emoji: '⛏️', icon: 'iron_pickaxe.png' },
  { id: 'gold-pickaxe', name: '金镐', price: 14, category: 'tool', emoji: '⛏️', icon: 'gold_pickaxe.png' },
  { id: 'diamond-pickaxe', name: '钻石镐', price: 18, category: 'tool', emoji: '💎', icon: 'diamond_pickaxe.png' },
  { id: 'wood-shovel', name: '木铲', price: 2, category: 'tool', emoji: '🥄', icon: 'wood_shovel.png' },
  { id: 'iron-shovel', name: '铁铲', price: 6, category: 'tool', emoji: '🥄', icon: 'iron_shovel.png' },
  { id: 'hoe', name: '锄头', price: 5, category: 'tool', emoji: '⛏️', icon: 'iron_hoe.png' },
  
  // 🛡️ 防具 (6 种)
  { id: 'helmet', name: '头盔', price: 10, category: 'armor', emoji: '🪖', icon: 'iron_helmet.png' },
  { id: 'chestplate', name: '胸甲', price: 16, category: 'armor', emoji: '👕', icon: 'iron_chestplate.png' },
  { id: 'leggings', name: '护腿', price: 14, category: 'armor', emoji: '👖', icon: 'iron_leggings.png' },
  { id: 'boots', name: '靴子', price: 8, category: 'armor', emoji: '👢', icon: 'iron_boots.png' },
  { id: 'shield', name: '盾牌', price: 12, category: 'armor', emoji: '🛡️', icon: 'shield.png' },
  { id: 'turtle-helmet', name: '海龟壳', price: 15, category: 'armor', emoji: '🐢', icon: 'turtle_helmet.png' },
  
  // 🍎 食物 (10 种)
  { id: 'apple', name: '苹果', price: 3, category: 'food', emoji: '🍎', icon: 'apple.png' },
  { id: 'bread', name: '面包', price: 4, category: 'food', emoji: '🍞', icon: 'bread.png' },
  { id: 'carrot', name: '胡萝卜', price: 2, category: 'food', emoji: '🥕', icon: 'carrot.png' },
  { id: 'potato', name: '土豆', price: 2, category: 'food', emoji: '🥔', icon: 'potato.png' },
  { id: 'golden-apple', name: '金苹果', price: 20, category: 'food', emoji: '✨', icon: 'golden_apple.png' },
  { id: 'cooked-pork', name: '烤猪肉', price: 8, category: 'food', emoji: '🍖', icon: 'cooked_pork.png' },
  { id: 'cooked-beef', name: '牛排', price: 10, category: 'food', emoji: '🥩', icon: 'cooked_beef.png' },
  { id: 'cooked-chicken', name: '烤鸡', price: 7, category: 'food', emoji: '🍗', icon: 'cooked_chicken.png' },
  { id: 'cookie', name: '曲奇', price: 3, category: 'food', emoji: '🍪', icon: 'cookie.png' },
  { id: 'cake', name: '蛋糕', price: 12, category: 'food', emoji: '🎂', icon: 'cake.png' },
  
  // 💎 材料 (10 种)
  { id: 'coal', name: '煤炭', price: 5, category: 'material', emoji: '⚫', icon: 'coal.png' },
  { id: 'copper-ingot', name: '铜锭', price: 8, category: 'material', emoji: '🥉', icon: 'copper_ingot.png' },
  { id: 'iron-ingot', name: '铁锭', price: 10, category: 'material', emoji: '🔩', icon: 'iron_ingot.png' },
  { id: 'gold-ingot', name: '金锭', price: 15, category: 'material', emoji: '🥇', icon: 'gold_ingot.png' },
  { id: 'diamond', name: '钻石', price: 20, category: 'material', emoji: '💎', icon: 'diamond.png' },
  { id: 'emerald', name: '绿宝石', price: 18, category: 'material', emoji: '💚', icon: 'emerald.png' },
  { id: 'lapis', name: '青金石', price: 8, category: 'material', emoji: '💙', icon: 'lapis_lazuli.png' },
  { id: 'redstone', name: '红石', price: 9, category: 'material', emoji: '❤️', icon: 'redstone.png' },
  { id: 'stick', name: '木棍', price: 2, category: 'material', emoji: '🪵', icon: 'stick.png' },
  { id: 'string', name: '线', price: 3, category: 'material', emoji: '🧵', icon: 'string.png' },
];

// 随机选择物品（不重复）
function selectRandomItems(count: number): McItem[] {
  const shuffled = [...MC_ITEMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 从数组中随机选择不重复的 N 个物品
function selectFromSet(items: McItem[], count: number): McItem[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 生成单项题目（难度 1）- 使用当前组的物品池
function generateSingleItemQuestion(items: McItem[]): AlgebraQuestion {
  const item = items[Math.floor(Math.random() * items.length)];
  const quantity = Math.floor(Math.random() * 9) + 1; // 1-9
  const total = item.price * quantity;
  
  return {
    id: `alg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    items: [{ item, quantity }],
    total,
    expression: `${item.emoji} × ${quantity}`,
  };
}

// 生成两项题目（难度 2）- 使用当前组的物品池，确保物品不重复
function generateTwoItemQuestion(items: McItem[]): AlgebraQuestion {
  const selected = selectFromSet(items, 2); // 已经确保不重复
  const qty1 = Math.floor(Math.random() * 9) + 1; // 1-9
  const qty2 = Math.floor(Math.random() * 9) + 1; // 1-9
  const total = selected[0].price * qty1 + selected[1].price * qty2;
  
  return {
    id: `alg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    items: [
      { item: selected[0], quantity: qty1 },
      { item: selected[1], quantity: qty2 },
    ],
    total,
    expression: `${selected[0].emoji} × ${qty1} + ${selected[1].emoji} × ${qty2}`,
  };
}

// 生成三项题目（难度 3）- 使用当前组的物品池，确保物品不重复
function generateThreeItemQuestion(items: McItem[]): AlgebraQuestion {
  const selected = selectFromSet(items, 3); // 已经确保不重复
  const qty1 = Math.floor(Math.random() * 9) + 1; // 1-9
  const qty2 = Math.floor(Math.random() * 9) + 1; // 1-9
  const qty3 = Math.floor(Math.random() * 9) + 1; // 1-9
  const total = selected[0].price * qty1 + selected[1].price * qty2 + selected[2].price * qty3;
  
  return {
    id: `alg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    items: [
      { item: selected[0], quantity: qty1 },
      { item: selected[1], quantity: qty2 },
      { item: selected[2], quantity: qty3 },
    ],
    total,
    expression: `${selected[0].emoji} × ${qty1} + ${selected[1].emoji} × ${qty2} + ${selected[2].emoji} × ${qty3}`,
  };
}

// 生成一组题目（每 5 题共用一套物品）
export function generateAlgebraQuestions(config: AlgebraConfig): {
  questions: AlgebraQuestion[];
  itemSets: McItem[][];
} {
  const questions: AlgebraQuestion[] = [];
  const itemSets: McItem[][] = [];
  const questionsPerSet = 5;
  const totalSets = Math.ceil(config.count / questionsPerSet);
  
  for (let setIndex = 0; setIndex < totalSets; setIndex++) {
    // 每组使用不同的 4 种物品（保证多样性）
    const itemSet = selectRandomItems(4);
    itemSets.push(itemSet);
    
    for (let i = 0; i < questionsPerSet; i++) {
      const questionIndex = setIndex * questionsPerSet + i;
      if (questionIndex >= config.count) break;
      
      let question: AlgebraQuestion;
      switch (config.difficulty) {
        case 1:
          question = generateSingleItemQuestion(itemSet);
          break;
        case 2:
          question = generateTwoItemQuestion(itemSet);
          break;
        case 3:
          question = generateThreeItemQuestion(itemSet);
          break;
      }
      questions.push(question);
    }
  }
  
  return { questions, itemSets };
}

// 获取难度标签（英文）
export function getDifficultyLabel(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return '⭐ Basic';
    case 2:
      return '⭐⭐ Intermediate';
    case 3:
      return '⭐⭐⭐ Advanced';
    default:
      return '';
  }
}

// 获取价格表标签
export function getPriceListLabel(language: 'zh' | 'en'): string {
  return language === 'zh' ? '💰 价格表：' : '💰 Price List:';
}

// 获取物品名称（根据语言）
export function getItemDisplayName(item: McItem, language: 'zh' | 'en'): string {
  if (language === 'en') {
    // 英文名称映射
    const nameMap: Record<string, string> = {
      // Weapons
      'iron-sword': 'Iron Sword',
      'bow': 'Bow',
      'crossbow': 'Crossbow',
      'trident': 'Trident',
      'axe': 'Iron Axe',
      'mace': 'Mace',
      // Tools
      'wood-pickaxe': 'Wood Pickaxe',
      'stone-pickaxe': 'Stone Pickaxe',
      'iron-pickaxe': 'Iron Pickaxe',
      'gold-pickaxe': 'Gold Pickaxe',
      'diamond-pickaxe': 'Diamond Pickaxe',
      'wood-shovel': 'Wood Shovel',
      'iron-shovel': 'Iron Shovel',
      'hoe': 'Iron Hoe',
      // Armor
      'helmet': 'Iron Helmet',
      'chestplate': 'Iron Chestplate',
      'leggings': 'Iron Leggings',
      'boots': 'Iron Boots',
      'shield': 'Shield',
      'turtle-helmet': 'Turtle Shell',
      // Food
      'apple': 'Apple',
      'bread': 'Bread',
      'carrot': 'Carrot',
      'potato': 'Potato',
      'golden-apple': 'Golden Apple',
      'cooked-pork': 'Cooked Pork',
      'cooked-beef': 'Steak',
      'cooked-chicken': 'Cooked Chicken',
      'cookie': 'Cookie',
      'cake': 'Cake',
      // Materials
      'coal': 'Coal',
      'copper-ingot': 'Copper Ingot',
      'iron-ingot': 'Iron Ingot',
      'gold-ingot': 'Gold Ingot',
      'diamond': 'Diamond',
      'emerald': 'Emerald',
      'lapis': 'Lapis Lazuli',
      'redstone': 'Redstone',
      'stick': 'Stick',
      'string': 'String',
    };
    return nameMap[item.id] || item.name;
  }
  return item.name;
}

// 获取货币单位
export function getCurrencySymbol(language: 'zh' | 'en'): string {
  return language === 'zh' ? '元' : '$';
}
