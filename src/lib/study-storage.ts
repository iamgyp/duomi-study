/**
 * 学习记录本地存储工具
 * 使用 localStorage 存储学习记录
 */

import { StudyRecord, StudyStats, Subject, DailyStudy } from '@/types/study-record';

const STORAGE_KEY = 'duomi-study-records';
const LAST_STUDY_DATE_KEY = 'duomi-last-study-date';

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取当前日期字符串 YYYY-MM-DD
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 获取所有学习记录
 */
export function getAllRecords(): StudyRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as StudyRecord[];
  } catch (error) {
    console.error('Failed to load study records:', error);
    return [];
  }
}

/**
 * 保存学习记录
 */
export function saveRecord(record: Omit<StudyRecord, 'id'>): StudyRecord {
  const records = getAllRecords();
  const newRecord: StudyRecord = {
    ...record,
    id: generateId(),
  };
  records.push(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  
  // 更新最后学习日期
  localStorage.setItem(LAST_STUDY_DATE_KEY, getTodayString());
  
  return newRecord;
}

/**
 * 删除学习记录
 */
export function deleteRecord(id: string): boolean {
  try {
    const records = getAllRecords();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete record:', error);
    return false;
  }
}

/**
 * 清空所有学习记录
 */
export function clearAllRecords(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_STUDY_DATE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear records:', error);
    return false;
  }
}

/**
 * 计算连续学习天数
 */
export function calculateConsecutiveDays(): number {
  const records = getAllRecords();
  if (records.length === 0) return 0;
  
  // 获取所有有学习记录的日期（去重并排序）
  const studyDates = [...new Set(records.map(r => r.completedAt.split('T')[0]))].sort().reverse();
  
  if (studyDates.length === 0) return 0;
  
  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];
  
  // 如果今天或昨天没有学习记录，连续天数为0
  if (studyDates[0] !== today && studyDates[0] !== yesterdayString) {
    return 0;
  }
  
  // 计算连续天数
  let consecutiveDays = 1;
  for (let i = 1; i < studyDates.length; i++) {
    const currentDate = new Date(studyDates[i - 1]);
    const prevDate = new Date(studyDates[i]);
    const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      consecutiveDays++;
    } else {
      break;
    }
  }
  
  return consecutiveDays;
}

/**
 * 获取学习统计
 */
export function getStudyStats(): StudyStats {
  const records = getAllRecords();
  const today = getTodayString();
  
  const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
  const todayDuration = records
    .filter(r => r.completedAt.startsWith(today))
    .reduce((sum, r) => sum + r.duration, 0);
  
  const subjectDistribution: Record<Subject, number> = {
    chinese: 0,
    math: 0,
    english: 0,
    algebra: 0,
  };
  
  records.forEach(r => {
    if (subjectDistribution[r.subject] !== undefined) {
      subjectDistribution[r.subject] += r.duration;
    }
  });
  
  return {
    totalDuration,
    todayDuration,
    consecutiveDays: calculateConsecutiveDays(),
    subjectDistribution,
    totalRecords: records.length,
  };
}

/**
 * 获取最近的学习记录（按时间倒序）
 */
export function getRecentRecords(limit: number = 50): StudyRecord[] {
  const records = getAllRecords();
  return records
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, limit);
}

/**
 * 导出学习记录为 JSON
 */
export function exportRecords(): string {
  const records = getAllRecords();
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    records,
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * 导入学习记录
 * @returns 导入的记录数量，如果失败返回 -1
 */
export function importRecords(jsonString: string): number {
  try {
    const data = JSON.parse(jsonString);
    if (!data.records || !Array.isArray(data.records)) {
      throw new Error('Invalid data format');
    }
    
    const existingRecords = getAllRecords();
    const existingIds = new Set(existingRecords.map(r => r.id));
    
    let importedCount = 0;
    data.records.forEach((record: StudyRecord) => {
      if (!existingIds.has(record.id)) {
        existingRecords.push(record);
        importedCount++;
      }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingRecords));
    return importedCount;
  } catch (error) {
    console.error('Failed to import records:', error);
    return -1;
  }
}

/**
 * 获取每日学习数据（用于图表）
 * @param days 最近多少天
 */
export function getDailyStudyData(days: number = 7): DailyStudy[] {
  const records = getAllRecords();
  const result: DailyStudy[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const dayDuration = records
      .filter(r => r.completedAt.startsWith(dateString))
      .reduce((sum, r) => sum + r.duration, 0);
    
    result.push({
      date: dateString,
      duration: dayDuration,
    });
  }
  
  return result;
}

/**
 * 格式化时长显示
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${remainingMinutes}分钟`;
}

/**
 * 获取学科显示名称
 */
export function getSubjectLabel(subject: Subject): string {
  const labels: Record<Subject, string> = {
    chinese: '语文',
    math: '数学',
    english: '英语',
    algebra: '代数',
  };
  return labels[subject] || subject;
}

/**
 * 获取内容类型显示名称
 */
export function getContentTypeLabel(contentType: string): string {
  const labels: Record<string, string> = {
    'character': '汉字练习',
    'poem': '古诗填空',
    'basic-math': '基础数学',
    'algebra': '代数练习',
    'english-word': '英语单词',
  };
  return labels[contentType] || contentType;
}
