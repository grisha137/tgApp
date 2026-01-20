/** Хук для работы с Telegram WebApp */

import { useState, useEffect, useCallback } from 'react';
import { 
  getTelegramWebApp, 
  isTelegramWebApp, 
  getInitData, 
  initTelegramWebApp,
  hapticImpact,
  hapticNotification,
  hapticSelection,
} from '../services/telegram';

interface UseTelegramReturn {
  webApp: ReturnType<typeof getTelegramWebApp>;
  isTelegram: boolean;
  initData: string;
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  } | null;
  theme: 'light' | 'dark';
  expand: () => void;
  ready: () => void;
  hapticImpact: (style: 'light' | 'medium' | 'heavy') => void;
  hapticNotification: (type: 'error' | 'success' | 'warning') => void;
  hapticSelection: () => void;
}

export const useTelegram = (): UseTelegramReturn => {
  const [webApp, setWebApp] = useState(getTelegramWebApp());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<UseTelegramReturn['user']>(null);

  useEffect(() => {
    const app = getTelegramWebApp();
    if (app) {
      setWebApp(app);
      setTheme(app.colorScheme);
      setUser(app.initDataUnsafe.user || null);
      
      // Инициализация WebApp
      initTelegramWebApp();
      
      // Обработка смены темы
      const handleThemeChange = () => {
        setTheme(app.colorScheme);
      };
      
      // В реальном приложении здесь можно добавить слушатели событий
      // app.onEvent('themeChanged', handleThemeChange);
    }
  }, []);

  const expand = useCallback(() => {
    webApp?.expand();
  }, [webApp]);

  const ready = useCallback(() => {
    webApp?.ready();
  }, [webApp]);

  return {
    webApp,
    isTelegram: isTelegramWebApp(),
    initData: getInitData(),
    user,
    theme,
    expand,
    ready,
    hapticImpact,
    hapticNotification,
    hapticSelection,
  };
};
