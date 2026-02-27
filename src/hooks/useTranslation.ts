'use client';

import { useEffect, useState } from 'react';

type Locale = 'zh' | 'en';

interface TranslationMessages {
  Common: Record<string, string>;
  Home: Record<string, string>;
  Math: Record<string, string>;
  Algebra: Record<string, string>;
  Chinese: Record<string, string>;
  English: Record<string, string>;
  Footer: Record<string, string>;
}

function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>('zh');
  const [messages, setMessages] = useState<TranslationMessages | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLocale = (localStorage.getItem('NEXT_LOCALE') as Locale) || 'zh';
    setLocale(savedLocale);
    
    // Load messages
    import(`../../messages/${savedLocale}.json`)
      .then((mod) => setMessages(mod.default as TranslationMessages))
      .catch(() => {
        import(`../../messages/zh.json`)
          .then((mod) => setMessages(mod.default as TranslationMessages));
      });
  }, []);

  const t = (key: string): string => {
    if (!messages) return key;
    const value = getNestedValue(messages, key);
    return typeof value === 'string' ? value : key;
  };

  return {
    t,
    locale,
    mounted,
  };
}
