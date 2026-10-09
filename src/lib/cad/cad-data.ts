/**
 * AutoCAD 核心快捷键数据与儿童教学关卡定义
 * 针对一年级小学生（基础字母，词汇量 < 100，电脑装有 AutoCAD）量身设计
 */

export interface CadCommand {
  key: string;              // 快捷键命令，例如 'L', 'C', 'REC', 'SPACE'
  name: string;             // 对应英文全称，例如 "Line", "Circle"
  chinese: string;          // 中文含义，例如 "直线", "圆"
  category: 'draw' | 'modify' | 'control' | 'dimension';
  tip: string;              // 一年级小朋友趣味记忆口诀
  icon: string;             // 图标或符号
  soundText: string;        // TTS 朗读文本
  example: string;          // 简短操作示例
}

export const CAD_COMMANDS: CadCommand[] = [
  // ── 1. 绘图类 (Draw) ─────────────────────────────────
  {
    key: 'L',
    name: 'Line',
    chinese: '直线',
    category: 'draw',
    tip: 'L 像直直的铅笔，一笔画出笔直的线',
    icon: '📏',
    soundText: 'Line, 直线',
    example: '敲 L + 空格，画直线',
  },
  {
    key: 'C',
    name: 'Circle',
    chinese: '圆',
    category: 'draw',
    tip: 'C 是弯弯的圆环，围成一个漂亮的圆',
    icon: '⚪',
    soundText: 'Circle, 圆',
    example: '敲 C + 空格，画圆形',
  },
  {
    key: 'REC',
    name: 'Rectangle',
    chinese: '矩形 / 长方形',
    category: 'draw',
    tip: '拼出像盒子一样的长方形大积木',
    icon: '🔲',
    soundText: 'Rectangle, 矩形',
    example: '敲 REC + 空格，画长方形',
  },
  {
    key: 'PL',
    name: 'Polyline',
    chinese: '多段线',
    category: 'draw',
    tip: '一笔连到底，拐弯也不会断开的线',
    icon: '〰️',
    soundText: 'Polyline, 多段线',
    example: '敲 PL + 空格，画连贯折线',
  },
  {
    key: 'A',
    name: 'Arc',
    chinese: '圆弧',
    category: 'draw',
    tip: '画出弯弯的彩虹、小拱桥和饱满的风帆',
    icon: '🌈',
    soundText: 'Arc, 圆弧',
    example: '敲 A + 空格，画出弯曲弧线',
  },
  {
    key: 'EL',
    name: 'Ellipse',
    chinese: '椭圆',
    category: 'draw',
    tip: '像压扁的小皮球和鸡蛋，画飞碟盘面专用',
    icon: '🥚',
    soundText: 'Ellipse, 椭圆',
    example: '敲 EL + 空格，画扁平椭圆',
  },
  {
    key: 'H',
    name: 'Hatch',
    chinese: '图案填充',
    category: 'draw',
    tip: '泥瓦工附体，给墙面铺砖块、给地板贴瓷砖',
    icon: '🧱',
    soundText: 'Hatch, 图案填充',
    example: '敲 H + 空格，填充斜纹或砖块',
  },

  // ── 2. 修改类 (Modify) ─────────────────────────────────
  {
    key: 'E',
    name: 'Erase',
    chinese: '删除 / 橡皮',
    category: 'modify',
    tip: '像 Eraser 橡皮擦一样，擦掉画错的线条',
    icon: '🧹',
    soundText: 'Erase, 删除',
    example: '敲 E + 空格，擦除图形',
  },
  {
    key: 'CO',
    name: 'Copy',
    chinese: '复制',
    category: 'modify',
    tip: '双胞胎制造机，一秒变出相同的物品',
    icon: '📑',
    soundText: 'Copy, 复制',
    example: '敲 CO + 空格，复制图形',
  },
  {
    key: 'M',
    name: 'Move',
    chinese: '移动',
    category: 'modify',
    tip: '搬家大师，把图形搬到新的位置',
    icon: '🚚',
    soundText: 'Move, 移动',
    example: '敲 M + 空格，搬移图形',
  },
  {
    key: 'RO',
    name: 'Rotate',
    chinese: '旋转',
    category: 'modify',
    tip: '像大风车和摩天轮一样，转个角度',
    icon: '🔄',
    soundText: 'Rotate, 旋转',
    example: '敲 RO + 空格，转动角度',
  },
  {
    key: 'MI',
    name: 'Mirror',
    chinese: '镜像 / 照镜子',
    category: 'modify',
    tip: '照镜子魔法！画好左半边，右半边自动对称变出来！',
    icon: '🪞',
    soundText: 'Mirror, 镜像',
    example: '敲 MI + 空格，对称镜像',
  },
  {
    key: 'TR',
    name: 'Trim',
    chinese: '修剪',
    category: 'modify',
    tip: '拿起小剪刀，咔嚓剪掉交叉的多余线',
    icon: '✂️',
    soundText: 'Trim, 修剪',
    example: '敲 TR + 空格，剪掉多余线',
  },
  {
    key: 'O',
    name: 'Offset',
    chinese: '偏移',
    category: 'modify',
    tip: '向外向内扩散一圈，轻松做出双层墙',
    icon: '🎯',
    soundText: 'Offset, 偏移',
    example: '敲 O + 空格，同心扩散线条',
  },
  {
    key: 'EX',
    name: 'Extend',
    chinese: '延伸',
    category: 'modify',
    tip: '像如意金箍棒一样伸长，直到碰到对面的墙壁',
    icon: '🪄',
    soundText: 'Extend, 延伸',
    example: '敲 EX + 空格，伸长线条',
  },
  {
    key: 'SC',
    name: 'Scale',
    chinese: '缩放',
    category: 'modify',
    tip: '吃了马里奥变大蘑菇，等比例放大或缩小',
    icon: '🍄',
    soundText: 'Scale, 缩放',
    example: '敲 SC + 空格，成比例缩放',
  },
  {
    key: 'F',
    name: 'Fillet',
    chinese: '倒圆角',
    category: 'modify',
    tip: '把扎手尖锐的直角磨圆，做安全光滑的圆角',
    icon: '🛡️',
    soundText: 'Fillet, 倒圆角',
    example: '敲 F + 空格，直角变圆角',
  },

  // ── 3. 测量与标注 (Dimension) ─────────────────────────
  {
    key: 'DLI',
    name: 'Dimension Linear',
    chinese: '尺寸测量 / 标尺',
    category: 'dimension',
    tip: '掏出精密的工程直尺，量一量物体有多长',
    icon: '📐',
    soundText: 'Dimension, 尺寸标注',
    example: '敲 DLI + 空格，标出长度尺寸',
  },

  // ── 4. 控制与辅助类 (Control) ─────────────────────────
  {
    key: 'SPACE',
    name: 'Spacebar',
    chinese: '确认 / 执行',
    category: 'control',
    tip: '左手大拇指轻拍长条空格，发出 CAD 命令！',
    icon: '␣',
    soundText: 'Space, 空格确认',
    example: '敲字母后，务必拍空格',
  },
  {
    key: 'ESC',
    name: 'Escape',
    chinese: '取消 / 退出',
    category: 'control',
    tip: '救命键！命令按错了，敲 ESC 马上重来',
    icon: '🔙',
    soundText: 'Escape, 取消',
    example: '按 ESC 撤销当前输入',
  },
];

