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

// 生成古诗填空练习
export function generatePoemExercises(config: PoemConfig): PoemExercise[] {
  const exercises: PoemExercise[] = [];
  const poems = getPoemsByDifficulty(config.difficulty);
  
  if (poems.length === 0) return exercises;

  // 随机选择诗歌（不重复）
  const shuffled = [...poems].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(config.count, poems.length));

  for (const poem of selected) {
    exercises.push({
      id: `poem-ex-${poem.id}-${Date.now()}`,
      poem,
      showAnswers: config.showAnswers,
    });
  }

  return exercises;
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
