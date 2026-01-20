/** Telegram WebApp интеграция */

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
    secondary_bg_color: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    hide(): void;
    show(): void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    onClick(callback: () => void): void;
    show(): void;
    hide(): void;
    setText(text: string): void;
    setColor(color: string): void;
    setTextColor(color: string): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive: boolean): void;
    hideProgress(): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  ready(): void;
  expand(): void;
  close(): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const isTelegramWebApp = (): boolean => {
  return getTelegramWebApp() !== null;
};

export const getInitData = (): string => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    return webApp.initData;
  }
  // Для разработки возвращаем тестовые данные
  return 'auth_date=1700000000&hash=test&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D';
};

export const initTelegramWebApp = (): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    // Сообщаем Telegram, что приложение готово
    webApp.ready();
    
    // Применяем тему Telegram
    document.documentElement.style.setProperty('--tg-bg-color', webApp.themeParams.bg_color);
    document.documentElement.style.setProperty('--tg-text-color', webApp.themeParams.text_color);
    document.documentElement.style.setProperty('--tg-hint-color', webApp.themeParams.hint_color);
    document.documentElement.style.setProperty('--tg-link-color', webApp.themeParams.link_color);
    document.documentElement.style.setProperty('--tg-button-color', webApp.themeParams.button_color);
    document.documentElement.style.setProperty('--tg-button-text-color', webApp.themeParams.button_text_color);
    
    // Расширяем на весь экран
    webApp.expand();
    
    // Устанавливаем цвет фона
    if (webApp.themeParams.bg_color) {
      document.body.style.backgroundColor = webApp.themeParams.bg_color;
    }
  }
};

export const hapticImpact = (style: 'light' | 'medium' | 'heavy' = 'medium'): void => {
  const webApp = getTelegramWebApp();
  if (webApp?.HapticFeedback) {
    webApp.HapticFeedback.impactOccurred(style);
  }
};

export const hapticNotification = (type: 'error' | 'success' | 'warning' = 'success'): void => {
  const webApp = getTelegramWebApp();
  if (webApp?.HapticFeedback) {
    webApp.HapticFeedback.notificationOccurred(type);
  }
};

export const hapticSelection = (): void => {
  const webApp = getTelegramWebApp();
  if (webApp?.HapticFeedback) {
    webApp.HapticFeedback.selectionChanged();
  }
};
