/** Страница профиля */

import React from 'react';
import { useGameState } from '../hooks/useGameState';
import { formatDate } from '../utils/formatting';
import type { User } from '../types';

interface ProfilePageProps {
  user: User | null;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onLogout,
}) => {
  return (
    <div className="pb-24 animate-slide-up">
      {/* Заголовок */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-2">👤 Профиль</h1>
        <p className="text-gray-400">
          Информация о вашем аккаунте
        </p>
      </div>

      {/* Информация о пользователе */}
      <div className="p-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-3xl">
              {user?.first_name ? user.first_name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-400">
                @{user?.username || 'no_username'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-dark-border">
              <span className="text-gray-400">Telegram ID</span>
              <span className="text-white font-mono">{user?.telegram_id}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dark-border">
              <span className="text-gray-400">Язык</span>
              <span className="text-white">
                {user?.language_code?.toUpperCase() || 'RU'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dark-border">
              <span className="text-gray-400">Регистрация</span>
              <span className="text-white">
                {user?.created_at ? formatDate(user.created_at) : '---'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dark-border">
              <span className="text-gray-400">Последний вход</span>
              <span className="text-white">
                {user?.last_login ? formatDate(user.last_login) : '---'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Статистика */}
      {user && (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Баланс</div>
              <div className="text-xl font-bold text-white">
                {user.coins.toLocaleString('ru-RU')} 💰
              </div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Всего кликов</div>
              <div className="text-xl font-bold text-white">
                {user.total_clicks.toLocaleString('ru-RU')}
              </div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Всего монет</div>
              <div className="text-xl font-bold text-white">
                {user.total_coins_earned.toLocaleString('ru-RU')}
              </div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Коэффициент</div>
              <div className="text-xl font-bold text-primary-400">
                {user.total_clicks > 0 
                  ? (user.total_coins_earned / user.total_clicks).toFixed(2)
                  : '0.00'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Настройки */}
      <div className="p-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">⚙️ Настройки</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-white">Звуки</div>
                <div className="text-xs text-gray-400">Звуковые эффекты</div>
              </div>
              <button className="w-12 h-6 bg-primary-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-white">Вибрация</div>
                <div className="text-xs text-gray-400">Тактильная отдача</div>
              </div>
              <button className="w-12 h-6 bg-primary-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-white">Уведомления</div>
                <div className="text-xs text-gray-400">Напоминания о наградах</div>
              </div>
              <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Информация о приложении */}
      <div className="p-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">ℹ️ О приложении</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Версия</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Стек</span>
              <span className="text-white">React + FastAPI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка выхода */}
      <div className="p-4">
        <button
          onClick={onLogout}
          className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-colors"
        >
          Выйти из аккаунта
        </button>
      </div>

      {/* Информация о данных */}
      <div className="px-4 pb-4">
        <p className="text-xs text-gray-500 text-center">
          Все ваши данные хранятся на сервере. При выходе они сохранятся.
        </p>
      </div>
    </div>
  );
};
