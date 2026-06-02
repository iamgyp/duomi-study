import { Poem, PoemLine, getRandomPoem, getPoemsByDifficulty } from './poem-data';

export interface PoemExercise {
  id: string;
  poem: Poem;
  showAnswers: boolean;
}

export interface PoemConfig {
  difficulty: 1 | 2 | 3;
  count: number; // 诗歌数量
  showAnswers: boolean;
  showPinyin: boolean;
}

// 生成古诗填空练习（带随机填空位置）
export function generatePoemExercises(config: PoemConfig): PoemExercise[] {
  const exercises: PoemExercise[] = [];
  const poems = getPoemsByDifficulty(config.difficulty);

  if (poems.length === 0) return exercises;

  // 随机选择诗歌（不重复）
  const shuffled = [...poems].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(config.count, poems.length));

  for (const poem of selected) {
    // 随机生成每行的填空位置
    const randomizedPoem: Poem = {
      ...poem,
      lines: poem.lines.map(line => ({
        ...line,
        blanks: getRandomBlanks(line.text, config.difficulty),
      })),
    };
    exercises.push({
      id: `poem-ex-${poem.id}-${Date.now()}`,
      poem: randomizedPoem,
      showAnswers: config.showAnswers,
    });
  }

  return exercises;
}

// 随机选择填空位置（根据难度决定数量）
function getRandomBlanks(text: string, difficulty: number): number[] {
  const length = text.length;

  // 根据难度决定填空数量
  const numBlanks = difficulty === 1 ? 1 + Math.floor(Math.random() * 2) :  // 1-2
                    difficulty === 2 ? 2 + Math.floor(Math.random() * 2) :  // 2-3
                    2 + Math.floor(Math.random() * 3);                       // 2-4

  // 不空第一个字（方便阅读）
  const available = Array.from({ length }, (_, i) => i).filter(i => i > 0);

  const blanks: number[] = [];
  while (blanks.length < Math.min(numBlanks, available.length)) {
    const idx = available[Math.floor(Math.random() * available.length)];
    if (!blanks.includes(idx)) {
      blanks.push(idx);
    }
  }

  return blanks.sort((a, b) => a - b);
}

// 获取难度标签
export function getPoemDifficultyLabel(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return '⭐ 初级 - 五言绝句';
    case 2:
      return '⭐⭐ 中级 - 七言绝句';
    case 3:
      return '⭐⭐⭐ 高级 - 七言律诗/词';
    default:
      return '';
  }
}

// 获取难度简短标签
export function getPoemDifficultyShortLabel(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return '⭐ 初级';
    case 2:
      return '⭐⭐ 中级';
    case 3:
      return '⭐⭐⭐ 高级';
    default:
      return '';
  }
}
