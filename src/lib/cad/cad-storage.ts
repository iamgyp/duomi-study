/**
 * CAD 练习记录与进度本地存储 (localStorage)
 */

const CAD_STORAGE_KEY = 'duomi-cad-progress';

export interface CadProgress {
  completedMissions: string[];           // 已通关的蓝图任务 ID
  stars: Record<string, number>;          // 每个关卡获得的星级 (1~3)
  commandSuccessCounts: Record<string, number>; // 各快捷键成功执行次数
  totalBuilds: number;                   // 累计完成施工步骤数
  lastPlayedAt: string;                  // 最近练习时间
}

const DEFAULT_PROGRESS: CadProgress = {
  completedMissions: [],
  stars: {},
  commandSuccessCounts: {},
  totalBuilds: 0,
  lastPlayedAt: '',
};

export function getCadProgress(): CadProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(CAD_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      completedMissions: Array.isArray(parsed.completedMissions) ? parsed.completedMissions : [],
      stars: typeof parsed.stars === 'object' && parsed.stars ? parsed.stars : {},
      commandSuccessCounts:
        typeof parsed.commandSuccessCounts === 'object' && parsed.commandSuccessCounts
          ? parsed.commandSuccessCounts
          : {},
      totalBuilds: typeof parsed.totalBuilds === 'number' ? parsed.totalBuilds : 0,
      lastPlayedAt: parsed.lastPlayedAt || '',
    };
  } catch (e) {
    console.error('Failed to read CAD progress from localStorage:', e);
    return DEFAULT_PROGRESS;
  }
}

export function saveCadProgress(progress: CadProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CAD_STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save CAD progress to localStorage:', e);
  }
}

export function recordCadCommandSuccess(commandKey: string): void {
  const p = getCadProgress();
  const normalizedKey = commandKey.toUpperCase().trim();
  p.commandSuccessCounts[normalizedKey] = (p.commandSuccessCounts[normalizedKey] || 0) + 1;
  p.totalBuilds += 1;
  p.lastPlayedAt = new Date().toISOString();
  saveCadProgress(p);
}

export function markCadMissionComplete(missionId: string, stars = 3): CadProgress {
  const p = getCadProgress();
  if (!p.completedMissions.includes(missionId)) {
    p.completedMissions.push(missionId);
  }
  p.stars[missionId] = Math.max(p.stars[missionId] || 0, stars);
  p.lastPlayedAt = new Date().toISOString();
  saveCadProgress(p);
  return p;
}
