export type EnglishSpeedQuizConfig = {
  timeLimitSeconds: 30 | 60 | 120;
  difficulty: 1 | 2 | 3;
};

export type EnglishSpeedQuestion = {
  id: string;
  word: string;
  chinese: string;
  questionText: string;
  options: string[];
  correctIndex: number;
};

const WORDS_BY_DIFFICULTY: Record<number, { word: string; chinese: string }[]> = {
  1: [
    { word: 'apple', chinese: '苹果' }, { word: 'banana', chinese: '香蕉' }, { word: 'cat', chinese: '猫' },
    { word: 'dog', chinese: '狗' }, { word: 'egg', chinese: '蛋' }, { word: 'fish', chinese: '鱼' },
    { word: 'girl', chinese: '女孩' }, { word: 'hat', chinese: '帽子' }, { word: 'ice', chinese: '冰' },
    { word: 'jump', chinese: '跳' }, { word: 'king', chinese: '国王' }, { word: 'lion', chinese: '狮子' },
    { word: 'moon', chinese: '月亮' }, { word: 'nose', chinese: '鼻子' }, { word: 'orange', chinese: '橙子' },
    { word: 'pen', chinese: '钢笔' }, { word: 'queen', chinese: '女王' }, { word: 'rose', chinese: '玫瑰' },
    { word: 'star', chinese: '星星' }, { word: 'tree', chinese: '树' },
  ],
  2: [
    { word: 'animal', chinese: '动物' }, { word: 'bridge', chinese: '桥' }, { word: 'cloud', chinese: '云' },
    { word: 'dragon', chinese: '龙' }, { word: 'eagle', chinese: '鹰' }, { word: 'flower', chinese: '花' },
    { word: 'garden', chinese: '花园' }, { word: 'house', chinese: '房子' }, { word: 'island', chinese: '岛' },
    { word: 'jungle', chinese: '丛林' }, { word: 'kitten', chinese: '小猫' }, { word: 'lantern', chinese: '灯笼' },
    { word: 'mountain', chinese: '山' }, { word: 'nature', chinese: '自然' }, { word: 'ocean', chinese: '海洋' },
    { word: 'planet', chinese: '行星' }, { word: 'river', chinese: '河流' }, { word: 'summer', chinese: '夏天' },
    { word: 'thunder', chinese: '雷' }, { word: 'window', chinese: '窗户' },
  ],
  3: [
    { word: 'adventure', chinese: '冒险' }, { word: 'brilliant', chinese: '辉煌的' }, { word: 'celebrate', chinese: '庆祝' },
    { word: 'dazzling', chinese: '耀眼的' }, { word: 'elephant', chinese: '大象' }, { word: 'festival', chinese: '节日' },
    { word: 'galaxy', chinese: '星系' }, { word: 'harmony', chinese: '和谐' }, { word: 'illusion', chinese: '错觉' },
    { word: 'journey', chinese: '旅程' }, { word: 'kingdom', chinese: '王国' }, { word: 'labyrinth', chinese: '迷宫' },
    { word: 'mystery', chinese: '神秘' }, { word: 'noble', chinese: '高贵的' }, { word: 'orchestra', chinese: '管弦乐队' },
    { word: 'pavilion', chinese: '亭子' }, { word: 'question', chinese: '问题' }, { word: 'rhythm', chinese: '节奏' },
    { word: 'treasure', chinese: '宝藏' }, { word: 'universe', chinese: '宇宙' },
  ],
};

function shuffleOptions(correct: string, allWords: string[]): string[] {
  const wrongOptions = allWords
    .filter(w => w !== correct)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correct, ...wrongOptions];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

export function generateEnglishSpeedQuestion(config: EnglishSpeedQuizConfig): EnglishSpeedQuestion {
  const pool = WORDS_BY_DIFFICULTY[config.difficulty];
  const item = pool[Math.floor(Math.random() * pool.length)];

  const allWords = pool.map(w => w.word);
  const options = shuffleOptions(item.word, allWords);
  const correctIndex = options.indexOf(item.word);

  return {
    id: `en-speed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    word: item.word,
    chinese: item.chinese,
    questionText: `"${item.chinese}" 用英语怎么说？`,
    options: options as [string, string, string, string],
    correctIndex,
  };
}
