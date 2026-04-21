'use client';

import { CheckCircle, X } from 'lucide-react';
import { UnlockedAchievement } from '@/lib/achievement-engine';
import { getAchievementById } from '@/lib/achievement-registry';

interface AchievementToastProps {
  unlocks: UnlockedAchievement[];
  onDismiss: () => void;
}

export function AchievementToast({ unlocks, onDismiss }: AchievementToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm animate-in slide-in-from-bottom-4">
      {unlocks.map((unlock) => {
        const achievement = getAchievementById(unlock.achievementId);
        return (
          <div
            key={unlock.achievementId}
            className="mc-card bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 text-black shadow-lg border-4 border-yellow-600"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">🏆</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-700" />
                  <span className="font-bold text-sm font-[var(--font-pixel)]">成就解锁！</span>
                </div>
                <p className="font-bold mt-1">{achievement?.name || unlock.achievementId}</p>
                <p className="text-sm text-yellow-900/70">{achievement?.description || ''}</p>
              </div>
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-black/10 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
