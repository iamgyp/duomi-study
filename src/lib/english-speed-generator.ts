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
    { word: 'Apple', chinese: '苹果' }, { word: 'Banana', chinese: '香蕉' }, { word: 'Cat', chinese: '猫' },
    { word: 'Dog', chinese: '狗' }, { word: 'Egg', chinese: '蛋' }, { word: 'Fish', chinese: '鱼' },
    { word: 'Girl', chinese: '女孩' }, { word: 'Hat', chinese: '帽子' }, { word: 'Ice', chinese: '冰' },
    { word: 'Jump', chinese: '跳' }, { word: 'King', chinese: '国王' }, { word: 'Lion', chinese: '狮子' },
    { word: 'Moon', chinese: '月亮' }, { word: 'Nose', chinese: '鼻子' }, { word: 'Orange', chinese: '橙子' },
    { word: 'Pen', chinese: '钢笔' }, { word: 'Queen', chinese: '女王' }, { word: 'Rose', chinese: '玫瑰' },
    { word: 'Star', chinese: '星星' }, { word: 'Tree', chinese: '树' },
  ],
  2: [
    { word: 'Animal', chinese: '动物' }, { word: 'Bridge', chinese: '桥' }, { word: 'Cloud', chinese: '云' },
    { word: 'Dragon', chinese: '龙' }, { word: 'Eagle', chinese: '鹰' }, { word: 'Flower', chinese: '花' },
    { word: 'Garden', chinese: '花园' }, { word: 'House', chinese: '房子' }, { word: 'Island', chinese: '岛' },
    { word: 'Jungle', chinese: '丛林' }, { word: 'Kitten', chinese: '小猫' }, { word: 'Lantern', chinese: '灯笼' },
    { word: 'Mountain', chinese: '山' }, { word: 'Nature', chinese: '自然' }, { word: 'Ocean', chinese: '海洋' },
    { word: 'Planet', chinese: '行星' }, { word: 'River', chinese: '河流' }, { word: 'Summer', chinese: '夏天' },
    { word: 'Thunder', chinese: '雷' }, { word: 'Window', chinese: '窗户' },
  ],
  3: [
    { word: 'Adventure', chinese: '冒险' }, { word: 'Brilliant', chinese: '辉煌的' }, { word: 'Celebrate', chinese: '庆祝' },
    { word: 'Dazzling', chinese: '耀眼的' }, { word: 'Elephant', chinese: '大象' }, { word: 'Festival', chinese: '节日' },
    { word: 'Galaxy', chinese: '星系' }, { word: 'Harmony', chinese: '和谐' }, { word: 'Illusion', chinese: '错觉' },
    { word: 'Journey', chinese: '旅程' }, { word: 'Kingdom', chinese: '王国' }, { word: 'Labyrinth', chinese: '迷宫' },
    { word: 'Mystery', chinese: '神秘' }, { word: 'Noble', chinese: '高贵的' }, { word: 'Orchestra', chinese: '管弦乐队' },
    { word: 'Pavilion', chinese: '亭子' }, { word: 'Question', chinese: '问题' }, { word: 'Rhythm', chinese: '节奏' },
    { word: 'Treasure', chinese: '宝藏' }, { word: 'Universe', chinese: '宇宙' },
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
