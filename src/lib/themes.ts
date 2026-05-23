export type ThemeId = 'classic' | 'ocean' | 'forest' | 'sunset' | 'night';

export interface Theme {
  id: ThemeId;
  name: string;
  nameEn: string;
  emoji: string;
  background: string;
  cardBg: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

export const THEMES: Theme[] = [
  {
    id: 'classic',
    name: '经典',
    nameEn: 'Classic',
    emoji: '🟤',
    background: '#795548',
    cardBg: '#E2E8F0',
    primary: '#4CAF50',
    secondary: '#FF9800',
    accent: '#2196F3',
    text: '#333',
  },
  {
    id: 'ocean',
    name: '海洋',
    nameEn: 'Ocean',
    emoji: '🌊',
    background: '#0277BD',
    cardBg: '#E3F2FD',
    primary: '#00BCD4',
    secondary: '#FF9800',
    accent: '#E91E63',
    text: '#333',
  },
  {
    id: 'forest',
    name: '森林',
    nameEn: 'Forest',
    emoji: '🌲',
    background: '#2E7D32',
    cardBg: '#E8F5E9',
    primary: '#FF9800',
    secondary: '#F44336',
    accent: '#7C4DFF',
    text: '#333',
  },
  {
    id: 'sunset',
    name: '日落',
    nameEn: 'Sunset',
    emoji: '🌅',
    background: '#BF360C',
    cardBg: '#FBE9E7',
    primary: '#FFD600',
    secondary: '#00BCD4',
    accent: '#AA00FF',
    text: '#333',
  },
  {
    id: 'night',
    name: '星空',
    nameEn: 'Night',
    emoji: '🌙',
    background: '#1A1A2E',
    cardBg: '#16213E',
    primary: '#E94560',
    secondary: '#0F3460',
    accent: '#533483',
    text: '#E0E0E0',
  },
];

const STORAGE_KEY = 'duomi-theme';

export function getCurrentThemeId(): ThemeId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && THEMES.find((t) => t.id === raw)) {
      return raw as ThemeId;
    }
  } catch { /* ignore */ }
  return 'classic';
}

export function setThemeId(id: ThemeId): void {
  localStorage.setItem(STORAGE_KEY, id);
}

export function getTheme(id?: ThemeId): Theme {
  return THEMES.find((t) => t.id === (id || getCurrentThemeId())) || THEMES[0];
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.style.setProperty('--theme-bg', theme.background);
  root.style.setProperty('--theme-card', theme.cardBg);
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-secondary', theme.secondary);
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-text', theme.text);
}
