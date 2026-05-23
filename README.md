# 多米习题站 (DUOMI Study)

面向儿童的在线学习练习平台，涵盖数学、代数、语文、英语四个学科，支持在线做题、自动判分、学习记录和成就系统。Minecraft 像素风格 UI。

**在线演示**: [部署链接]

## 功能概览

### 学科练习

| 学科 | 打印练习 | 在线做题 | 速认挑战 | 说明 |
|------|----------|----------|----------|------|
| 数学 | PDF（可附答案页） | 选择题 | 限时口算 | 加减乘除、凑十法、破十法，4 选 1 干扰项 |
| 代数商店 | PDF | 选择题 | — | Minecraft 物品定价计算，4 选 1 干扰项 |
| 语文古诗 | PDF | 填空输入 | 汉字速认 | 105+ 首古诗，分初/中/高三档难度 |
| 英语拼写 | PDF | 填空输入 | 英语速认 | 单词拼写练习，首尾字母提示 |

### 新增功能

| 功能 | 说明 |
|------|------|
| **练习模式** | 数学在线做题可开启练习模式，答错后显示解题提示，帮助理解 |
| **每日挑战** | 每天自动生成唯一口算挑战，10 题 60 秒，支持连续打卡统计 |
| **排行榜** | 各科目的本地高分排行榜，按每分钟正确题数排名 |
| **数据导出** | 学习记录和做题数据支持导出为 JSON 或 CSV 格式 |
| **主题切换** | 5 套可选主题：经典、海洋、森林、日落、星空 |
| **自动难度调节** | 根据最近 5 次练习的准确率，自动调整题目数值范围 |
| **成就分享** | 解锁成就后可一键复制文字到剪贴板进行分享 |

### 学习记录

- 手动记录学习时长（通过「完成学习」按钮）
- 自动记录每次在线做题的成绩（正确率、用时、错题）
- 历史记录页面，支持按学科筛选和统计

### 成就系统

4 个分类、21 个成就：

- **学习里程碑** — 第一镐、砖石之心、满腹经纶、七天战士、时间领主
- **全对成就** — 开门红、三连胜、神射手
- **学科专精** — 数学学徒、书法达人、英语达人、全能冠军、代数商人、口算达人、诗词达人、速认达人、代数学霸
- **收集图鉴** — 初级收藏家、资深收藏家、成就大师

每次提交练习后自动评估成就，解锁时弹出 Minecraft 风格 Toast 动画。

### 导出功能

- 数学/代数/语文/英语均支持导出为 PDF（`@react-pdf/renderer`）或图片（Canvas）
- 数学 PDF 支持附带答案页（可开关）
- 学习记录支持导出为 JSON 或 CSV 格式，含全部做题记录
- 所有导出不依赖外部服务，纯前端生成

### 错题本

- **数据来源**: 自动从历史做题记录中提取错误题目
- **学科筛选**: 支持按数学/代数/语文/英语筛选
- **重做功能**: 一键跳转到对应学科重新练习

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS v4 + 自定义 Minecraft CSS 组件 |
| PDF | `@react-pdf/renderer` |
| 图标 | `lucide-react` |
| 国际化 | `next-intl` (中文/英文) |
| 字体 | VT323 (像素字体), KaiTi (楷体) |
| 存储 | `localStorage` (学习记录、做题记录、成就、排行榜、每日挑战、主题) |

## 项目结构

