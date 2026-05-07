# 口算速算挑战 — 设计文档

## Context

当前多米习题站数学模块只有固定题数的选择题模式。口算速算挑战新增一种**倒计时驱动、输入式答题**的玩法，在限定时间内尽可能多地答题，强调速度和准确率。这是"新学科或新题型"扩展计划的第一轮迭代（后续还有应用题、几何、自然拼读）。

## Architecture

### Route Structure

```
/math/speed-challenge/          — 配置页
/math/speed-challenge/quiz      — 答题页（含结果展示）
```

入口：数学页面侧边栏新增 "⚡ 口算速算挑战" 按钮（`/math/page.tsx` 侧边栏，在现有"在线做题"按钮下方）。

### Data Flow

1. **配置页** → 选择时间限制(30s/60s/120s)、最大值(10/20/50/100)、运算类型(add/sub/mul/mix)
2. 点击"开始挑战" → 跳转 `/math/speed-challenge/quiz?timeLimit=60&max=20&operation=mix`
3. **答题页** → 显示配置摘要，用户点击"开始"
4. 倒计时开始 → 逐题生成、输入答案、即时反馈（绿/红闪烁）、自动下一题
5. 时间到 → 停止输入 → 显示结果 → 保存 session → 检查成就

### Session Storage

复用现有 `QuizSession` 格式，只需扩展 `QuizSubject` 增加 `'speed-challenge'`：

```typescript
{
  subject: 'speed-challenge',
  timestamp: new Date().toISOString(),
  totalQuestions: attemptedCount,
  correctCount: correctCount,
  accuracy: correctCount / attemptedCount,
  duration: timeLimitSeconds,
  answers: [...QuizAnswer],
}
```

不做 PDF 导出 — 速算挑战是数字化活动，结果是成绩单不是练习卷。

## Components

### New Files

| File | Purpose |
|------|---------|
| `src/lib/speed-generator.ts` | 单题生成器，每次生成一道速算题 |
| `src/hooks/useSpeedQuiz.ts` | 速算专用 hook：倒计时、答题循环、即时计分 |
| `src/components/CountdownTimer.tsx` | 倒计时进度条组件（颜色渐变 + 数字叠加） |
| `src/components/SpeedResult.tsx` | 结果展示：正确率、速度指标(题/分钟)、错题回顾 |
| `src/app/math/speed-challenge/page.tsx` | 配置页：时间/难度/运算选择 |
| `src/app/math/speed-challenge/quiz/page.tsx` | 答题页 + 结果内联展示 |

### CountdownTimer

- 横向进度条，从满到空
- 颜色：绿色(>50%) → 黄色(25-50%) → 红色(<25%) → 闪烁红色(<10%)
- 中央叠加白色数字显示剩余秒数
- 时间到显示 "TIME UP!"

### SpeedResult

- 大字体："15/20 正确"
- 正确率百分比
- **速度指标**："每分钟 15.0 题"
- 用时（= 配置时间限制）
- 错题回顾（可折叠）
- "再试一次" / "返回设置" 按钮

### Quiz Page Interaction

- 顶部：倒计时条
- 中间：大字体算式 `8 + 5 = ?`，下方数字输入框
- 输入答案后按 Enter → 即时反馈 → 自动下一题
- 底部实时显示已答对数量

## Type Changes

### Existing files to modify

| File | Change |
|------|--------|
| `src/lib/quiz-engine.ts` | `QuizSubject` 增加 `'speed-challenge'` |
| `src/lib/stats-aggregator.ts` | `subjectStats` 初始化增加 `'speed-challenge'` 条目 |
| `src/lib/wrong-answers.ts` | 新增 `speed-challenge` 的标签和路由映射 |
| `src/app/math/page.tsx` | 侧边栏增加入口按钮 |
| `messages/zh.json` | 新增 `SpeedChallenge` 翻译命名空间 |
| `messages/en.json` | 同上英文翻译 |

### New types

```typescript
// speed-generator.ts
type SpeedQuizConfig = {
  timeLimitSeconds: 30 | 60 | 120;
  max: number;
  operation: 'add' | 'sub' | 'mul' | 'mix';
};

type SpeedQuestion = {
  id: string;
  num1: number;
  num2: number;
  operator: '+' | '-' | 'x';
  answer: number;
  questionText: string;
};
```

## New Achievements

| ID | Name | Condition |
|----|------|-----------|
| `speed-starter` | ⚡ 速算新手 | 完成第一次速算挑战 |
| `speed-demon` | 💨 速算达人 | 完成 10 次速算挑战 |
| `lightning-10` | 🌩️ 闪电十题 | 60秒内答对10题（需特殊检查） |
| `math-sharpshooter` | 🎯 数学神射手 | 数学类（含速算）累计做对1000题 |

## i18n Keys

新增 `SpeedChallenge` 命名空间，包含：title, timeLimit, startChallenge, ready, timeUp, questionsPerMinute, enterAnswer, retry, backToConfig 等 key。中英文各一份。

## Verification

1. `npm run dev` 启动开发服务器
2. 访问 `/math` → 点击 "口算速算挑战" → 配置页正常显示
3. 选择配置 → 点击"开始挑战" → 进入答题页
4. 倒计时开始 → 输入答案 → 即时反馈 → 自动下一题
5. 时间到 → 结果显示 → 验证正确率、速度指标
6. 刷新页面 → 访问学习记录 → 确认速算 session 被统计
7. 访问成就页面 → 确认速算相关成就正常显示进度
