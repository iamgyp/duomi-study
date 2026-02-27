// 古诗数据 - 按难度分级

export interface PoemLine {
  text: string;
  blanks: number[]; // 需要填空的字的位置索引
}

export interface Poem {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  lines: PoemLine[];
  difficulty: 1 | 2 | 3;
}

export const POEMS: Poem[] = [
  // ========== 难度 1: 简单（5 言绝句，填空 1-2 字）==========
  {
    id: 'poem-001',
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    difficulty: 1,
    lines: [
      { text: '床前明月光', blanks: [2, 3] }, // 明月
      { text: '疑是地上霜', blanks: [2, 3] }, // 地上
      { text: '举头望明月', blanks: [2, 3] }, // 明月
      { text: '低头思故乡', blanks: [2, 3] }, // 故乡
    ],
  },
  {
    id: 'poem-002',
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    difficulty: 1,
    lines: [
      { text: '春眠不觉晓', blanks: [0, 1] }, // 春眠
      { text: '处处闻啼鸟', blanks: [2, 3] }, // 啼鸟
      { text: '夜来风雨声', blanks: [2, 3] }, // 雨声
      { text: '花落知多少', blanks: [0, 1] }, // 花落
    ],
  },
  {
    id: 'poem-003',
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    difficulty: 1,
    lines: [
      { text: '白日依山尽', blanks: [2, 3] }, // 依山
      { text: '黄河入海流', blanks: [0, 1] }, // 黄河
      { text: '欲穷千里目', blanks: [2, 3] }, // 千里
      { text: '更上一层楼', blanks: [2, 3] }, // 一层
    ],
  },
  {
    id: 'poem-004',
    title: '江雪',
    author: '柳宗元',
    dynasty: '唐',
    difficulty: 1,
    lines: [
      { text: '千山鸟飞绝', blanks: [0, 1] }, // 千山
      { text: '万径人踪灭', blanks: [0, 1] }, // 万径
      { text: '孤舟蓑笠翁', blanks: [0, 1] }, // 孤舟
      { text: '独钓寒江雪', blanks: [2, 3] }, // 江雪
    ],
  },
  {
    id: 'poem-005',
    title: '咏鹅',
    author: '骆宾王',
    dynasty: '唐',
    difficulty: 1,
    lines: [
      { text: '鹅鹅鹅', blanks: [0, 1] },
      { text: '曲项向天歌', blanks: [2, 3] }, // 向天
      { text: '白毛浮绿水', blanks: [0, 1] }, // 白毛
      { text: '红掌拨清波', blanks: [0, 1] }, // 红掌
    ],
  },

  // ========== 难度 2: 中等（7 言绝句，填空 2-3 字）==========
  {
    id: 'poem-010',
    title: '望庐山瀑布',
    author: '李白',
    dynasty: '唐',
    difficulty: 2,
    lines: [
      { text: '日照香炉生紫烟', blanks: [2, 3, 4] }, // 香炉生
      { text: '遥看瀑布挂前川', blanks: [2, 3] }, // 瀑布
      { text: '飞流直下三千尺', blanks: [2, 3] }, // 直下
      { text: '疑是银河落九天', blanks: [2, 3] }, // 银河
    ],
  },
  {
    id: 'poem-011',
    title: '早发白帝城',
    author: '李白',
    dynasty: '唐',
    difficulty: 2,
    lines: [
      { text: '朝辞白帝彩云间', blanks: [2, 3] }, // 白帝
      { text: '千里江陵一日还', blanks: [0, 1] }, // 千里
      { text: '两岸猿声啼不住', blanks: [2, 3] }, // 猿声
      { text: '轻舟已过万重山', blanks: [2, 3] }, // 已过
    ],
  },
  {
    id: 'poem-012',
    title: '绝句',
    author: '杜甫',
    dynasty: '唐',
    difficulty: 2,
    lines: [
      { text: '两个黄鹂鸣翠柳', blanks: [2, 3] }, // 黄鹂
      { text: '一行白鹭上青天', blanks: [2, 3] }, // 白鹭
      { text: '窗含西岭千秋雪', blanks: [2, 3] }, // 西岭
      { text: '门泊东吴万里船', blanks: [2, 3] }, // 东吴
    ],
  },
  {
    id: 'poem-013',
    title: '枫桥夜泊',
    author: '张继',
    dynasty: '唐',
    difficulty: 2,
    lines: [
      { text: '月落乌啼霜满天', blanks: [2, 3] }, // 乌啼
      { text: '江枫渔火对愁眠', blanks: [0, 1] }, // 江枫
      { text: '姑苏城外寒山寺', blanks: [0, 1] }, // 姑苏
      { text: '夜半钟声到客船', blanks: [2, 3] }, // 钟声
    ],
  },
  {
    id: 'poem-014',
    title: '清明',
    author: '杜牧',
    dynasty: '唐',
    difficulty: 2,
    lines: [
      { text: '清明时节雨纷纷', blanks: [2, 3] }, // 时节
      { text: '路上行人欲断魂', blanks: [2, 3] }, // 行人
      { text: '借问酒家何处有', blanks: [2, 3] }, // 酒家
      { text: '牧童遥指杏花村', blanks: [2, 3] }, // 遥指
    ],
  },

  // ========== 难度 3: 困难（7 言律诗/长诗，填空 3-4 字）==========
  {
    id: 'poem-020',
    title: '黄鹤楼',
    author: '崔颢',
    dynasty: '唐',
    difficulty: 3,
    lines: [
      { text: '昔人已乘黄鹤去', blanks: [2, 3, 4] }, // 乘黄鹤
      { text: '此地空余黄鹤楼', blanks: [2, 3, 4] }, // 黄鹤楼
      { text: '黄鹤一去不复返', blanks: [0, 1, 2] }, // 黄鹤一
      { text: '白云千载空悠悠', blanks: [0, 1] }, // 白云
      { text: '晴川历历汉阳树', blanks: [2, 3] }, // 历历
      { text: '芳草萋萋鹦鹉洲', blanks: [2, 3] }, // 鹦鹉
      { text: '日暮乡关何处是', blanks: [2, 3] }, // 乡关
      { text: '烟波江上使人愁', blanks: [0, 1] }, // 烟波
    ],
  },
  {
    id: 'poem-021',
    title: '登高',
    author: '杜甫',
    dynasty: '唐',
    difficulty: 3,
    lines: [
      { text: '风急天高猿啸哀', blanks: [2, 3] }, // 天高
      { text: '渚清沙白鸟飞回', blanks: [0, 1] }, // 渚清
      { text: '无边落木萧萧下', blanks: [2, 3] }, // 萧萧
      { text: '不尽长江滚滚来', blanks: [2, 3] }, // 滚滚
      { text: '万里悲秋常作客', blanks: [2, 3] }, // 悲秋
      { text: '百年多病独登台', blanks: [2, 3] }, // 多病
      { text: '艰难苦恨繁霜鬓', blanks: [2, 3] }, // 苦恨
      { text: '潦倒新停浊酒杯', blanks: [2, 3] }, // 新停
    ],
  },
  {
    id: 'poem-022',
    title: '锦瑟',
    author: '李商隐',
    dynasty: '唐',
    difficulty: 3,
    lines: [
      { text: '锦瑟无端五十弦', blanks: [2, 3] }, // 无端
      { text: '一弦一柱思华年', blanks: [2, 3] }, // 思华
      { text: '庄生晓梦迷蝴蝶', blanks: [2, 3] }, // 晓梦
      { text: '望帝春心托杜鹃', blanks: [2, 3] }, // 春心
      { text: '沧海月明珠有泪', blanks: [0, 1] }, // 沧海
      { text: '蓝田日暖玉生烟', blanks: [0, 1] }, // 蓝田
      { text: '此情可待成追忆', blanks: [2, 3] }, // 成追
      { text: '只是当时已惘然', blanks: [2, 3] }, // 惘然
    ],
  },
  {
    id: 'poem-023',
    title: '将进酒（节选）',
    author: '李白',
    dynasty: '唐',
    difficulty: 3,
    lines: [
      { text: '君不见黄河之水天上来', blanks: [3, 4, 5] }, // 黄河之
      { text: '奔流到海不复回', blanks: [0, 1] }, // 奔流
      { text: '君不见高堂明镜悲白发', blanks: [3, 4, 5] }, // 明镜悲
      { text: '朝如青丝暮成雪', blanks: [2, 3] }, // 青丝
      { text: '人生得意须尽欢', blanks: [2, 3] }, // 得意
      { text: '莫使金樽空对月', blanks: [2, 3] }, // 金樽
      { text: '天生我材必有用', blanks: [2, 3] }, // 我材
      { text: '千金散尽还复来', blanks: [0, 1] }, // 千金
    ],
  },
  {
    id: 'poem-024',
    title: '水调歌头·明月几时有',
    author: '苏轼',
    dynasty: '宋',
    difficulty: 3,
    lines: [
      { text: '明月几时有', blanks: [0, 1] }, // 明月
      { text: '把酒问青天', blanks: [2, 3] }, // 青天
      { text: '不知天上宫阙', blanks: [2, 3] }, // 宫阙
      { text: '今夕是何年', blanks: [2, 3] }, // 何年
      { text: '我欲乘风归去', blanks: [2, 3] }, // 乘风
      { text: '又恐琼楼玉宇', blanks: [2, 3] }, // 琼楼
      { text: '高处不胜寒', blanks: [0, 1] }, // 高处
      { text: '起舞弄清影', blanks: [2, 3] }, // 清影
    ],
  },
];

// 根据难度获取诗歌
export function getPoemsByDifficulty(difficulty: 1 | 2 | 3): Poem[] {
  return POEMS.filter(p => p.difficulty === difficulty);
}

// 获取所有诗歌
export function getAllPoems(): Poem[] {
  return POEMS;
}

// 随机选择诗歌
export function getRandomPoem(difficulty?: 1 | 2 | 3): Poem | null {
  const poems = difficulty ? getPoemsByDifficulty(difficulty) : POEMS;
  if (poems.length === 0) return null;
  return poems[Math.floor(Math.random() * poems.length)];
}
