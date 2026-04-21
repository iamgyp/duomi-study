# 在线做题 + 成就系统 — 设计文档

**日期**: 2026-04-21
**状态**: Draft

## 概述

为多米习题站添加在线做题功能（覆盖数学、代数、语文、英语四个学科）以及配套的成就激励系统。用户可以在网页上答题、自动判对错、记录成绩，并基于真实数据解锁成就。原有的 PDF/图片导出打印功能保持不变。

## 架构

```
┌──────────────────────────────────────────────────────┐
│                  各学科在线做题页面                     │
│  /math/quiz  /math/algebra/quiz  /chinese/quiz        │
│  /english/quiz                                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Quiz Engine (useQuiz Hook)                          │
│  ├── 题目加载、导航、答案收集                          │
│  ├── 判对错逻辑                                       │
│  └── 结果页渲染                                       │
│                                                      │
│  StatsAggregator                                     │
│  ├── 从 quiz_sessions + study_records 聚合统计        │
│  └── 缓存结果避免重复计算                              │
│                                                      │
│  AchievementEngine                                   │
│  ├── 成就注册表（定义、条件、图标）                     │
│  ├── 条件评估器                                       │
│  └── 解锁管理 + localStorage 持久化                   │
│                                                      │
│  /achievements (成就页面)                             │
│  ├── 分类 tab（全部/里程碑/全对/学科/收集）            │
│  ├── 进度展示 + 未解锁遮罩                            │
│  └── 首页新增入口卡片                                  │
│                                                      │
├──────────────────────────────────────────────────────┤
│  localStorage: study_records  (已有，不变)             │
│  localStorage: quiz_sessions     (新增)               │
│  localStorage: achievements_unlocked (新增)           │
└──────────────────────────────────────────────────────┘
```

## 核心隔离原则

- **AchievementEngine** 是纯逻辑层，不依赖 React，可独立测试
- **useAchievements** 是 React 桥接层，连接引擎和 UI
- **StatsAggregator** 从现有数据读取，不修改现有学习记录结构
- **Quiz Engine** 每学科独立一套 UI，共享判对错和结果页逻辑

## 在线做题交互

### 通用流程

1. 用户在配置页面设置参数（难度、数量等），点击"开始做题"
2. 进入做题页面，逐题导航（上一题/下一题）
3. 每道题已答标记，顶部进度条显示完成度
4. 全部答完后点击"提交"，进入结果页
5. 结果页显示：正确率、用时、错题回顾
6. 结果页操作：重新练习、返回首页、导出PDF

### 各学科答题方式

**数学（选择题）**：
- 每道题 4 个选项（1 正确 + 3 干扰项，干扰项基于常见计算错误生成）
- 底部"上一题 / 下一题"导航
- 已有题目生成逻辑可直接复用 `generateMathQuestions`，新增干扰项生成

**代数商店（选择题）**：
- 与数学相同模式
- 干扰项基于常见代数计算错误（如先加后乘等顺序错误）

**语文古诗填空（填空输入）**：
- 每首诗显示诗句，空白处为输入框
- 可显示拼音提示（可选开关）
- 答案判定：精确匹配（忽略繁简体差异，已有 poem-data 中存储了标准答案）

**英语拼写（填空输入）**：
- 输入框拼写单词
- 不区分大小写
- 可选提示：显示首字母或字母范围

### 原有打印功能

所有学科原有的 PDF/图片导出功能保持不变，作为独立功能入口存在。在线做题页面提供"导出本次练习为PDF"的按钮（复用现有 PDF 生成逻辑）。

## 答题结果页

```
┌──────────────────────────────────────────┐
│          完成！                           │
│                                          │
│  正确率:  ████████░░  80% (16/20)        │
│                                          │
│  用时: 5分32秒                            │
│                                          │
│  错题回顾:                                │
│  ┌────────────────────────────────────┐  │
│  │ 3. 25 + 37 = ?  你选了 72 → 62     │  │
│  │ 7. 43 - 18 = ?  你选了 35 → 25     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [ 重新练习 ]  [ 返回首页 ]  [ 导出PDF ]  │
└──────────────────────────────────────────┘
```

## 成就系统

### 成就列表

**学习里程碑**：
| 成就 | 条件 | 图标 |
|------|------|------|
| 第一镐 | 完成第一次学习 | ⛏️ |
| 砖石之心 | 累计学习 10 次 | 🧱 |
| 满腹经纶 | 累计学习 100 次 | 📚 |
| 七天战士 | 连续学习 7 天 | ⚔️ |
| 时间领主 | 累计学习时长 60 分钟 | ⏰ |

**全对成就**：
| 成就 | 条件 | 图标 |
|------|------|------|
| 开门红 | 第一次练习就全对 | ✨ |
| 三连胜 | 连续 3 次练习全对 | 🏅 |
| 神射手 | 累计做对 500 题 | 🎯 |

**学科专精**：
| 成就 | 条件 | 图标 |
|------|------|------|
| 数学学徒 | 完成 5 次数学练习 | 🔢 |
| 书法达人 | 完成 5 次语文练习 | 🖌️ |
| 英语达人 | 完成 5 次英语练习 | 🔤 |
| 全能冠军 | 完成所有学科各 10 次练习 | 🌟 |
| 代数商人 | 完成代数挑战 20 次 | 🛒 |

