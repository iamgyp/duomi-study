'use client';

import { useEffect, useState } from 'react';
import { Share2 } from 'lucide-react';
import { UnlockedAchievement } from '@/lib/achievement-engine';
import { getAchievementById } from '@/lib/achievement-registry';

interface AchievementToastProps {
  unlocks: UnlockedAchievement[];
  onDismiss: () => void;
}

export function AchievementToast({ unlocks, onDismiss }: AchievementToastProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (unlocks.length === 0) return;

    const showTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (currentIndex < unlocks.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsVisible(true);
        } else {
          onDismiss();
        }
      }, 500);
    }, 4000);

    return () => clearTimeout(showTimer);
  }, [currentIndex, unlocks.length, onDismiss]);

  const handleShare = () => {
    if (!achievement) return;
    const text = `🏆 我在多米习题站解锁了成就「${achievement.name}」！${achievement.description}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 1500);
    }
  };

  if (unlocks.length === 0) return null;

  const unlock = unlocks[currentIndex];
  const achievement = getAchievementById(unlock.achievementId);
  if (!achievement) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[100] transition-all duration-500 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="mc-card bg-[#FFD700] p-4 flex items-center gap-3 animate-bounce-once relative">
        <div className="text-4xl">{achievement.icon}</div>
        <div>
          <div className="text-xs font-bold text-black/60 uppercase">成就解锁!</div>
          <div className="text-lg font-bold text-black">{achievement.name}</div>
          <div className="text-sm text-black/70">{achievement.description}</div>
        </div>
        <button
          onClick={handleShare}
          className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded transition-colors"
          title="复制分享"
        >
          <Share2 className="h-4 w-4 text-black/50" />
        </button>
        {showShare && (
          <div className="absolute bottom-2 right-2 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-sm">
            已复制到剪贴板!
          </div>
        )}
      </div>
    </div>
  );
}
