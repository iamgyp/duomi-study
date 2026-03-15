# 学习记录功能使用说明

## 功能概述

学习记录功能已集成到 duomi-study 项目中，支持记录每次学习活动、查看学习统计、导出/导入数据等功能。

## 新增文件

### 类型定义
- `src/types/study-record.ts` - 学习记录数据类型定义

### 工具库
- `src/lib/study-storage.ts` - localStorage 存储操作工具

### UI 组件
- `src/components/StudyRecordButton.tsx` - 完成学习按钮组件
- `src/components/StudyStats.tsx` - 学习统计卡片组件
- `src/components/StudyRecordList.tsx` - 学习记录列表组件

### 页面
- `src/app/history/page.tsx` - 学习记录页面 `/history`

### 修改的文件
- `src/app/page.tsx` - 首页添加学习记录入口
- `src/app/chinese/page.tsx` - 添加完成学习按钮
- `src/app/math/page.tsx` - 添加完成学习按钮
- `src/app/math/algebra/page.tsx` - 添加完成学习按钮
- `src/app/english/page.tsx` - 添加完成学习按钮

## 功能特性

### 1. 学习记录数据模型
```typescript
{
  id: string;           // 唯一标识
  subject: 'chinese' | 'math' | 'english' | 'algebra';
  contentType: 'character' | 'poem' | 'basic-math' | 'algebra' | 'english-word';
  contentTitle: string; // 学习内容标题
  duration: number;     // 学习时长（分钟）
  completedAt: string;  // 完成时间 ISO 格式
  score?: number;       // 可选：得分
}
```

### 2. 统计功能
- **总学习时长** - 累计所有学习记录
- **今日学习** - 当天学习时长
- **连续学习天数** - 自动计算连续学习天数
- **学科分布** - 各学科学习时长条形图
- **学习记录数** - 总记录条数

### 3. 数据管理
- **导出数据** - 将学习记录导出为 JSON 文件备份
- **导入数据** - 从 JSON 文件恢复学习记录
- **清空记录** - 一键清空所有学习记录（需确认）
- **删除单条** - 可删除单条学习记录

## 使用方法

### 记录学习
1. 进入任意学科页面（语文/数学/英语/代数）
2. 完成学习后，点击侧边栏底部的"完成学习"按钮
3. 在弹窗中选择学习时长（5-60分钟）
4. 点击"确认记录"完成记录

### 查看学习记录
1. 从首页点击"学习记录"卡片
2. 或直接访问 `/history` 页面
3. 查看统计卡片和学习历史列表

### 备份数据
1. 在学习记录页面点击"导出数据"按钮
2. 保存 JSON 文件到本地

### 恢复数据
1. 在学习记录页面点击"导入数据"按钮
2. 粘贴之前导出的 JSON 内容
3. 点击"导入"按钮

## 技术实现

- **存储方案**: 使用浏览器 localStorage 存储，无需后端
- **数据持久化**: 数据保存在浏览器本地，换设备需手动导出导入
- **隐私安全**: 数据仅存储在本地，不会上传到服务器

## 注意事项

1. 清除浏览器数据会导致学习记录丢失，建议定期导出备份
2. 同一浏览器不同用户的数据会混在一起
3. 连续学习天数计算基于有学习记录的日期
