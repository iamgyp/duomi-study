# 多米习题站 — 测试报告

> **测试日期**: 2026-06-02
> **测试范围**: 全站点代码审查，覆盖 15 个模块
> **测试方法**: 静态代码分析、逻辑流追踪、组件审查、类型检查、i18n 覆盖审计、无障碍属性检查
> **审查引擎**: 6 个并行审查代理（数学/代数、语文/英语、核心功能、UI组件、数据流、综合合成）

## 问题统计

| 优先级 | 数量 | 说明 |
|--------|------|------|
| **P0 严重** | 12 | 功能错误/数据丢失/应用崩溃 |
| **P1 重要** | 22 | 功能缺陷/易用性问题 |
| **P2 优化** | 26 | 代码质量/体验提升 |
| **合计** | **60** | — |

---

## P0 — 严重问题（必须修复）

### P0-1: 数学速算挑战计时器永远不会启动
- **位置**: [page.tsx:132](src/app/math/speed-challenge/quiz/page.tsx#L132)
- **问题**: "开始挑战"按钮只调用 `setStarted(true)`，从未调用 `quiz.start()`。start() 负责将状态切换为 running、生成第一道题、启动倒计时。
- **影响**: 整个数学速算挑战功能完全不可用，用户点击开始按钮后永远无法进入答题状态
- **建议**: 在 onClick 中调用 `quiz.start()` 并移除 `started` 状态包装

### P0-2: 语文速认挑战计时器永远不会启动
- **位置**: [page.tsx:122](src/app/chinese/speed-challenge/quiz/page.tsx#L122)
- **问题**: 同 P0-1，只调用 `setStarted(true)`，未调用 `quiz.start()`
- **影响**: 中文速认挑战功能完全不可用

### P0-3: 英语速认挑战计时器永远不会启动
- **位置**: [page.tsx:109](src/app/english/speed-challenge/quiz/page.tsx#L109)
- **问题**: 同上，只调用 `setStarted(true)`
- **影响**: 英语速认挑战功能完全不可用

### P0-4: 数学混合模式排除了除法
- **位置**: [math-generator.ts:85-87](src/lib/math-generator.ts#L85-L87)
- **问题**: mix 模式的操作符池为 `['+', '-', '×']`，除法 `÷` 完全被排除
- **影响**: 选择混合运算的用户永远不会看到除法题目
- **建议**: 将池改为 `['+', '-', '×', '÷']`

### P0-5: 语文 PDF 生成器使用 Helvetica 字体无法渲染中文
- **位置**: [chinese-pdf-generator.tsx:18-23](src/lib/chinese-pdf-generator.tsx#L18-L23)
- **问题**: PDF 页面使用 `fontFamily: 'Helvetica'`，该字体不支持 CJK 字符。文件中已有被注释掉的 `Font.register()` 调用（Noto Serif SC），但从未激活
- **影响**: 语文 PDF 导出中文字符全部显示为空白方块
- **建议**: 取消注释 Font.register()，注册 CJK 字体

### P0-6: 古诗 PDF 生成器使用小写 SVG 元素
- **位置**: [poem-pdf-generator.tsx:154-164](src/lib/poem-pdf-generator.tsx#L154-L164)
- **问题**: SteveAvatar 使用小写 `<svg>` 和 `<path>`，而非 @react-pdf/renderer 的 `Svg` 和 `Path` 组件
- **影响**: 古诗 PDF 中的 Steve 头像不会显示
- **建议**: 使用大写 `<Svg>` 和 `<Path>`

### P0-7: saveRecord 和 importRecords 缺少 try/catch 保护
- **位置**: [study-storage.ts:49,52,204](src/lib/study-storage.ts#L49)
- **问题**: `localStorage.setItem` 调用无 try/catch。localStorage 满或隐私浏览模式时会抛出未捕获的 DOMException
- **影响**: 可能导致应用崩溃、数据丢失
- **建议**: 将所有 localStorage.setItem 包裹在 try/catch 中

### P0-8: 首页 5 个卡片全部硬编码中文
- **位置**: [page.tsx:96-168](src/app/page.tsx#L96-L168)
- **问题**: 历史记录、成就殿堂、错题本、排行榜、每日挑战五个卡片的标题/描述/按钮全部硬编码中文
- **影响**: 英文用户看到纯中文界面
- **建议**: 添加 Home.historyTitle/Desc/Btn 等 15 个 key，使用 t() 替换

### P0-9: SpeedResult.tsx 所有标签硬编码中文
- **位置**: [SpeedResult.tsx:28-84](src/components/SpeedResult.tsx#L28-L84)
- **问题**: 11+ 个中文硬编码字符串，SpeedChallenge 命名空间中已有对应 key 但未使用
- **影响**: 速算结果页不可翻译

### P0-10: QuizResult.tsx 完全硬编码中文
- **位置**: [QuizResult.tsx:28-131](src/components/QuizResult.tsx#L28-L131)
- **问题**: accuracy、timeUsed、wrongReview、yourAnswer、correctAnswer 等全部硬编码
- **影响**: 练习结果页不可翻译

### P0-11: StudyRecordList.tsx 17+ 处硬编码中文
- **位置**: [StudyRecordList.tsx:18-291](src/components/StudyRecordList.tsx#L18-L291)
- **问题**: 按钮标签、空状态、导入模态框、确认消息全部硬编码。使用原生 confirm() 对话框无法本地化
- **影响**: 历史记录组件不可翻译

### P0-12: CountdownTimer.tsx 中 'TIME UP!' 硬编码英文
- **位置**: [CountdownTimer.tsx:27](src/components/CountdownTimer.tsx#L27)
- **问题**: 'TIME UP!' 硬编码英文，SpeedChallenge.timeUp key 已定义但未使用
- **影响**: 倒计时结束提示语无法适配用户语言

---

## P1 — 重要问题（建议本轮修复）

### P1-1: math/quiz/page.tsx handleAnswer setTimeout 捕获过时闭包
- **位置**: [quiz/page.tsx:83-92](src/app/math/quiz/page.tsx#L83-L92)
- **问题**: setTimeout 中捕获整个 quiz 对象引用，用户在延迟期间导航到其他题目会导致过时调用
- **建议**: 在 setTimeout 之前捕获 quiz.totalQuestions 和 quiz.nextQuestion

### P1-2: algebra/quiz/page.tsx 相同的过时闭包问题
- **位置**: [algebra/quiz/page.tsx:53-58](src/app/math/algebra/quiz/page.tsx#L53-L58)
- **问题**: 同上
- **建议**: 同上

### P1-3: distractor 选项生成产生无意义的干扰项
- **位置**: [quiz-engine.ts:98,212-213](src/lib/quiz-engine.ts#L98)
- **问题**: 第 212 行 `q.total - subTotal + subTotal + 1` 简化为 `q.total + 1` 与第 201 行重复。subTotal 为 0 时产生正确答案本身
- **影响**: 四选一中可能出现重复选项或正确答案作为错误选项

### P1-4: localStorage 并发读写导致数据丢失
- **位置**: [quiz-engine.ts:341](src/lib/quiz-engine.ts#L341), [leaderboard.ts:31](src/lib/leaderboard.ts#L31), [achievement-engine.ts:61](src/lib/achievement-engine.ts#L61)
- **问题**: 读-改-写模式无锁保护，多标签页或快速连续调用会导致数据覆盖
- **建议**: 实现写队列或 StorageEvent 同步

### P1-5: daily-challenge useEffect 缺少 handleSubmitResults 依赖
- **位置**: [daily-challenge/page.tsx:48-53](src/app/daily-challenge/page.tsx#L48-L53)
- **问题**: useEffect 依赖数组缺少 handleSubmitResults，触发 React lint 警告
- **建议**: 使用 useCallback 包裹 handleSubmitResults

### P1-6: seven-day-warrior 成就与每日挑战连续天数不关联
- **位置**: [achievement-engine.ts:35-37](src/lib/achievement-engine.ts#L35-L37)
- **问题**: 两个独立的连续天数系统从未关联
- **影响**: 只完成每日挑战的用户无法解锁七天战士成就

### P1-7: 古诗填空位置硬编码无随机化
- **位置**: [poem-data.ts](src/lib/poem-data.ts), [poem-generator.ts:17-36](src/lib/poem-generator.ts#L17-L36)
- **问题**: 每首诗的填空位置固定，每次隐藏相同字符
- **影响**: 学生可能记住位置而非字符本身

### P1-8: 全站点大量硬编码中文（语文、英语速认及练习页）
- **位置**: chinese/quiz, chinese/speed-challenge, english/quiz, english/speed-challenge 各页面
- **问题**: 标题、标签、按钮、提示全部硬编码中文，en.json 完全没有对应翻译条目
- **建议**: 为每个页面添加 i18n 命名空间

### P1-9: english-canvas-generator.ts 是完全未使用的死代码
- **位置**: [english-canvas-generator.ts](src/lib/english-canvas-generator.ts)（整个文件，约 210 行）
- **影响**: 维护无用代码增加负担
- **建议**: 删除或集成使用

### P1-10: 语文速认页面重复且位置错误的 Suspense 导入
- **位置**: [chinese/speed-challenge/quiz/page.tsx:3,30](src/app/chinese/speed-challenge/quiz/page.tsx#L3)
- **问题**: 未使用的 SuspenseProps 导入，Suspense 重复导入
- **建议**: 合并 import，移除未使用的

### P1-11: stats-aggregator 缓存在数据保存后从未失效
- **位置**: [stats-aggregator.ts:34,122-124](src/lib/stats-aggregator.ts#L34)
- **问题**: invalidateCache() 存在但从未在 saveRecord 或 saveQuizSession 后调用
- **影响**: 用户看到统计数据直到刷新页面才更新

### P1-12: ESLint 多个未使用的导入
- **位置**: 10+ 个文件
- **问题**: data-export.ts、difficulty-progression.ts、pdf-generator.tsx、poem-pdf-generator.tsx 等共 20+ 未使用导入/变量
- **建议**: 移除所有未使用的导入

### P1-13: calculateConsecutiveDays 使用脆弱的浮点数相等比较
- **位置**: [study-storage.ts:94,111-115](src/lib/study-storage.ts#L94)
- **问题**: `diffDays === 1` 对浮点数除法结果使用严格相等
- **建议**: 使用 `Math.round(diffDays) === 1`

### P1-14: difficulty-progression.ts 中 avgAccuracy 计算但未使用
- **位置**: [difficulty-progression.ts:43](src/lib/difficulty-progression.ts#L43)
- **建议**: 移除或使用

### P1-15: PDF 生成器 Image 元素缺少 alt 属性
- **位置**: [pdf-generator.tsx:573,602](src/lib/pdf-generator.tsx#L573)
- **建议**: 添加 `alt=''` 或有意义的 alt 文本

### P1-16: generateId() 使用已废弃的 String.prototype.substr()
- **位置**: [study-storage.ts:15](src/lib/study-storage.ts#L15), [quiz-engine.ts:310](src/lib/quiz-engine.ts#L310), [algebra-generator.ts:99,114,133](src/lib/algebra-generator.ts#L99)
- **建议**: 替换为 `.substring(2, 11)` 或 `.slice(2, 11)`

### P1-17: CSS 变量已定义但组件未使用
- **位置**: [page.tsx:21](src/app/page.tsx#L21), [SpeedResult.tsx:29](src/components/SpeedResult.tsx#L29), [QuizResult.tsx:29](src/components/QuizResult.tsx#L29)
- **问题**: layout.tsx 和 themes.ts 设置了 CSS 变量，但组件使用硬编码颜色
- **影响**: 主题切换功能视觉上无效

### P1-18: 多处组件缺少 ARIA 属性
- **位置**: QuizProgressBar、CountdownTimer、AchievementToast、MobileSidebar 等
- **问题**: 无 role='progressbar'、role='timer'、role='alert'、aria-label 等
- **建议**: 添加适当的 ARIA 属性

### P1-19: MobileSidebar 缺少 Escape 键处理和焦点陷阱
- **位置**: [MobileSidebar.tsx:38-84](src/components/MobileSidebar.tsx#L38-L84)
- **影响**: 键盘用户无法关闭侧边栏

### P1-20: useTranslation 回退不更新 locale 状态
- **位置**: [useTranslation.ts:33-38](src/hooks/useTranslation.ts#L33-L38)
- **问题**: locale JSON 加载失败时回退到 zh.json 但不更新 locale 状态
- **影响**: 语言状态与实际显示不一致

### P1-21: layout.tsx 中 html lang 硬编码为 "en"
- **位置**: [layout.tsx:33](src/app/layout.tsx#L33)
- **建议**: 根据 NEXT_LOCALE cookie 或 localStorage 动态设置

### P1-22: zh.json 中 Home.subtitle 是英文
- **位置**: [zh.json:19](messages/zh.json#L19)
- **建议**: 翻译为中文

### P1-23: QuizResult 和 SpeedResult 80% 相同
- **位置**: [QuizResult.tsx](src/components/QuizResult.tsx) vs [SpeedResult.tsx](src/components/SpeedResult.tsx)
- **建议**: 提取共享 ResultPage 组件

---

## P2 — 优化建议

| # | 问题 | 位置 | 建议 |
|---|------|------|------|
| P2-1 | 加法和减法可能产生 0+0=0 | [math-generator.ts:89](src/lib/math-generator.ts#L89) | 操作数加 1 产生 1..max 范围 |
| P2-2 | quiz.state 不安全类型转换 | [quiz/page.tsx:164](src/app/math/speed-challenge/quiz/page.tsx#L164) | 修复 start() 调用后无需转换 |
| P2-3 | mode 参数连字符未 URL 编码 | [math/page.tsx:262](src/app/math/page.tsx#L262) | 使用 encodeURIComponent |
| P2-4 | itemSets 解构未使用 | [algebra/quiz/page.tsx:44](src/app/math/algebra/quiz/page.tsx#L44) | 移除 |
| P2-5 | 代数 quiz 缺少禁用状态提示 | [algebra/quiz/page.tsx:209](src/app/math/algebra/quiz/page.tsx#L209) | 添加提示文本 |
| P2-6 | speed-challenge timeUp useEffect 依赖过多 | 3个速认页面 | 使用 ref 只依赖 quiz.state |
| P2-7 | 无自定义英语单词输入验证 | [english/page.tsx:15](src/app/english/page.tsx#L15) | 添加验证过滤 |
| P2-8 | 语文 quiz 提交按钮允许空答案 | [chinese/quiz/page.tsx:169](src/app/chinese/quiz/page.tsx#L169) | 答案为空时从 Map 移除 key |
| P2-9 | 难度标签不一致 | 5 处定义 | 集中到单一常量 |
| P2-10 | 成就集合级联解锁数组突变 | [achievement-engine.ts:44](src/lib/achievement-engine.ts#L44) | 循环前快照长度 |
| P2-11 | triple-perfect 进度始终 0/3 | [achievement-registry.ts:94](src/lib/achievement-registry.ts#L94) | 实现正确计数 |
| P2-12 | lightning-10 进度始终 0 | [achievement-registry.ts:230](src/lib/achievement-registry.ts#L230) | 追踪 60s 内最大正确数 |
| P2-13 | 排行榜排序使用不稳定浮点减法 | [leaderboard.ts:36](src/lib/leaderboard.ts#L36) | 使用 Math.sign() + 时间戳 |
| P2-14 | 排行榜允许重复相同成绩 | [leaderboard.ts:31](src/lib/leaderboard.ts#L31) | 添加去重逻辑 |
| P2-15 | 错题未按 questionId 去重 | [wrong-answers.ts:38](src/lib/wrong-answers.ts#L38) | 按 questionId 去重 |
| P2-16 | 统计聚合 duration 单位不匹配 | [stats-aggregator.ts:95](src/lib/stats-aggregator.ts#L95) | 统一单位 |
| P2-17 | 每日挑战 timeUsed 有漂移 | [daily-challenge/page.tsx:65](src/app/daily-challenge/page.tsx#L65) | 使用 Date.now() 计算 |
| P2-18 | CountdownTimer ratio <= 0.1 是死代码 | [CountdownTimer.tsx:12](src/components/CountdownTimer.tsx#L12) | 移除或用不同颜色 |
| P2-19 | page.tsx 7 个卡片应提取组件 | [page.tsx:51-168](src/app/page.tsx#L51-L168) | 提取 SubjectCard 组件 |
| P2-20 | StudyRecordList 使用 require() 动态导入 | [StudyRecordList.tsx:91](src/components/StudyRecordList.tsx#L91) | 改为顶层 import |
| P2-21 | 日期格式化硬编码 zh-CN | StudyRecordList.tsx:100, AchievementCard.tsx:49 | 使用当前 locale |
| P2-22 | AchievementToast 函数声明顺序不良 | [AchievementToast.tsx:36](src/components/AchievementToast.tsx#L36) | 调整顺序 |
| P2-23 | AchievementCard 使用 '???' 占位符 | [AchievementCard.tsx:40](src/components/AchievementCard.tsx#L40) | 添加 Common.locked key |
| P2-24 | LanguageSwitcher 缺少 aria-pressed | [LanguageSwitcher.tsx:39](src/components/LanguageSwitcher.tsx#L39) | 添加属性 |
| P2-25 | 主题选择器未本地化 | [ThemeSwitcher.tsx:29](src/components/ThemeSwitcher.tsx#L29) | 添加 useTranslation |
| P2-26 | 'Loading...' 硬编码英文 | [page.tsx:15](src/app/page.tsx#L15) | 添加 Common.loading key |
| P2-27 | HintDisplay 和 QuizNav 硬编码中文 | HintDisplay.tsx:17, QuizNav.tsx:36,42 | 添加 i18n keys |
| P2-28 | Subject 类型不一致 | [study-record.ts:5](src/types/study-record.ts#L5), [quiz-engine.ts:8](src/lib/quiz-engine.ts#L8) | 统一类型 |
| P2-29 | currentStreak 语义不清晰 | [stats-aggregator.ts:86](src/lib/stats-aggregator.ts#L86) | 重命名或改为按天计算 |
| P2-30 | 难度调整阈值间隔过大 | [difficulty-progression.ts:49](src/lib/difficulty-progression.ts#L49) | 使用更细粒度阈值 |
| P2-31 | Math PDF 固定高度可能截断 | [pdf-generator.tsx:74](src/lib/pdf-generator.tsx#L74) | 使用 minHeight |
| P2-32 | Algebra PDF 图标相对 URL | [pdf-generator.tsx:509](src/lib/pdf-generator.tsx#L509) | 使用绝对 URL 或 data URI |
| P2-33 | Node.js 版本不匹配 | package.json | 对齐到 Node 20+ |
| P2-34 | ESLint 60+ 错误/警告 | 全站点 | 分批修复 |
| P2-35 | StudyRecordButton 硬编码中文 | [StudyRecordButton.tsx](src/components/StudyRecordButton.tsx) | 添加 useTranslation |
| P2-36 | StudyStats 硬编码中文 | [StudyStats.tsx](src/components/StudyStats.tsx) | 添加 useTranslation |
| P2-37 | AchievementToast 硬编码中文 | [AchievementToast.tsx](src/components/AchievementToast.tsx) | 添加 useTranslation |

---

## 各模块详细分析

### 5.1 首页
- 数学/语文/英语三卡片正确使用 i18n
- History、Achievements、Wrong Answers、Leaderboard、Daily Challenge 五卡片全部硬编码中文（**P0-8**）
- 'Loading...' 硬编码英文（P2-26）
- 7 个卡片结构高度重复，应提取 SubjectCard 组件（P2-19）
- 装饰性云朵缺少 aria-hidden（P1-18）
- CSS 变量已定义但卡片使用硬编码颜色（**P1-17**）
- zh.json 中 Home.subtitle 是英文（**P1-22**）

### 5.2 数学工坊
- mix 模式排除除法（**P0-4**）
- 操作数可产生 0+0=0（P2-1）
- mode 参数连字符未 URL 编码（P2-3）
- handleAnswer setTimeout 过时闭包（**P1-1**）
- Math PDF 分解注释可能被固定高度截断（P2-31）

### 5.3 代数商店
- handleAnswer 过时闭包（**P1-2**）
- itemSets 解构未使用（P2-4）
- 禁用状态缺少提示文本（P2-5）
- generateId 使用废弃 substr()（**P1-16**）
- Algebra PDF 图标相对 URL（P2-32）

### 5.4 语文书房
- PDF 生成器使用 Helvetica 无法渲染中文（**P0-5**）
- 速认挑战计时器不启动（**P0-2**）
- 填空位置硬编码无随机化（**P1-7**）
- quiz 提交按钮允许空答案（P2-8）
- 速认页面 timeUp useEffect 依赖过多（P2-6）
- Suspense 导入重复且混乱（**P1-10**）
- 大量硬编码中文（**P1-8**）
- 古诗 PDF Steve 头像小写 SVG 不渲染（**P0-6**）

### 5.5 英语港口
- 速认挑战计时器不启动（**P0-3**）
- english-canvas-generator.ts 完全死代码（**P1-9**）
- 无自定义单词输入验证（P2-7）
- 大量硬编码中文（**P1-8**）

### 5.6 速认挑战（三个科目）
- 三个科目的速认挑战计时器均不启动（**P0-1, P0-2, P0-3**）
- CountdownTimer 'TIME UP!' 硬编码英文（**P0-12**）
- SpeedResult 全部硬编码中文（**P0-9**）
- timeUp useEffect 依赖过多（P2-6）
- 数学速认 quiz.state 不安全类型转换（P2-2）

### 5.7 每日挑战
- handleSubmitResults 缺失依赖导致过时闭包（**P1-5**）
- completed 状态与存储不同步（P1-21 中的 P2-17）
- timeUsed 基于 setInterval 有漂移（P2-17）

### 5.8 排行榜
- 排序使用不稳定浮点减法（P2-13）
- 允许重复相同成绩条目（P2-14）
- 卡片在首页硬编码中文（**P0-8**）

### 5.9 成就系统
- 集合级联解锁数组突变（P2-10）
- triple-perfect 进度始终 0/3（P2-11）
- lightning-10 进度始终 0（P2-12）
- seven-day-warrior 使用 StudyRecord 连续天数忽略每日挑战（**P1-6**）
- AchievementToast 硬编码中文（P2-37）
- AchievementCard 使用 '???' 占位符（P2-22）

### 5.10 历史记录
- StudyRecordList 17+ 处硬编码中文（**P0-11**）
- formatDate 硬编码 zh-CN（P2-21）
- 使用 require() 动态导入（P2-20）
- saveRecord/importRecords 缺少 try/catch（**P0-7**）

### 5.11 错题本
- 错题未按 questionId 去重（P2-15）
- 卡片在首页硬编码中文（**P0-8**）

### 5.12 国际化
- 12 个 P0 级别的硬编码中文问题
- 22+ 个 P1/P2 级别的 i18n 缺失
- zh.json Home.subtitle 是英文（**P1-22**）
- layout.tsx html lang 硬编码 'en'（**P1-21**）
- useTranslation 回退不更新状态（**P1-20**）
- 速认挑战页面完全没有 i18n 覆盖
- ThemeSwitcher、MobileSidebar、HintDisplay、QuizNav 等组件未本地化

### 5.13 代码质量
- ESLint 60+ 错误/警告（P2-34）
- Node.js 版本不匹配 18.x vs 20.9.0（P2-33）
- 30+ any 类型使用
- 20+ 未使用导入/变量（**P1-12**）
- 6+ useEffect 中多 setState 反模式
- useRef 初始化中的不纯函数（useQuiz.ts）
- generateId 使用废弃 substr()（**P1-16**）
- Subject 类型不一致（P2-28）
- currentStreak 语义不清晰（P2-29）
- 难度调整阈值间隔过大（P2-30）
- QuizResult 和 SpeedResult 80% 重复（**P1-23**）

### 5.14 主题系统
- CSS 变量已定义但组件未使用（**P1-17**）
- ThemeSwitcher 标题未本地化（P2-25）
- 主题面板缺少 role='dialog' 和焦点陷阱（P1-19）
- CountdownTimer 中 0.1 阈值死代码（P2-18）

### 5.15 导出功能
- 语文 PDF Helvetica 字体问题（**P0-5**）
- 古诗 PDF 小写 SVG 元素（**P0-6**）
- Algebra PDF 图标相对 URL（P2-32）
- Math PDF 固定高度截断（P2-31）
- Image 元素缺少 alt 属性（**P1-15**）

---

## 修复优先级建议

### 第一批（立即修复 — 影响功能可用）
1. 三个速认挑战 `quiz.start()` 缺失 — 整个功能不可用（P0-1, P0-2, P0-3）
2. 语文 PDF Helvetica 字体 — 中文字符全部缺失（P0-5）
3. 古诗 PDF 小写 SVG — Steve 头像不渲染（P0-6）
4. 数学混合模式排除除法 — 功能不完整（P0-4）
5. saveRecord/importRecords 缺少 try/catch — 可能导致应用崩溃（P0-7）

### 第二批（本轮迭代 — 影响用户体验）
6. 全站硬编码中文 i18n（P0-8 到 P0-12 + 大量 P1/P2）
7. distractor 生成逻辑错误（P1-3）
8. 过时闭包问题（P1-1, P1-2）
9. ESLint 清理和未使用导入移除（P1-12）

### 第三批（后续迭代 — 质量提升）
10. 成就系统进度条修复（P2-11, P2-12）
11. 古诗填空随机化（P1-7）
12. 主题系统 CSS 变量应用（P1-17）
13. ARIA 无障碍属性补充（P1-18）
14. 组件提取和去重（P1-23）
