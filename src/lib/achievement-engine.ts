import { ACHIEVEMENTS, getAchievementById } from './achievement-registry';
import { rebuildStats } from './stats-aggregator';
import { calculateConsecutiveDays } from './study-storage';
import { getAllQuizSessions } from './quiz-engine';

const UNLOCKED_KEY = 'duomi-achievements-unlocked';

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
}

export function getUnlockedAchievements(): UnlockedAchievement[] {
  try {
    const data = localStorage.getItem(UNLOCKED_KEY);
    if (!data) return [];
    return JSON.parse(data) as UnlockedAchievement[];
  } catch {
    return [];
  }
}

export function evaluateAchievements(): UnlockedAchievement[] {
  const stats = rebuildStats();
  const consecutiveDays = calculateConsecutiveDays();
  const unlocked = getUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map(u => u.achievementId));
  const newUnlocks: UnlockedAchievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;

    let isUnlocked = false;

    if (achievement.id === 'seven-day-warrior') {
      isUnlocked = consecutiveDays >= 7;
    }
    else if (achievement.id === 'triple-perfect') {
      isUnlocked = checkTriplePerfect();
    }
    else if (achievement.category === 'collection') {
      isUnlocked = achievement.check(stats, unlocked.length);
    }
    else {
      isUnlocked = achievement.check(stats);
    }

    if (isUnlocked) {
      const unlock: UnlockedAchievement = {
        achievementId: achievement.id,
        unlockedAt: new Date().toISOString(),
      };
      unlocked.push(unlock);
      newUnlocks.push(unlock);
    }
  }

  if (newUnlocks.length > 0) {
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
  }

  return newUnlocks;
}

function checkTriplePerfect(): boolean {
  const sessions = getAllQuizSessions()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  let streak = 0;
  for (const session of sessions) {
    if (session.accuracy === 1 && session.totalQuestions > 0) {
      streak += 1;
      if (streak >= 3) return true;
    } else {
      streak = 0;
    }
  }
  return false;
}

export function unlockAchievement(achievementId: string): UnlockedAchievement | null {
  const achievement = getAchievementById(achievementId);
  if (!achievement) return null;

  const unlocked = getUnlockedAchievements();
  if (unlocked.some(u => u.achievementId === achievementId)) return null;

  const unlock: UnlockedAchievement = {
    achievementId,
    unlockedAt: new Date().toISOString(),
  };
  unlocked.push(unlock);
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
  return unlock;
}

export function isUnlocked(achievementId: string): boolean {
  return getUnlockedAchievements().some(u => u.achievementId === achievementId);
}

export function getUnlockedCount(): number {
  return getUnlockedAchievements().length;
}

export function clearUnlocks(): void {
  localStorage.removeItem(UNLOCKED_KEY);
}