```
src/
├── app/                          # Next.js App Router 页面
│   ├── page.tsx                  # 首页 — 学科/成就/排行榜/每日挑战入口卡片
│   ├── layout.tsx                # 根布局 — 像素字体、主题初始化
│   ├── globals.css               # 全局样式 — Minecraft 卡片/按钮/动画
│   ├── math/                     # 数学
│   │   ├── page.tsx              #   配置页 — 运算符、范围、数量、练习模式
│   │   ├── quiz/page.tsx         #   在线做题 — 4 选 1 选择题 + 提示
│   │   └── speed-challenge/      #   口算速算挑战
│   │       ├── page.tsx          #     配置页 — 时间、范围
│   │       └── quiz/page.tsx     #     限时挑战 — 输入答案，答对自动下一题
│   ├── math/algebra/             # 代数商店
│   │   ├── page.tsx              #   配置页 — 难度、语言
│   │   └── quiz/page.tsx         #   在线做题 — 物品定价计算
│   ├── chinese/                  # 语文
│   │   ├── page.tsx              #   配置页 — 生字模式 / 古诗模式
│   │   ├── quiz/page.tsx         #   在线做题 — 古诗填空
│   │   └── speed-challenge/      #   汉字速认挑战
│   │       ├── page.tsx          #     配置页
│   │       └── quiz/page.tsx     #     限时选拼音
│   ├── english/                  # 英语
│   │   ├── page.tsx              #   配置页 — 单词输入
│   │   ├── quiz/page.tsx         #   在线做题 — 单词拼写
│   │   └── speed-challenge/      #   英语速认挑战
│   │       ├── page.tsx          #     配置页
│   │       └── quiz/page.tsx     #     限时选英文
│   ├── daily-challenge/          # 每日挑战 — 每天唯一的口算挑战
│   ├── leaderboard/              # 排行榜 — 各科目 Top 10
│   ├── achievements/page.tsx     # 成就殿堂 — 分类 tab + 进度
│   ├── history/page.tsx          # 历史记录 — 统计 + 筛选
│   └── wrong-answers/page.tsx    # 错题本 — 学科筛选 + 重做
├── lib/                          # 纯逻辑库
│   ├── math-generator.ts         # 数学题目生成器（含提示生成）
│   ├── algebra-generator.ts      # 代数题目生成器 (40 种 Minecraft 物品)
│   ├── speed-generator.ts        # 速算题目生成器
│   ├── chinese-speed-generator.ts# 汉字速认题目生成器
│   ├── english-speed-generator.ts# 英语速认题目生成器
│   ├── poem-generator.ts         # 古诗题目生成器
│   ├── poem-data.ts              # 105+ 首古诗数据
│   ├── quiz-engine.ts            # 在线做题引擎 — 干扰项、判对错、会话存储
│   ├── stats-aggregator.ts       # 统一统计聚合 — quiz_sessions + study_records
│   ├── difficulty-progression.ts # 自动难度调节 — 分析历史准确率
│   ├── daily-challenge.ts        # 每日挑战 — 种子随机、连续打卡
│   ├── leaderboard.ts            # 排行榜 — 各科目的本地高分
│   ├── data-export.ts            # 数据导出 — JSON / CSV
│   ├── themes.ts                 # 主题系统 — 5 套配色
│   ├── achievement-registry.ts   # 成就注册表 — 21 个成就定义
│   ├── achievement-engine.ts     # 成就引擎 — 评估、解锁、持久化
│   ├── study-storage.ts          # localStorage CRUD — 学习记录
│   ├── wrong-answers.ts          # 错题提取 — 从做题记录中提取错题
│   ├── english-pdf-generator.tsx # 英语 PDF 生成
│   ├── english-canvas-generator.ts # 英语 Canvas 图片生成
│   └── pdf-generator.tsx         # 数学/代数 PDF 生成（含答案页）
├── hooks/                        # React Hooks
│   ├── useQuiz.ts                # 通用做题 Hook — 导航、答案收集、计时
│   ├── useSpeedQuiz.ts           # 速算做题 Hook — 倒计时、输入判分
│   ├── useChineseSpeedQuiz.ts    # 汉字速认 Hook
│   ├── useEnglishSpeedQuiz.ts    # 英语速认 Hook
│   ├── useAchievements.ts        # 成就 React 桥接 Hook
│   └── useTranslation.ts         # 国际化 Hook
├── components/                   # 组件
│   ├── StudyRecordButton.tsx     # 手动学习记录按钮
│   ├── StudyStats.tsx            # 学习统计卡片
│   ├── StudyRecordList.tsx       # 历史记录列表 + 导出
│   ├── LanguageSwitcher.tsx      # 中/英文切换
│   ├── ThemeSwitcher.tsx         # 主题切换面板
│   ├── QuizProgressBar.tsx       # 做题进度条
│   ├── QuizNav.tsx               # 题目导航 (点 + 上一题/下一题)
│   ├── QuizResult.tsx            # 结果页 — 正确率、用时、错题回顾
│   ├── SpeedResult.tsx           # 速算结果页 — 正确率、速度、错题回顾
│   ├── CountdownTimer.tsx        # 倒计时条
│   ├── HintDisplay.tsx           # 解题提示显示
│   ├── AchievementToast.tsx      # 解锁 Toast 动画（含分享按钮）
│   ├── AchievementCard.tsx       # 成就卡片 — 已解锁/未解锁 + 进度
│   ├── McItemIcon.tsx            # Minecraft 物品图标 + 价格表
│   ├── MobileSidebar.tsx         # 移动端侧边栏
│   └── DuomiSteve.tsx            # Steve 头像组件
├── types/                        # TypeScript 类型
│   └── study-record.ts
└── messages/                     # 国际化翻译文件
    ├── zh.json
    └── en.json
```

