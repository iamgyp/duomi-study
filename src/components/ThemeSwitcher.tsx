'use client';

import { useState, useEffect } from 'react';
import { Palette, X } from 'lucide-react';
import { Theme, THEMES, getCurrentThemeId, setThemeId, getTheme, applyTheme, ThemeId } from '@/lib/themes';

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getTheme());
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const theme = getTheme(getCurrentThemeId());
    setCurrentTheme(theme);
    applyTheme(theme);
  }, []);

  const handleSelect = (theme: Theme) => {
    setThemeId(theme.id);
    setCurrentTheme(theme);
    applyTheme(theme);
    setShowPanel(false);
  };

  return (
    <>
      <button
        onClick={() => setShowPanel(true)}
        className="p-2 hover:bg-white/10 rounded-sm transition-colors"
        title="切换主题"
      >
        <Palette className="h-5 w-5 text-white" />
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowPanel(false)} />
          <div className="relative mc-card bg-[#E2E8F0] p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#333] flex items-center gap-2">
                <Palette className="h-5 w-5" />
                选择主题
              </h3>
              <button onClick={() => setShowPanel(false)} className="p-1 hover:bg-black/10 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleSelect(theme)}
                  className={`p-3 rounded-sm border-2 transition-all ${
                    currentTheme.id === theme.id
                      ? 'border-black scale-105 shadow-lg'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: theme.background }}
                >
                  <div className="text-2xl mb-1">{theme.emoji}</div>
                  <div className={`text-sm font-bold ${theme.id === 'night' ? 'text-white' : 'text-[#333]'}`}>
                    {theme.name}
                  </div>
                  <div className={`text-xs ${theme.id === 'night' ? 'text-white/60' : 'text-gray-500'}`}>
                    {theme.nameEn}
                  </div>
                  {currentTheme.id === theme.id && (
                    <div className="mt-1 text-xs text-green-400 font-bold">✓ 当前</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