export interface CadDrawElement {
  type: 'line' | 'rect' | 'circle' | 'polygon' | 'ellipse' | 'path';
  props: Record<string, number | string>;
  label?: string;
}

export interface CadMissionStep {
  stepIndex: number;
  targetCommand: string;    // 'REC' | 'L' | 'C' | 'CO' | 'TR' | 'RO' | 'O' | 'PL' | 'E' | 'MI' | 'A' | 'EL' | 'H' | 'F' | 'SC' | 'EX' | 'DLI'
  instruction: string;      // 针对一年级孩子的施工指令
  englishWord: string;      // 对应英语单词
  wordMeaning: string;      // 单词中文含义
  tip: string;              // 口诀记忆
  elements: CadDrawElement[]; // 该步骤生成的工程线条
}

export interface CadMission {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  difficulty: 1 | 2 | 3;
  description: string;
  steps: CadMissionStep[];
}

export const CAD_MISSIONS: CadMission[] = [
  // ─────────────────────────────────────────────────────────
  // 关卡 1: 史蒂夫的小木屋
  // ─────────────────────────────────────────────────────────
  {
    id: 'cabin',
    title: '史蒂夫的小木屋',
    subtitle: 'Steve\'s Cabin Blueprint',
    icon: '🏠',
    difficulty: 1,
    description: '使用矩形、直线和圆形，为史蒂夫建造一座结实温暖的木屋避难所！',
    steps: [
      {
        stepIndex: 1,
        targetCommand: 'REC',
        instruction: '先画出房屋地基的主体大方块',
        englishWord: 'Rectangle',
        wordMeaning: '矩形',
        tip: '敲 REC + 空格，像大积木一样打好地基！',
        elements: [
          { type: 'rect', props: { x: 130, y: 170, width: 240, height: 150 } },
        ],
      },
      {
        stepIndex: 2,
        targetCommand: 'L',
        instruction: '画出屋顶的三角人字斜梁',
        englishWord: 'Line',
        wordMeaning: '直线',
        tip: '敲 L + 空格，用铅笔直直拉出斜屋顶！',
        elements: [
          { type: 'line', props: { x1: 100, y1: 170, x2: 250, y2: 70 } },
          { type: 'line', props: { x1: 250, y1: 70, x2: 400, y2: 170 } },
          { type: 'line', props: { x1: 100, y1: 170, x2: 400, y2: 170 } },
        ],
      },
      {
        stepIndex: 3,
        targetCommand: 'C',
        instruction: '在阁楼正中央开一扇漂亮的圆形观星窗',
        englishWord: 'Circle',
        wordMeaning: '圆',
        tip: '敲 C + 空格，画出圆圆的窗框！',
        elements: [
          { type: 'circle', props: { cx: 250, cy: 125, r: 24 } },
          { type: 'line', props: { x1: 226, y1: 125, x2: 274, y2: 125 } },
          { type: 'line', props: { x1: 250, y1: 101, x2: 250, y2: 149 } },
        ],
      },
      {
        stepIndex: 4,
        targetCommand: 'REC',
        instruction: '在房子下层画一扇可以进出的大门',
        englishWord: 'Rectangle',
        wordMeaning: '矩形',
        tip: '再敲一次 REC + 空格，立起高高的大门！',
        elements: [
          { type: 'rect', props: { x: 220, y: 230, width: 60, height: 90 } },
          { type: 'circle', props: { cx: 270, cy: 275, r: 4 } },
        ],
      },
      {
        stepIndex: 5,
        targetCommand: 'CO',
        instruction: '制作两扇一模一样的方形窗户，复制到左右两侧',
        englishWord: 'Copy',
        wordMeaning: '复制',
        tip: '敲 CO + 空格，双胞胎制造机变出对称的窗户！',
        elements: [
          { type: 'rect', props: { x: 155, y: 200, width: 45, height: 45 } },
          { type: 'line', props: { x1: 177.5, y1: 200, x2: 177.5, y2: 245 } },
          { type: 'rect', props: { x: 300, y: 200, width: 45, height: 45 } },
          { type: 'line', props: { x1: 322.5, y1: 200, x2: 322.5, y2: 245 } },
        ],
      },
      {
        stepIndex: 6,
        targetCommand: 'TR',
        instruction: '修剪掉大门底部被地基遮挡的多余线条',
        englishWord: 'Trim',
        wordMeaning: '修剪',
        tip: '敲 TR + 空格，像剪刀一样剪掉多余杂线！',
        elements: [
          { type: 'rect', props: { x: 320, y: 50, width: 25, height: 45 } },
          { type: 'circle', props: { cx: 332, cy: 38, r: 7 } },
          { type: 'circle', props: { cx: 342, cy: 25, r: 5 } },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 关卡 2: 酷炫新能源小汽车
  // ─────────────────────────────────────────────────────────
  {
    id: 'car',
    title: '酷炫新能源小汽车',
    subtitle: 'Electric Car Blueprint',
    icon: '🚗',
    difficulty: 1,
    description: '打造未来流线型小汽车！练习画圆车轮、复制对称、修剪底盘。',
    steps: [
      {
        stepIndex: 1,
        targetCommand: 'REC',
        instruction: '先画出小汽车结实平稳的底盘箱体',
        englishWord: 'Rectangle',
        wordMeaning: '矩形',
        tip: '敲 REC + 空格，先搭出长方体底盘！',
        elements: [
          { type: 'rect', props: { x: 90, y: 200, width: 320, height: 60, rx: 8 } },
        ],
      },
      {
        stepIndex: 2,
        targetCommand: 'C',
        instruction: '在后轮位置画一个圆圆的轮胎',
        englishWord: 'Circle',
        wordMeaning: '圆',
        tip: '敲 C + 空格，圆圆的轮子滚滚转！',
        elements: [
          { type: 'circle', props: { cx: 165, cy: 260, r: 35 } },
          { type: 'circle', props: { cx: 165, cy: 260, r: 16 } },
        ],
      },
      {
        stepIndex: 3,
        targetCommand: 'CO',
        instruction: '复制后轮，变出前方的车轮',
        englishWord: 'Copy',
        wordMeaning: '复制',
        tip: '敲 CO + 空格，变出前方一模一样的车轮！',
        elements: [
          { type: 'circle', props: { cx: 335, cy: 260, r: 35 } },
          { type: 'circle', props: { cx: 335, cy: 260, r: 16 } },
        ],
      },
      {
        stepIndex: 4,
        targetCommand: 'L',
        instruction: '连接流线型车顶与透明前后挡风玻璃',
        englishWord: 'Line',
        wordMeaning: '直线',
        tip: '敲 L + 空格，画出帅气的流线型车窗！',
        elements: [
          { type: 'line', props: { x1: 150, y1: 200, x2: 190, y2: 130 } },
          { type: 'line', props: { x1: 190, y1: 130, x2: 300, y2: 130 } },
          { type: 'line', props: { x1: 300, y1: 130, x2: 345, y2: 200 } },
          { type: 'line', props: { x1: 245, y1: 130, x2: 245, y2: 200 } },
        ],
      },
      {
        stepIndex: 5,
        targetCommand: 'TR',
        instruction: '用小剪刀修剪掉车轮上方穿帮的底盘横线',
        englishWord: 'Trim',
        wordMeaning: '修剪',
        tip: '敲 TR + 空格，剪掉多余线条让轮子露出来！',
        elements: [
          { type: 'line', props: { x1: 90, y1: 225, x2: 110, y2: 225 } },
          { type: 'circle', props: { cx: 395, cy: 215, r: 8 } },
        ],
      },
      {
        stepIndex: 6,
        targetCommand: 'RO',
        instruction: '旋转后方的小天线，接收导航信号',
        englishWord: 'Rotate',
        wordMeaning: '旋转',
        tip: '敲 RO + 空格，把天线旋转到 45 度迎风角！',
        elements: [
          { type: 'line', props: { x1: 185, y1: 130, x2: 165, y2: 105 } },
          { type: 'circle', props: { cx: 163, cy: 103, r: 4 } },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 关卡 3: 像素钻石镐蓝图
  // ─────────────────────────────────────────────────────────
  {
    id: 'pickaxe',
    title: 'Minecraft 钻石镐',
    subtitle: 'Diamond Pickaxe Blueprint',
    icon: '⛏️',
    difficulty: 2,
    description: '打造挖矿神器！学习多段线、偏移与修剪，绘制硬核工程蓝图。',
    steps: [
      {
        stepIndex: 1,
        targetCommand: 'L',
        instruction: '画出木质手柄的中心倾斜主轴线',
        englishWord: 'Line',
        wordMeaning: '直线',
        tip: '敲 L + 空格，倾斜拉出手柄脊椎骨！',
        elements: [
          { type: 'line', props: { x1: 140, y1: 300, x2: 300, y2: 140 } },
        ],
      },
      {
        stepIndex: 2,
        targetCommand: 'O',
        instruction: '向外偏移主轴，生成具有厚度的坚固木柄',
        englishWord: 'Offset',
        wordMeaning: '偏移',
        tip: '敲 O + 空格，向两侧等距平行偏移！',
        elements: [
          { type: 'line', props: { x1: 130, y1: 290, x2: 290, y2: 130 } },
          { type: 'line', props: { x1: 150, y1: 310, x2: 310, y2: 150 } },
          { type: 'line', props: { x1: 130, y1: 290, x2: 150, y2: 310 } },
        ],
      },
      {
        stepIndex: 3,
        targetCommand: 'REC',
        instruction: '在镐柄顶端画出安装钻石镐头的中心方块',
        englishWord: 'Rectangle',
        wordMeaning: '矩形',
        tip: '敲 REC + 空格，画出牢固的中心枢纽！',
        elements: [
          { type: 'rect', props: { x: 275, y: 105, width: 45, height: 45, transform: 'rotate(-45 297.5 127.5)' } },
        ],
      },
      {
        stepIndex: 4,
        targetCommand: 'PL',
        instruction: '用连续不间断的多段线，勾勒出弯曲锋利的钻石镐刃',
        englishWord: 'Polyline',
        wordMeaning: '多段线',
        tip: '敲 PL + 空格，一笔连出两翼月牙镐尖！',
        elements: [
          { type: 'line', props: { x1: 280, y1: 110, x2: 220, y2: 70 } },
          { type: 'line', props: { x1: 220, y1: 70, x2: 170, y2: 90 } },
          { type: 'line', props: { x1: 170, y1: 90, x2: 260, y2: 130 } },
          { type: 'line', props: { x1: 315, y1: 145, x2: 355, y2: 205 } },
          { type: 'line', props: { x1: 355, y1: 205, x2: 335, y2: 255 } },
          { type: 'line', props: { x1: 335, y1: 255, x2: 295, y2: 165 } },
        ],
      },
      {
        stepIndex: 5,
        targetCommand: 'TR',
        instruction: '修剪掉木柄与镐头金属重叠的内部杂线',
        englishWord: 'Trim',
        wordMeaning: '修剪',
        tip: '敲 TR + 空格，把重叠部分清理得干干净净！',
        elements: [
          { type: 'line', props: { x1: 200, y1: 85, x2: 245, y2: 115 } },
          { type: 'line', props: { x1: 340, y1: 220, x2: 310, y2: 175 } },
        ],
      },
      {
        stepIndex: 6,
        targetCommand: 'E',
        instruction: '用橡皮擦工具，擦除开局画的临时参考草稿线',
        englishWord: 'Erase',
        wordMeaning: '删除 / 橡皮',
        tip: '敲 E + 空格，擦除掉最开始的中心辅助线！',
        elements: [
          { type: 'line', props: { x1: 160, y1: 90, x2: 180, y2: 90 } },
          { type: 'line', props: { x1: 170, y1: 80, x2: 170, y2: 100 } },
          { type: 'line', props: { x1: 325, y1: 255, x2: 345, y2: 255 } },
          { type: 'line', props: { x1: 335, y1: 245, x2: 335, y2: 265 } },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 关卡 4: 宇宙探险号火箭
  // ─────────────────────────────────────────────────────────
  {
    id: 'rocket',
    title: '宇宙探险号火箭',
    subtitle: 'Space Explorer Rocket',
    icon: '🚀',
    difficulty: 2,
    description: '向太空发射！综合使用矩形、圆、同心偏移与复制对称翼。',
    steps: [
      {
        stepIndex: 1,
        targetCommand: 'REC',
        instruction: '画出火箭高耸修长的主舱体',
        englishWord: 'Rectangle',
        wordMeaning: '矩形',
        tip: '敲 REC + 空格，长长的大圆柱箭体拔地而起！',
        elements: [
          { type: 'rect', props: { x: 210, y: 130, width: 80, height: 160 } },
        ],
      },
      {
        stepIndex: 2,
        targetCommand: 'L',
        instruction: '画出火箭头部的三角锥形空气阻力罩',
        englishWord: 'Line',
        wordMeaning: '直线',
        tip: '敲 L + 空格，三笔连出破风尖锥罩！',
        elements: [
          { type: 'line', props: { x1: 210, y1: 130, x2: 250, y2: 50 } },
          { type: 'line', props: { x1: 250, y1: 50, x2: 290, y2: 130 } },
        ],
      },
      {
        stepIndex: 3,
        targetCommand: 'C',
        instruction: '在舱体中间开一个圆形太空观察舷窗',
        englishWord: 'Circle',
        wordMeaning: '圆',
        tip: '敲 C + 空格，让宇航员能看到美丽的地球！',
        elements: [
          { type: 'circle', props: { cx: 250, cy: 180, r: 20 } },
        ],
      },
      {
        stepIndex: 4,
        targetCommand: 'O',
        instruction: '向外偏移舷窗，做一层厚厚的金属防护密封圈',
        englishWord: 'Offset',
        wordMeaning: '偏移',
        tip: '敲 O + 空格，做出同心同圆的厚厚保护壳！',
        elements: [
          { type: 'circle', props: { cx: 250, cy: 180, r: 27 } },
        ],
      },
      {
        stepIndex: 5,
        targetCommand: 'CO',
        instruction: '在火箭左侧画好稳定尾翼后，复制一模一样的到右侧',
        englishWord: 'Copy',
        wordMeaning: '复制',
        tip: '敲 CO + 空格，双胞胎尾翼左右对称平衡飞行！',
        elements: [
          { type: 'line', props: { x1: 210, y1: 230, x2: 165, y2: 290 } },
          { type: 'line', props: { x1: 165, y1: 290, x2: 210, y2: 290 } },
          { type: 'line', props: { x1: 290, y1: 230, x2: 335, y2: 290 } },
          { type: 'line', props: { x1: 335, y1: 290, x2: 290, y2: 290 } },
        ],
      },
      {
        stepIndex: 6,
        targetCommand: 'TR',
        instruction: '修剪底部火箭喷口连接处，添加火焰推进流',
        englishWord: 'Trim',
        wordMeaning: '修剪',
        tip: '敲 TR + 空格，清理排气管，准备点火升空！',
        elements: [
          { type: 'line', props: { x1: 225, y1: 290, x2: 215, y2: 315 } },
          { type: 'line', props: { x1: 215, y1: 315, x2: 285, y2: 315 } },
          { type: 'line', props: { x1: 285, y1: 315, x2: 275, y2: 290 } },
          { type: 'line', props: { x1: 250, y1: 315, x2: 250, y2: 345 } },
          { type: 'line', props: { x1: 235, y1: 315, x2: 230, y2: 338 } },
          { type: 'line', props: { x1: 265, y1: 315, x2: 270, y2: 338 } },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 关卡 5: Minecraft 城堡要塞 (新增)
  // ─────────────────────────────────────────────────────────
  {
    id: 'fortress',
    title: 'Minecraft 城堡要塞',
    subtitle: 'Fortress Castle Blueprint',
    icon: '🏰',
    difficulty: 2,
    description: '宏伟中世纪要塞！体验神奇的 MI 镜像照镜子法宝，一键变出对称塔楼。',
    steps: [
      {
        stepIndex: 1,
        targetCommand: 'REC',
        instruction: '画出城堡中央高大的防守主城墙',
        englishWord: 'Rectangle',
        wordMeaning: '矩形',
        tip: '敲 REC + 空格，厚实的中央城墙拔地而起！',
        elements: [
          { type: 'rect', props: { x: 175, y: 180, width: 150, height: 130 } },
        ],
      },
      {
        stepIndex: 2,
        targetCommand: 'REC',
        instruction: '在左侧修建一座高耸威风的圆石瞭望塔楼',
        englishWord: 'Rectangle',
        wordMeaning: '矩形',
        tip: '敲 REC + 空格，高高的守卫塔楼能看到远处的怪物！',
        elements: [
          { type: 'rect', props: { x: 105, y: 120, width: 70, height: 190 } },
          { type: 'rect', props: { x: 95, y: 100, width: 90, height: 20 } }, // 塔顶出挑
        ],
      },
      {
        stepIndex: 3,
        targetCommand: 'MI',
        instruction: '照镜子魔法！使用镜像命令，右侧塔楼一秒对称变出来',
        englishWord: 'Mirror',
        wordMeaning: '镜像 / 照镜子',
        tip: '敲 MI + 空格，照镜子法宝！不用重画，右侧塔楼瞬间诞生！',
        elements: [
          { type: 'rect', props: { x: 325, y: 120, width: 70, height: 190 } },
          { type: 'rect', props: { x: 315, y: 100, width: 90, height: 20 } },
        ],
      },
      {
        stepIndex: 4,
        targetCommand: 'L',
        instruction: '在中央城墙上方画出红蓝迎风飘扬的骑士旗帜',
        englishWord: 'Line',
        wordMeaning: '直线',
        tip: '敲 L + 空格，竖立旗杆，拉出威风飘扬的旗帜！',
        elements: [
          { type: 'line', props: { x1: 250, y1: 180, x2: 250, y2: 120 } },
          { type: 'line', props: { x1: 250, y1: 120, x2: 290, y2: 135 } },
          { type: 'line', props: { x1: 290, y1: 135, x2: 250, y2: 150 } },
        ],
      },
      {
        stepIndex: 5,
        targetCommand: 'REC',
        instruction: '在城墙正中央开一座坚不可摧的铁闸城门',
        englishWord: 'Rectangle',
        wordMeaning: '矩形',
        tip: '敲 REC + 空格，放下厚重的橡木吊桥铁闸门！',
        elements: [
          { type: 'rect', props: { x: 220, y: 240, width: 60, height: 70, rx: 18 } },
        ],
      },
      {
        stepIndex: 6,
        targetCommand: 'TR',
        instruction: '修剪掉城墙多余横线，雕琢出整齐的凹凸城垛',
        englishWord: 'Trim',
        wordMeaning: '修剪',
        tip: '敲 TR + 空格，剪出齿状城垛，让弓箭手从容射击！',
        elements: [
          { type: 'rect', props: { x: 185, y: 165, width: 25, height: 15 } },
          { type: 'rect', props: { x: 290, y: 165, width: 25, height: 15 } },
          { type: 'line', props: { x1: 235, y1: 240, x2: 235, y2: 310 } }, // 门缝
          { type: 'line', props: { x1: 265, y1: 240, x2: 265, y2: 310 } },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 关卡 6: 小小智能战斗机器人 (新增)
  // ─────────────────────────────────────────────────────────
  {
    id: 'robot',
    title: '小小智能战斗机器人',
    subtitle: 'Battle Robot Blueprint',
    icon: '🤖',
    difficulty: 2,
    description: '机械工程师出动！练习画机甲脑袋、雷达圆眼、镜像双机械臂与履带底盘。',
    steps: [
      {
        stepIndex: 1,
        targetCommand: 'REC',
        instruction: '画出机器人方方正正、聪明智慧的机甲头部',
        englishWord: 'Rectangle',
        wordMeaning: '矩形',
        tip: '敲 REC + 空格，帅气的方形头盔装载超级芯片！',
        elements: [
          { type: 'rect', props: { x: 190, y: 70, width: 120, height: 85, rx: 10 } },
        ],
      },
      {
        stepIndex: 2,
        targetCommand: 'C',
        instruction: '在脸部中央装上炯炯有神、能夜视的圆形雷达大眼',
        englishWord: 'Circle',
        wordMeaning: '圆',
        tip: '敲 C + 空格，圆圆的摄像头扫描四方！',
        elements: [
          { type: 'circle', props: { cx: 250, cy: 112, r: 24 } },
          { type: 'circle', props: { cx: 250, cy: 112, r: 10 } },
        ],
      },
      {
        stepIndex: 3,
        targetCommand: 'REC',
        instruction: '建造装有合金护甲的结实机甲躯干身躯',
        englishWord: 'Rectangle',
        wordMeaning: '矩形',
        tip: '敲 REC + 空格，核心装甲保护动力反应堆！',
        elements: [
          { type: 'rect', props: { x: 170, y: 170, width: 160, height: 100, rx: 6 } },
          { type: 'circle', props: { cx: 250, cy: 220, r: 16 } }, // 能量核心
        ],
      },
      {
        stepIndex: 4,
        targetCommand: 'L',
        instruction: '连接左侧多关节的激光机械臂',
        englishWord: 'Line',
        wordMeaning: '直线',
        tip: '敲 L + 空格，机械关节灵活弯折，充满力量！',
        elements: [
          { type: 'line', props: { x1: 170, y1: 190, x2: 115, y2: 215 } },
          { type: 'line', props: { x1: 115, y1: 215, x2: 125, y2: 260 } },
          { type: 'circle', props: { cx: 125, cy: 265, r: 8 } }, // 机械手爪
        ],
      },
      {
        stepIndex: 5,
        targetCommand: 'MI',
        instruction: '使用照镜子镜像命令，右侧机械手臂一键对称变出！',
        englishWord: 'Mirror',
        wordMeaning: '镜像 / 照镜子',
        tip: '敲 MI + 空格，照镜子法宝！左右双臂完全对称！',
        elements: [
          { type: 'line', props: { x1: 330, y1: 190, x2: 385, y2: 215 } },
          { type: 'line', props: { x1: 385, y1: 215, x2: 375, y2: 260 } },
          { type: 'circle', props: { cx: 375, cy: 265, r: 8 } },
        ],
      },
      {
        stepIndex: 6,
        targetCommand: 'O',
        instruction: '向外偏移底盘圆形，做出双层全地形越野履带车轮',
        englishWord: 'Offset',
        wordMeaning: '偏移',
        tip: '敲 O + 空格，偏移出厚厚的履带橡胶保护层！',
        elements: [
          { type: 'circle', props: { cx: 205, cy: 300, r: 24 } },
          { type: 'circle', props: { cx: 295, cy: 300, r: 24 } },
          { type: 'line', props: { x1: 205, y1: 324, x2: 295, y2: 324 } }, // 履带底平线
          { type: 'line', props: { x1: 205, y1: 276, x2: 295, y2: 276 } },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 关卡 7: Minecraft 钻石神剑 (新增)
  // ─────────────────────────────────────────────────────────
  {
    id: 'sword',
    title: 'Minecraft 钻石神剑',
    subtitle: 'Diamond Sword Blueprint',
    icon: '⚔️',
    difficulty: 3,
    description: '打造无敌勇者之刃！绘制阶梯剑脊、对角剑格护手与锋利双面剑刃。',
    steps: [
      {
        stepIndex: 1,
        targetCommand: 'L',
        instruction: '画出神剑贯穿剑柄与剑尖的倾斜主中心线',
        englishWord: 'Line',
        wordMeaning: '直线',
        tip: '敲 L + 空格，斜向 45 度拉出神剑坚韧的龙骨！',
        elements: [
          { type: 'line', props: { x1: 130, y1: 320, x2: 360, y2: 90 } },
        ],
      },
      {
        stepIndex: 2,
        targetCommand: 'O',
        instruction: '向两侧平行偏移中心线，生成宽阔闪耀的锋利剑刃',
        englishWord: 'Offset',
        wordMeaning: '偏移',
        tip: '敲 O + 空格，向两边等距扩展出锋刃厚度！',
        elements: [
          { type: 'line', props: { x1: 140, y1: 330, x2: 370, y2: 100 } },
          { type: 'line', props: { x1: 120, y1: 310, x2: 350, y2: 80 } },
        ],
      },
      {
        stepIndex: 3,
        targetCommand: 'REC',
        instruction: '在手柄上方画出保护双手的方块剑格护手',
        englishWord: 'Rectangle',
        wordMeaning: '矩形',
        tip: '敲 REC + 空格，结实的护手能弹开敌人的攻击！',
        elements: [
          { type: 'rect', props: { x: 175, y: 235, width: 45, height: 45, transform: 'rotate(-45 197.5 257.5)' } },
        ],
      },
      {
        stepIndex: 4,
        targetCommand: 'MI',
        instruction: '照镜子！将护手两侧的月牙倒钩对称镜像出来',
        englishWord: 'Mirror',
        wordMeaning: '镜像 / 照镜子',
        tip: '敲 MI + 空格，照镜子法宝！神剑护翼左右天生对称！',
        elements: [
          { type: 'line', props: { x1: 170, y1: 230, x2: 135, y2: 240 } },
          { type: 'line', props: { x1: 135, y1: 240, x2: 155, y2: 275 } },
          { type: 'line', props: { x1: 225, y1: 285, x2: 260, y2: 275 } },
          { type: 'line', props: { x1: 260, y1: 275, x2: 240, y2: 240 } },
        ],
      },
      {
        stepIndex: 5,
        targetCommand: 'PL',
        instruction: '用连续多段线勾勒出无坚不摧的三角形钻石剑尖',
        englishWord: 'Polyline',
        wordMeaning: '多段线',
        tip: '敲 PL + 空格，一笔折出闪电般尖锐的锋头！',
        elements: [
          { type: 'line', props: { x1: 350, y1: 80, x2: 385, y2: 65 } },
          { type: 'line', props: { x1: 385, y1: 65, x2: 370, y2: 100 } },
        ],
      },
      {
        stepIndex: 6,
        targetCommand: 'TR',
        instruction: '修剪掉剑身与护手交错杂线，并附上附魔微粒闪光',
        englishWord: 'Trim',
        wordMeaning: '修剪',
        tip: '敲 TR + 空格，擦亮钻石神剑，准备屠龙！',
        elements: [
          { type: 'line', props: { x1: 385, y1: 45, x2: 385, y2: 55 } }, // 星芒闪烁
          { type: 'line', props: { x1: 380, y1: 50, x2: 390, y2: 50 } },
          { type: 'line', props: { x1: 275, y1: 155, x2: 275, y2: 165 } },
          { type: 'line', props: { x1: 270, y1: 160, x2: 280, y2: 160 } },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 关卡 8: 无畏号海盗帆船 (新增)
  // ─────────────────────────────────────────────────────────
  {
    id: 'ship',
    title: '无畏号海盗帆船',
    subtitle: 'Pirate Sailing Ship',
    icon: '⛵',
    difficulty: 3,
    description: '扬帆起航探索大洋！学习圆弧绘制饱满风帆、多段线船体与舷窗复制。',
    steps: [
      {
        stepIndex: 1,
        targetCommand: 'PL',
        instruction: '用连贯多段线勾勒出劈波斩浪的木质大船体',
        englishWord: 'Polyline',
        wordMeaning: '多段线',
        tip: '敲 PL + 空格，一笔拉出翘起的船头和坚固的船底！',
        elements: [
          { type: 'line', props: { x1: 80, y1: 250, x2: 130, y2: 320 } },
          { type: 'line', props: { x1: 130, y1: 320, x2: 370, y2: 320 } },
          { type: 'line', props: { x1: 370, y1: 320, x2: 430, y2: 230 } },
          { type: 'line', props: { x1: 430, y1: 230, x2: 80, y2: 250 } },
        ],
      },
      {
        stepIndex: 2,
        targetCommand: 'L',
        instruction: '竖立高耸入云的主桅杆与牢固的水平横桁梁',
        englishWord: 'Line',
        wordMeaning: '直线',
        tip: '敲 L + 空格，直直立起帆船的核心脊梁大木柱！',
        elements: [
          { type: 'line', props: { x1: 250, y1: 70, x2: 250, y2: 250 } }, // 主桅杆
          { type: 'line', props: { x1: 170, y1: 110, x2: 330, y2: 110 } }, // 上桁梁
          { type: 'line', props: { x1: 160, y1: 220, x2: 340, y2: 220 } }, // 下桁梁
        ],
      },
      {
        stepIndex: 3,
        targetCommand: 'A',
        instruction: '使用圆弧命令，画出狂风吹拂下鼓起饱满的弧形主帆',
        englishWord: 'Arc',
        wordMeaning: '圆弧',
        tip: '敲 A + 空格，圆弧让风帆像吃饱了风一样鼓鼓的！',
        elements: [
          { type: 'path', props: { d: 'M 170 110 Q 250 145 330 110 L 340 220 Q 250 255 160 220 Z' } },
        ],
      },
      {
        stepIndex: 4,
        targetCommand: 'C',
        instruction: '在船体侧面开出能观察大洋的圆形船长室舷窗',
        englishWord: 'Circle',
        wordMeaning: '圆',
        tip: '敲 C + 空格，圆圆的玻璃窗能看到海豚跳跃！',
        elements: [
          { type: 'circle', props: { cx: 160, cy: 285, r: 14 } },
        ],
      },
      {
        stepIndex: 5,
        targetCommand: 'CO',
        instruction: '复制第一扇舷窗，变出一整排整齐的海防舷窗',
        englishWord: 'Copy',
        wordMeaning: '复制',
        tip: '敲 CO + 空格，双胞胎制造机快速排出一排舷窗！',
        elements: [
          { type: 'circle', props: { cx: 210, cy: 285, r: 14 } },
          { type: 'circle', props: { cx: 260, cy: 285, r: 14 } },
          { type: 'circle', props: { cx: 310, cy: 285, r: 14 } },
        ],
      },
      {
        stepIndex: 6,
        targetCommand: 'TR',
        instruction: '修剪掉穿帮线条，在船头画出乘风破浪的翻滚白浪',
        englishWord: 'Trim',
        wordMeaning: '修剪',
        tip: '敲 TR + 空格，修剪整洁，白浪滔滔向着新大陆全速前进！',
        elements: [
          { type: 'path', props: { d: 'M 60 270 Q 75 255 90 270 Q 105 285 120 270' } },
          { type: 'line', props: { x1: 250, y1: 70, x2: 290, y2: 80 } }, // 桅杆顶骷髅小彩旗
          { type: 'line', props: { x1: 290, y1: 80, x2: 250, y2: 90 } },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 关卡 9: 外星探索飞碟 UFO (新增)
  // ─────────────────────────────────────────────────────────
  {
    id: 'ufo',
    title: '外星探索飞碟 UFO',
    subtitle: 'Alien UFO Starship',
    icon: '🛸',
    difficulty: 3,
    description: '探索神秘宇宙！学习椭圆扁盘底座、圆顶能量罩与复制环形反重力灯。',
    steps: [
      {
        stepIndex: 1,
        targetCommand: 'EL',
        instruction: '使用椭圆命令，画出飞碟标志性的巨大扁平银色飞盘',
        englishWord: 'Ellipse',
        wordMeaning: '椭圆',
        tip: '敲 EL + 空格，压扁的圆环就是宇宙飞碟的飞盘底座！',
        elements: [
          { type: 'ellipse', props: { cx: 250, cy: 200, rx: 170, ry: 45 } },
        ],
      },
      {
        stepIndex: 2,
        targetCommand: 'C',
        instruction: '在飞碟正上方安装一个半球形全景透明座舱玻璃罩',
        englishWord: 'Circle',
        wordMeaning: '圆',
        tip: '敲 C + 空格，大大的玻璃罩让外星人看清浩瀚星空！',
        elements: [
          { type: 'circle', props: { cx: 250, cy: 175, r: 50 } },
        ],
      },
      {
        stepIndex: 3,
        targetCommand: 'O',
        instruction: '向外偏移座舱罩，镀上厚厚的同心同圆能量防护护盾',
        englishWord: 'Offset',
        wordMeaning: '偏移',
        tip: '敲 O + 空格，同心扩散一层抵御宇宙射线的电磁盾！',
        elements: [
          { type: 'circle', props: { cx: 250, cy: 175, r: 60 } },
        ],
      },
      {
        stepIndex: 4,
        targetCommand: 'L',
        instruction: '从飞碟底部向下画出神秘强大的反重力牵引光束',
        englishWord: 'Line',
        wordMeaning: '直线',
        tip: '敲 L + 空格，笔直的光束可以把小羊和奶牛吸上飞船！',
        elements: [
          { type: 'line', props: { x1: 190, y1: 240, x2: 120, y2: 345 } },
          { type: 'line', props: { x1: 310, y1: 240, x2: 380, y2: 345 } },
          { type: 'line', props: { x1: 120, y1: 345, x2: 380, y2: 345 } },
        ],
      },
      {
        stepIndex: 5,
        targetCommand: 'CO',
        instruction: '在飞碟边缘复制一圈闪闪发光的环形彩色推进器信标灯',
        englishWord: 'Copy',
        wordMeaning: '复制',
        tip: '敲 CO + 空格，双胞胎变出 5 盏一字排开的神秘反重力跑马灯！',
        elements: [
          { type: 'circle', props: { cx: 120, cy: 200, r: 8 } },
          { type: 'circle', props: { cx: 170, cy: 215, r: 9 } },
          { type: 'circle', props: { cx: 250, cy: 225, r: 10 } },
          { type: 'circle', props: { cx: 330, cy: 215, r: 9 } },
          { type: 'circle', props: { cx: 380, cy: 200, r: 8 } },
        ],
      },
      {
        stepIndex: 6,
        targetCommand: 'TR',
        instruction: '修剪掉座舱与底盘遮挡杂线，在座舱里勾勒好奇的外星人小脑袋',
        englishWord: 'Trim',
        wordMeaning: '修剪',
        tip: '敲 TR + 空格，哇！外星小小飞行员在朝你挥手打招呼呢！',
        elements: [
          { type: 'circle', props: { cx: 250, cy: 165, r: 14 } }, // 外星人头
          { type: 'circle', props: { cx: 245, cy: 163, r: 3 } },  // 大眼睛
          { type: 'circle', props: { cx: 255, cy: 163, r: 3 } },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 关卡 10: 霸王龙头骨化石 (新增)
  // ─────────────────────────────────────────────────────────
  {
    id: 'dino',
    title: '霸王龙头骨化石',
    subtitle: 'T-Rex Fossil Blueprint',
    icon: '🦖',
    difficulty: 3,
    description: '考古小小古生物学家！绘制白垩纪霸主霸王龙的巨大头骨化石与锋利尖牙。',
    steps: [
      {
        stepIndex: 1,
        targetCommand: 'PL',
        instruction: '用连贯的多段线，勾勒出霸王龙霸气威武的上颌骨轮廓',
        englishWord: 'Polyline',
        wordMeaning: '多段线',
        tip: '敲 PL + 空格，一笔连出凸起的鼻骨和巨大的嘴吻！',
        elements: [
          { type: 'path', props: { d: 'M 110 180 Q 140 100 240 100 Q 340 110 390 160 L 400 220 L 260 215 Z' } },
        ],
      },
      {
        stepIndex: 2,
        targetCommand: 'C',
        instruction: '在头骨中央画出霸王龙锐利深邃的圆形眼眶眶孔化石',
        englishWord: 'Circle',
        wordMeaning: '圆',
        tip: '敲 C + 空格，圆圆的眼窝能看出千百万年前的霸气！',
        elements: [
          { type: 'circle', props: { cx: 210, cy: 150, r: 24 } },
          { type: 'circle', props: { cx: 310, cy: 160, r: 18 } }, // 鼻前孔
        ],
      },
      {
        stepIndex: 3,
        targetCommand: 'PL',
        instruction: '在下方连贯勾勒出张开大嘴怒吼的霸气下颌骨',
        englishWord: 'Polyline',
        wordMeaning: '多段线',
        tip: '敲 PL + 空格，强健有力的咬合下巴展现恐龙王者之姿！',
        elements: [
          { type: 'path', props: { d: 'M 110 210 L 160 300 Q 280 305 380 260 L 370 230 L 220 250 Z' } },
        ],
      },
      {
        stepIndex: 4,
        targetCommand: 'O',
        instruction: '向内偏移眼孔与骨壁，增强远古骨骼的层次立体感',
        englishWord: 'Offset',
        wordMeaning: '偏移',
        tip: '敲 O + 空格，偏移出千百万年地层风化的化石骨壁厚度！',
        elements: [
          { type: 'circle', props: { cx: 210, cy: 150, r: 16 } },
        ],
      },
      {
        stepIndex: 5,
        targetCommand: 'L',
        instruction: '在上下颚之间，一根根画出如同香蕉般粗壮锋利的霸王龙尖牙',
        englishWord: 'Line',
        wordMeaning: '直线',
        tip: '敲 L + 空格，锋利无比的尖牙能咬碎一切！',
        elements: [
          { type: 'line', props: { x1: 270, y1: 215, x2: 265, y2: 235 } },
          { type: 'line', props: { x1: 295, y1: 216, x2: 290, y2: 238 } },
          { type: 'line', props: { x1: 320, y1: 217, x2: 315, y2: 240 } },
          { type: 'line', props: { x1: 345, y1: 218, x2: 340, y2: 242 } },
          { type: 'line', props: { x1: 370, y1: 219, x2: 365, y2: 238 } },
          { type: 'line', props: { x1: 390, y1: 220, x2: 385, y2: 235 } },
        ],
      },
      {
        stepIndex: 6,
        targetCommand: 'TR',
        instruction: '用小剪刀清理骨缝交接杂线，化石蓝图完美竣工！',
        englishWord: 'Trim',
        wordMeaning: '修剪',
        tip: '敲 TR + 空格，恭喜你成为白垩纪小小古生物首席工程师！',
        elements: [
          { type: 'line', props: { x1: 100, y1: 170, x2: 120, y2: 190 } }, // 颈椎接榫
          { type: 'line', props: { x1: 100, y1: 220, x2: 120, y2: 200 } },
        ],
      },
    ],
  },
];