## 快速开始

### 环境要求

- **Node.js >= 20.9.0**
- npm / yarn / pnpm / bun 任一包管理器

### 安装

```bash
npm install
```

### 开发

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 访问。

### 构建

```bash
npm run build
```

### 生产运行

```bash
npm run build && npm start
```

## 数据存储

所有数据存储在浏览器 `localStorage` 中，不依赖后端服务器：

| Key | 内容 | 格式 |
|-----|------|------|
| `duomi-study-records` | 手动学习记录 | `StudyRecord[]` |
| `duomi-quiz-sessions` | 在线做题记录 | `QuizSession[]` |
| `duomi-achievements-unlocked` | 已解锁成就 | `UnlockedAchievement[]` |
| `duomi-leaderboard` | 排行榜高分 | `{[subject]: LeaderboardEntry[]}` |
| `duomi-daily-challenges` | 每日挑战完成记录 | `{[date]: DailyResult}` |
| `duomi-difficulty-progression` | 难度调节进度 | `{[subject]: number[]}` |
| `duomi-theme` | 当前选中的主题 | `ThemeId` |

数据清除：浏览器开发者工具 → Application → Local Storage → 删除对应 Key。

## 国际化

支持中文（简体）和英文两种语言，通过 `next-intl` 实现：

- 翻译文件位于 `messages/zh.json` 和 `messages/en.json`
- 页面右上角可切换语言
- 语言选择持久化到 `localStorage`

## 主题系统

提供 5 套预设主题，可在首页右上角切换：

| 主题 | 说明 |
|------|------|
| 🟤 经典 | 默认配色，棕色木质风格 |
| 🌊 海洋 | 蓝色系，清爽感觉 |
| 🌲 森林 | 绿色系，自然感觉 |
| 🌅 日落 | 暖色系，温暖感觉 |
| 🌙 星空 | 暗色系，夜晚模式 |

主题选择持久化到 `localStorage`，刷新后自动应用。

## 学科详情

### 数学

- **运算类型**：加法、减法、乘法、除法、混合
- **数值范围**：可配置最大值（默认 20）
- **题目数量**：可配置（默认 20 题）
- **凑十法 / 破十法**：特殊模式，辅助低年级学习
- **练习模式**：答错后显示解题提示（如"从 X 开始往上数 Y 个"）
- **干扰项**：基于常见计算错误生成（±1、±10、数字位交换、错误运算）

### 代数商店

