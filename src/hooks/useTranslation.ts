'use client';

import { useEffect, useState, useCallback } from 'react';

type Locale = 'zh' | 'en';

function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>('zh');
  const [messages, setMessages] = useState<Record<string, any> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const savedLocale = (localStorage.getItem('NEXT_LOCALE') as Locale) || 'zh';
    loadMessages(savedLocale);
  }, [refreshKey]);

  const loadMessages = useCallback((loc: Locale) => {
    setLocale(loc);
    import(`../../messages/${loc}.json`)
      .then((mod) => setMessages(mod.default))
      .catch(() => import(`../../messages/zh.json`).then((mod) => {
        setLocale('zh');
        setMessages(mod.default);
      }));
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    if (!messages) return key;
    const value = getNestedValue(messages, key);
    let result = typeof value === 'string' ? value : key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, String(v));
      });
    }
    return result;
  }, [messages]);

  const switchLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem('NEXT_LOCALE', newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    // Force re-render with new locale
    setRefreshKey((k) => k + 1);
  }, []);

  return { t, locale, mounted, switchLocale };
}
