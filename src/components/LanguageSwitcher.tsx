'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Globe } from 'lucide-react';

type Locale = 'zh' | 'en';

export function LanguageSwitcher() {
  const { locale, switchLocale, t } = useTranslation();
  const { play } = useSoundEffects();

  return (
    <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-sm border-2 border-white/20 backdrop-blur-sm">
      <Globe className="h-5 w-5 text-white" />
      <button
        onClick={() => { play('click'); switchLocale('zh'); }}
        className={`px-3 py-1 text-sm font-bold border-2 transition-all ${
          locale === 'zh'
            ? 'bg-yellow-400 text-black border-yellow-400'
            : 'bg-white/20 text-white border-white/50 hover:bg-white/30'
        }`}
      >
        {t('LanguageSwitcher.chinese')}
      </button>
      <button
        onClick={() => { play('click'); switchLocale('en'); }}
        className={`px-3 py-1 text-sm font-bold border-2 transition-all ${
          locale === 'en'
            ? 'bg-yellow-400 text-black border-yellow-400'
            : 'bg-white/20 text-white border-white/50 hover:bg-white/30'
        }`}
      >
        {t('LanguageSwitcher.english')}
      </button>
    </div>
  );
}
