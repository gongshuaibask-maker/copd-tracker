// i18n — 国际化框架入口
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import zh from './zh';
import en from './en';
import { getDatabase } from '../database';

export type Language = 'zh' | 'en';
export type Translations = typeof zh;

const translations: Record<Language, Translations> = { zh, en };

// ==================== Context ====================
interface LanguageContextType {
  lang: Language;
  t: Translations;
  setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'zh',
  t: zh,
  setLanguage: async () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('zh');

  // Load saved language on mount
  useEffect(() => {
    (async () => {
      try {
        const db = await getDatabase();
        // Create settings table if not exists
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          )
        `);
        const row = await db.getFirstAsync<{ value: string }>(
          "SELECT value FROM app_settings WHERE key = 'language'"
        );
        if (row && (row.value === 'zh' || row.value === 'en')) {
          setLang(row.value);
        }
      } catch { /* ignore */ }
    })();
  }, []);

  const setLanguage = useCallback(async (newLang: Language) => {
    setLang(newLang);
    try {
      const db = await getDatabase();
      await db.runAsync(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('language', ?)",
        [newLang]
      );
    } catch { /* ignore */ }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ==================== Hook ====================
export function useT(): Translations {
  const { t } = useContext(LanguageContext);
  return t;
}

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext);
}

export default translations;
