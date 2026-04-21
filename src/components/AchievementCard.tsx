import { Achievement } from '@/lib/achievement-registry';
import { AggregatedStats } from '@/lib/stats-aggregator';
import { UnlockedAchievement } from '@/lib/achievement-engine';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockData?: UnlockedAchievement;
  stats: AggregatedStats;
  unlockedCount: number;
}

export function AchievementCard({ achievement, isUnlocked, unlockData, stats, unlockedCount }: AchievementCardProps) {
  const progressValue = achievement.category === 'collection'
    ? achievement.progressValue(stats, unlockedCount)
    : achievement.progressValue(stats);
  const progressMax = achievement.progressMax;
  const progressLabel = achievement.category === 'collection'
    ? achievement.progressLabel(stats, unlockedCount)
    : achievement.progressLabel(stats);
  const progressPercent = progressMax > 0 ? Math.min((progressValue / progressMax) * 100, 100) : 0;

  return (
    <div
      className={`mc-card p-4 relative transition-all ${
        isUnlocked
          ? 'bg-white hover:scale-105'
          : 'bg-gray-200'
      }`}
    >
      {/* Icon */}
      <div className="text-4xl sm:text-5xl mb-2 text-center">
        {isUnlocked ? achievement.icon : (
          <span className="opacity-30 grayscale">🔒</span>
        )}
      </div>

      {/* Name */}
      <h3 className="text-center text-sm sm:text-base font-bold text-[#333] mb-1">
        {isUnlocked ? achievement.name : '???'}
      </h3>

      {/* Description */}
      <p className="text-center text-xs text-gray-500 mb-2">{achievement.description}</p>

      {/* Unlocked date */}
      {isUnlocked && unlockData && (
        <p className="text-center text-xs text-[#4CAF50] mb-2">
          {new Date(unlockData.unlockedAt).toLocaleDateString('zh-CN')}
        </p>
      )}

      {/* Progress bar for locked achievements */}
      {!isUnlocked && progressMax > 0 && (
        <div className="w-full bg-gray-300 rounded-sm h-3 overflow-hidden">
          <div
            className="h-full bg-[#F59E0B] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Progress label */}
      {!isUnlocked && (
        <p className="text-center text-xs text-gray-400 mt-1">{progressLabel}</p>
      )}

      {/* Locked overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-black/20 rounded-sm" />
      )}
    </div>
  );
}