- **40 种 Minecraft 物品**：苹果、剑、盾牌、金锭、钻石等，各有 emoji 图标和价格
- **难度**：初级（2 种物品）、中级（3 种）、高级（5 种）
- **干扰项**：基于先加后乘等运算顺序错误生成
- **货币**：中文模式显示「元」，英文模式显示「$」

### 语文古诗

- **105+ 首古诗**：覆盖五言绝句、七言绝句、七言律诗、词等
- **三档难度**：
  - 初级 ⭐ — 五言绝句（如《静夜思》《春晓》）
  - 中级 ⭐⭐ — 七言绝句（如《望庐山瀑布》《枫桥夜泊》）
  - 高级 ⭐⭐⭐ — 七言律诗 / 词（如《春望》《水调歌头》）
- **填空模式**：随机隐藏诗句中的部分汉字，学生填入正确答案
- **拼音提示**：可选开关（需要 `cnchar` 库支持）

### 英语拼写

- **单词列表**：用户在配置页输入要练习的单词
- **提示**：显示首字母和尾字母，中间用下划线填充
- **判定**：不区分大小写
- **导出**：四线三格 PDF 生成，适合打印练习

## 速认挑战

### 口算速算（数学）

在限定时间（30/60/120 秒）内尽可能多地答题，输入答案后按 Enter 确认，答对自动进入下一题。

### 汉字速认（语文）

显示一个汉字，从 4 个拼音选项中选出正确读音。答对/答错后立即进入下一题。

### 英语速认（英语）

显示中文释义，从 4 个英文单词选项中选出正确答案。答对/答错后立即进入下一题。

三种速认挑战均支持：
- 倒计时条（颜色随剩余时间变化）
- 实时正确率统计
- 时间到后显示详细结果 + 错题回顾
- 自动记录到排行榜

## 每日挑战

每天自动生成唯一的口算挑战（使用日期作为种子），确保所有用户每天看到的题目相同：

- 10 道题，60 秒限时
- 包含加减乘除混合运算
- 记录连续打卡天数
- 完成后显示今日成绩 + 连续天数

## 排行榜

- 每个科目独立排行，按**每分钟正确题数**排序
- 每科目保留 Top 10 记录
- 在「排行榜」页面查看所有科目排行
- 完成在线练习后自动更新

## 成就详情

### 学习里程碑

| 成就 | 条件 |
|------|------|
| ⛏️ 第一镐 | 完成第一次学习（在线做题或手动记录） |
| 🧱 砖石之心 | 累计完成 10 次在线练习 |
| 📚 满腹经纶 | 累计完成 100 次在线练习 |
| ⚔️ 七天战士 | 连续学习 7 天（含手动记录） |
| ⏰ 时间领主 | 累计学习时长 60 分钟 |

### 全对成就

| 成就 | 条件 |
|------|------|
| ✨ 开门红 | 第一次在线练习就全对 |
| 🏅 三连胜 | 连续 3 次练习全对 |
| 🎯 神射手 | 累计做对 500 题 |

### 学科专精

| 成就 | 条件 |
|------|------|
| 🔢 数学学徒 | 完成 5 次数学练习 |
| 🖌️ 书法达人 | 完成 5 次语文练习 |
| 🔤 英语达人 | 完成 5 次英语练习 |
| 🌟 全能冠军 | 完成所有学科各 10 次练习 |
| 🛒 代数商人 | 完成代数挑战 20 次 |
| ⚡ 口算达人 | 完成口算速算 10 次 |
| 📝 诗词达人 | 完成古诗填空 5 次 |
| 🔥 速认达人 | 完成任意速认挑战 10 次 |
| 🧮 代数学霸 | 完成代数练习 10 次 |

### 收集图鉴

| 成就 | 条件 |
|------|------|
| 🗺️ 初级收藏家 | 解锁 5 个成就 |
| 🗺️ 资深收藏家 | 解锁 10 个成就 |
| 👑 成就大师 | 解锁所有成就 |

## License

MIT
