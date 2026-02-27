'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

type Locale = 'zh' | 'en';

export function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>('zh');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('NEXT_LOCALE') as Locale;
    if (saved) {
      setLocale(saved);
    }
  }, []);

  const switchLanguage = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('NEXT_LOCALE', newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-sm border-2 border-white/20 backdrop-blur-sm">
        <Globe className="h-5 w-5 text-white" />
        <span className="text-white text-sm">...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-sm border-2 border-white/20 backdrop-blur-sm">
      <Globe className="h-5 w-5 text-white" />
      <button
        onClick={() => switchLanguage('zh')}
        className={`px-3 py-1 text-sm font-bold border-2 transition-all ${
          locale === 'zh'
            ? 'bg-yellow-400 text-black border-yellow-400'
            : 'bg-white/20 text-white border-white/50 hover:bg-white/30'
        }`}
      >
        中文
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1 text-sm font-bold border-2 transition-all ${
          locale === 'en'
            ? 'bg-yellow-400 text-black border-yellow-400'
            : 'bg-white/20 text-white border-white/50 hover:bg-white/30'
        }`}
      >
        EN
      </button>
    </div>
  );
}
