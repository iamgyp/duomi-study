/**
 * AutoCAD 核心快捷键数据与儿童教学关卡定义
 * 针对一年级小学生（基础字母，词汇量 < 100，电脑装有 AutoCAD）量身设计
 */

export interface CadCommand {
  key: string;              // 快捷键命令，例如 'L', 'C', 'REC', 'SPACE'
  name: string;             // 对应英文全称，例如 "Line", "Circle"
  chinese: string;          // 中文含义，例如 "直线", "圆"
  category: 'draw' | 'modify' | 'control';
  tip: string;              // 一年级小朋友趣味记忆口诀
  icon: string;             // 图标或符号
  soundText: string;        // TTS 朗读文本
  example: string;          // 简短操作示例
}

export const CAD_COMMANDS: CadCommand[] = [
  // ── 绘图类 ──────────────────────────────────────────
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

  // ── 修改类 ──────────────────────────────────────────
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

  // ── 控制与辅助类 ────────────────────────────────────
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
  type: 'line' | 'rect' | 'circle' | 'polygon';
  props: Record<string, number | string>;
  label?: string;
}

export interface CadMissionStep {
  stepIndex: number;
  targetCommand: string;    // 'REC' | 'L' | 'C' | 'CO' | 'TR' | 'RO' | 'O' | 'PL' | 'E'
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
          { type: 'circle', props: { cx: 270, cy: 275, r: 4 } }, // 门把手
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
          // 装饰小烟囱与烟圈
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
    difficulty: 2,
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
          { type: 'circle', props: { cx: 165, cy: 260, r: 16 } }, // 轮毂
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
          { type: 'circle', props: { cx: 335, cy: 260, r: 16 } }, // 前轮毂
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
          { type: 'line', props: { x1: 245, y1: 130, x2: 245, y2: 200 } }, // B柱
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
          { type: 'line', props: { x1: 90, y1: 225, x2: 110, y2: 225 } }, // 车尾反光条
          { type: 'circle', props: { cx: 395, cy: 215, r: 8 } },          // 车头大灯
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
    title: 'Minecraft 钻石镐蓝图',
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
          { type: 'line', props: { x1: 130, y1: 290, x2: 150, y2: 310 } }, // 底部封口
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
          // 左镐尖
          { type: 'line', props: { x1: 280, y1: 110, x2: 220, y2: 70 } },
          { type: 'line', props: { x1: 220, y1: 70, x2: 170, y2: 90 } },
          { type: 'line', props: { x1: 170, y1: 90, x2: 260, y2: 130 } },
          // 右镐尖
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
          // 钻石纹理刻线
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
          // 镐头发光小十字闪烁
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
    difficulty: 3,
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
          // 左尾翼
          { type: 'line', props: { x1: 210, y1: 230, x2: 165, y2: 290 } },
          { type: 'line', props: { x1: 165, y1: 290, x2: 210, y2: 290 } },
          // 右尾翼
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
          // 底部喷口梯形
          { type: 'line', props: { x1: 225, y1: 290, x2: 215, y2: 315 } },
          { type: 'line', props: { x1: 215, y1: 315, x2: 285, y2: 315 } },
          { type: 'line', props: { x1: 285, y1: 315, x2: 275, y2: 290 } },
          // 喷射粒子
          { type: 'line', props: { x1: 250, y1: 315, x2: 250, y2: 345 } },
          { type: 'line', props: { x1: 235, y1: 315, x2: 230, y2: 338 } },
          { type: 'line', props: { x1: 265, y1: 315, x2: 270, y2: 338 } },
        ],
      },
    ],
  },
];