**收集图鉴**：
- 每个已解锁的成就在图鉴中显示为亮色
- 未解锁为暗色滤镜，hover 显示成就条件
- 进度条显示当前完成度

### 成就页面 UI

```
┌─────────────────────────────────────────────────┐
│  ← 返回首页    成就殿堂    [语言切换]              │
├─────────────────────────────────────────────────┤
│  总进度: [████████░░░░] 8/20 已解锁              │
├─────────────────────────────────────────────────┤
│  [全部] [里程碑] [全对] [学科] [收集]             │
├─────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ ⛏️       │ │ ✨       │ │ 🔢       │         │
│  │ 第一镐   │ │ 开门红   │ │ 数学学徒 │         │
│  │ 已解锁   │ │ 未解锁   │ │ 已解锁   │         │
│  │ 2024-01  │ │ 完成1次   │ │ 5次练习  │         │
│  └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────┘
```

- Minecraft 方块风格卡片（复用 `mc-card`）
- 已解锁：正常显示，带解锁日期
- 未解锁：暗色半透明蒙版 + `???` 占位，hover 显示成就条件
- 每个未解锁成就底部显示当前进度（如 "3/5 次练习"）
- 分类 tab 与数学页面风格一致

### 首页入口

- 首页新增 "成就殿堂" 卡片，与现有四个模块卡片并排
- 紫色/金色主题，Minecraft 附魔书图标

### 解锁流程

```
用户提交全部答案 → 判对错 → 生成 quiz_session 记录
    │
    ├── StatsAggregator.rebuild()      ← 从 localStorage 重新聚合统计
    ├── AchievementEngine.evaluate()   ← 检查所有未解锁成就
    ├── AchievementEngine.unlock()     ← 对新解锁的成就标记并保存
    └── useAchievements.onUnlock()     ← 触发 Toast 动画
                                              │
                                              ▼
                                      Toast: "解锁成就：第一镐！"
                                      （Minecraft 风格动画，2秒后消失）
```

### 数据流

- 每次学习提交后只重新聚合一次统计，不是每个成就都读一遍 localStorage
- StatsAggregator 的结果缓存在内存中，避免重复计算
- 成就页面打开时才计算进度，不在后台持续计算

## 新增数据结构

```typescript
// localStorage: quiz_sessions
interface QuizSession {
  id: string;
  subject: 'math' | 'algebra' | 'chinese-poem' | 'english';
  timestamp: string;       // ISO 8601
  totalQuestions: number;
  correctCount: number;
  accuracy: number;        // 0-1
  duration: number;        // seconds
  answers: Array<{
    questionId: string;
    userAnswer: string;
    correct: boolean;
  }>;
}

// localStorage: achievements_unlocked
interface AchievementUnlock {
  achievementId: string;
  unlockedAt: string;      // ISO 8601
}
```

## 现有功能保护

- 所有现有页面（`/math`, `/chinese`, `/english`, `/math/algebra`）的打印/PDF导出功能**完全不变**
- 新增在线做题为独立页面（`/math/quiz`, `/chinese/quiz`, `/english/quiz`, `/math/algebra/quiz`）
- 现有页面添加"开始做题"按钮，跳转到对应在线做题页面
- 现有 StudyRecordButton 保留，作为手动记录入口

## 文件变更概览

### 新增文件

| 文件 | 用途 |
|------|------|
| `src/lib/quiz-engine.ts` | 选择题干扰项生成、判对错逻辑 |
| `src/lib/achievement-engine.ts` | 成就注册表、条件评估、解锁管理 |
| `src/lib/stats-aggregator.ts` | 从 localStorage 聚合统计数据 |
| `src/lib/achievement-registry.ts` | 所有成就的定义 |
| `src/hooks/useQuiz.ts` | 通用做题 Hook（导航、答案收集、计时） |
| `src/hooks/useAchievements.ts` | 成就 React 桥接 Hook |
| `src/components/AchievementToast.tsx` | 解锁动画 Toast 组件 |
| `src/components/AchievementCard.tsx` | 成就卡片组件 |
| `src/components/QuizResult.tsx` | 通用结果页组件 |
| `src/app/achievements/page.tsx` | 成就殿堂页面 |
| `src/app/math/quiz/page.tsx` | 数学在线做题页面 |
| `src/app/math/algebra/quiz/page.tsx` | 代数在线做题页面 |
| `src/app/chinese/quiz/page.tsx` | 语文在线做题页面 |
| `src/app/english/quiz/page.tsx` | 英语在线做题页面 |

### 修改文件

| 文件 | 变更 |
|------|------|
| `src/app/page.tsx` | 首页新增"成就殿堂"入口卡片 |
| `src/app/math/page.tsx` | 添加"开始在线做题"按钮 |
| `src/app/chinese/page.tsx` | 添加"开始在线做题"按钮 |
| `src/app/english/page.tsx` | 添加"开始在线做题"按钮 |
| `src/app/math/algebra/page.tsx` | 添加"开始在线做题"按钮 |
| `messages/zh.json` | 新增在线做题和成就相关翻译 |
| `messages/en.json` | 新增在线做题和成就相关翻译 |
