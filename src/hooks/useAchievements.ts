import { useState, useEffect, useCallback } from 'react';
import { evaluateAchievements, getUnlockedAchievements, UnlockedAchievement, getUnlockedCount } from '@/lib/achievement-engine';
import { invalidateCache } from '@/lib/stats-aggregator';

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [pendingUnlocks, setPendingUnlocks] = useState<UnlockedAchievement[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    setUnlocked(getUnlockedAchievements());
    setUnlockedCount(getUnlockedCount());
  }, []);

  const checkAndUnlock = useCallback(() => {
    invalidateCache();
    const newUnlocks = evaluateAchievements();
    if (newUnlocks.length > 0) {
      setUnlocked(getUnlockedAchievements());
      setUnlockedCount(getUnlockedCount());
      setPendingUnlocks(newUnlocks);
    }
  }, []);

  const dismissPending = useCallback(() => {
    setPendingUnlocks([]);
  }, []);

  return {
    unlocked,
    pendingUnlocks,
    unlockedCount,
    checkAndUnlock,
    dismissPending,
  };
}
