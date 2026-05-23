export type ChineseSpeedQuizConfig = {
  timeLimitSeconds: 30 | 60 | 120;
  difficulty: 1 | 2 | 3;
};

export type ChineseSpeedQuestion = {
  id: string;
  character: string;
  pinyin: string;
  questionText: string;
  options: string[]; // 4 pinyin options
  correctIndex: number;
};

// Common Chinese characters organized by difficulty
const CHARACTERS_BY_DIFFICULTY: Record<number, { char: string; pinyin: string }[]> = {
  1: [
    { char: '大', pinyin: 'dà' }, { char: '小', pinyin: 'xiǎo' }, { char: '人', pinyin: 'rén' },
    { char: '口', pinyin: 'kǒu' }, { char: '山', pinyin: 'shān' }, { char: '水', pinyin: 'shuǐ' },
    { char: '火', pinyin: 'huǒ' }, { char: '木', pinyin: 'mù' }, { char: '日', pinyin: 'rì' },
    { char: '月', pinyin: 'yuè' }, { char: '天', pinyin: 'tiān' }, { char: '地', pinyin: 'dì' },
    { char: '上', pinyin: 'shàng' }, { char: '下', pinyin: 'xià' }, { char: '中', pinyin: 'zhōng' },
    { char: '一', pinyin: 'yī' }, { char: '二', pinyin: 'èr' }, { char: '三', pinyin: 'sān' },
    { char: '四', pinyin: 'sì' }, { char: '五', pinyin: 'wǔ' }, { char: '六', pinyin: 'liù' },
    { char: '七', pinyin: 'qī' }, { char: '八', pinyin: 'bā' }, { char: '九', pinyin: 'jiǔ' },
    { char: '十', pinyin: 'shí' }, { char: '百', pinyin: 'bǎi' }, { char: '千', pinyin: 'qiān' },
    { char: '万', pinyin: 'wàn' }, { char: '父', pinyin: 'fù' }, { char: '母', pinyin: 'mǔ' },
  ],
  2: [
    { char: '快', pinyin: 'kuài' }, { char: '慢', pinyin: 'màn' }, { char: '高', pinyin: 'gāo' },
    { char: '低', pinyin: 'dī' }, { char: '长', pinyin: 'cháng' }, { char: '短', pinyin: 'duǎn' },
    { char: '新', pinyin: 'xīn' }, { char: '旧', pinyin: 'jiù' }, { char: '好', pinyin: 'hǎo' },
    { char: '坏', pinyin: 'huài' }, { char: '多', pinyin: 'duō' }, { char: '少', pinyin: 'shǎo' },
    { char: '冷', pinyin: 'lěng' }, { char: '热', pinyin: 'rè' }, { char: '明', pinyin: 'míng' },
    { char: '暗', pinyin: 'àn' }, { char: '轻', pinyin: 'qīng' }, { char: '重', pinyin: 'zhòng' },
    { char: '前', pinyin: 'qián' }, { char: '后', pinyin: 'hòu' }, { char: '左', pinyin: 'zuǒ' },
    { char: '右', pinyin: 'yòu' }, { char: '东', pinyin: 'dōng' }, { char: '西', pinyin: 'xī' },
    { char: '南', pinyin: 'nán' }, { char: '北', pinyin: 'běi' }, { char: '春', pinyin: 'chūn' },
    { char: '夏', pinyin: 'xià' }, { char: '秋', pinyin: 'qiū' }, { char: '冬', pinyin: 'dōng' },
  ],
  3: [
    { char: '聪', pinyin: 'cōng' }, { char: '慧', pinyin: 'huì' }, { char: '勤', pinyin: 'qín' },
    { char: '奋', pinyin: 'fèn' }, { char: '勇', pinyin: 'yǒng' }, { char: '敢', pinyin: 'gǎn' },
    { char: '坚', pinyin: 'jiān' }, { char: '强', pinyin: 'qiáng' }, { char: '温', pinyin: 'wēn' },
    { char: '暖', pinyin: 'nuǎn' }, { char: '寒', pinyin: 'hán' }, { char: '凉', pinyin: 'liáng' },
    { char: '繁', pinyin: 'fán' }, { char: '荣', pinyin: 'róng' }, { char: '茂', pinyin: 'mào' },
    { char: '盛', pinyin: 'shèng' }, { char: '幽', pinyin: 'yōu' }, { char: '雅', pinyin: 'yǎ' },
    { char: '宁', pinyin: 'níng' }, { char: '静', pinyin: 'jìng' }, { char: '祥', pinyin: 'xiáng' },
    { char: '瑞', pinyin: 'ruì' }, { char: '福', pinyin: 'fú' }, { char: '禄', pinyin: 'lù' },
    { char: '寿', pinyin: 'shòu' }, { char: '喜', pinyin: 'xǐ' }, { char: '悦', pinyin: 'yuè' },
    { char: '欣', pinyin: 'xīn' }, { char: '怡', pinyin: 'yí' }, { char: '恬', pinyin: 'tián' },
  ],
};

function shuffleOptions(correct: string, allPinyin: string[]): string[] {
  const wrongOptions = allPinyin
    .filter(p => p !== correct)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correct, ...wrongOptions];
  // Shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

export function generateChineseSpeedQuestion(config: ChineseSpeedQuizConfig): ChineseSpeedQuestion {
  const pool = CHARACTERS_BY_DIFFICULTY[config.difficulty];
  const item = pool[Math.floor(Math.random() * pool.length)];

  // Collect all pinyin from same difficulty for distractors
  const allPinyin = [...new Set(pool.map(c => c.pinyin))];
  const options = shuffleOptions(item.pinyin, allPinyin);
  const correctIndex = options.indexOf(item.pinyin);

  return {
    id: `cn-speed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    character: item.char,
    pinyin: item.pinyin,
    questionText: `"${item.char}" 的拼音是什么？`,
    options: options as [string, string, string, string],
    correctIndex,
  };
}
