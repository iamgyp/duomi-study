/**
 * Configuration and level generators for Note Block Simon Says game.
 */

export interface NoteBlockDef {
  id: number;
  name: string;
  enName: string;
  colorName: string;
  bgHex: string;
  activeHex: string;
  borderHex: string;
  glowColor: string;
  icon: string;
  keyLabel: string;
}

export const NOTE_BLOCKS: NoteBlockDef[] = [
  {
    id: 0,
    name: '红石灯',
    enName: 'Redstone Lamp',
    colorName: '炽热红',
    bgHex: '#991B1B',
    activeHex: '#EF4444',
    borderHex: '#7F1D1D',
    glowColor: 'rgba(239, 68, 68, 0.65)',
    icon: '🔴',
    keyLabel: 'Q / 1',
  },
  {
    id: 1,
    name: '青金石灯',
    enName: 'Lapis Lamp',
    colorName: '深海蓝',
    bgHex: '#1E40AF',
    activeHex: '#3B82F6',
    borderHex: '#1E3A8A',
    glowColor: 'rgba(59, 130, 246, 0.65)',
    icon: '🔵',
    keyLabel: 'W / 2',
  },
  {
    id: 2,
    name: '绿宝石灯',
    enName: 'Emerald Lamp',
    colorName: '翡翠绿',
    bgHex: '#065F46',
    activeHex: '#10B981',
    borderHex: '#064E3B',
    glowColor: 'rgba(16, 185, 129, 0.65)',
    icon: '🟢',
    keyLabel: 'E / 3',
  },
  {
    id: 3,
    name: '黄金灯',
    enName: 'Gold Lamp',
    colorName: '辉煌金',
    bgHex: '#92400E',
    activeHex: '#F59E0B',
    borderHex: '#78350F',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    icon: '🟡',
    keyLabel: 'R / 4',
  },
];

export interface NoteDifficulty {
  id: 'beginner' | 'intermediate' | 'expert' | 'endless';
  title: string;
  startSteps: number;
  maxSteps: number;
  intervalMs: number;
  highlightDurationMs: number;
  description: string;
  badge: string;
}

export const NOTE_DIFFICULTIES: NoteDifficulty[] = [
  {
    id: 'beginner',
    title: '启蒙探险',
    startSteps: 3,
    maxSteps: 4,
    intervalMs: 750,
    highlightDurationMs: 450,
    description: '3~4步节拍，慢速节奏，适合一年级刚上手建立记忆信心',
    badge: '🌱 慢速·启蒙',
  },
  {
    id: 'intermediate',
    title: '进阶守卫',
    startSteps: 5,
    maxSteps: 6,
    intervalMs: 600,
    highlightDurationMs: 380,
    description: '5~6步中速连击，专注力与视听短时工作记忆考验',
    badge: '⚔️ 中速·守卫',
  },
  {
    id: 'expert',
    title: '大师突破',
    startSteps: 7,
    maxSteps: 8,
    intervalMs: 480,
    highlightDurationMs: 300,
    description: '7~8步快速连音，挑战大脑即时记忆容量极限',
    badge: '👑 疾速·大师',
  },
  {
    id: 'endless',
    title: '无尽神庙',
    startSteps: 3,
    maxSteps: 99,
    intervalMs: 500,
    highlightDurationMs: 320,
    description: '每成功一次增加1步，挑战个人连胜记录与最高连击！',
    badge: '♾️ 无尽·冲榜',
  },
];

/** Generate a random sequence of note block indices */
export function generateRandomNoteSequence(length: number): number[] {
  const seq: number[] = [];
  for (let i = 0; i < length; i++) {
    // Avoid 3 identical repetitions in a row for better musicality
    let next: number;
    do {
      next = Math.floor(Math.random() * 4);
    } while (i >= 2 && seq[i - 1] === next && seq[i - 2] === next);
    seq.push(next);
  }
  return seq;
}
