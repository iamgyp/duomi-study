/**
 * 学习记录数据类型定义
 */

export type Subject = 'chinese' | 'math' | 'english' | 'algebra';

export type ContentType = 
  | 'character'      // 汉字练习
  | 'poem'           // 古诗填空
  | 'basic-math'     // 基础数学
  | 'algebra'        // 代数练习
  | 'english-word';  // 英语单词

export interface StudyRecord {
  id: string;
  subject: Subject;
  contentType: ContentType;
  contentTitle: string;
  duration: number;        // 学习时长（分钟）
  completedAt: string;     // ISO 8601 格式时间戳
  score?: number;          // 可选：得分
}

export interface StudyStats {
  totalDuration: number;           // 总学习时长（分钟）
  todayDuration: number;           // 今日学习时长（分钟）
  consecutiveDays: number;         // 连续学习天数
  subjectDistribution: Record<Subject, number>;  // 学科分布（分钟）
  totalRecords: number;            // 总记录数
}

export interface DailyStudy {
  date: string;           // YYYY-MM-DD
  duration: number;       // 当天学习时长（分钟）
}
