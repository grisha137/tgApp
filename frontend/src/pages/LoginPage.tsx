/** Страница входа */

import React, { useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import api from '../services/api';
import { showToast } from '../utils/animations';
import type { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const { initData, isTelegram } = useTelegram();

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      const response = await api.authenticate(initData);
      
      // Сохранение токена
      localStorage.setItem('access_token', response.access_token);
      
      // Успешный вход
      onLogin(response.user);
      showToast('Добро пожаловать!', 'success');
    } catch (error: any) {
      console.error('Login error:', error);
      showToast(
        error.response?.data?.detail || 'Ошибка авторизации',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Автоматический вход при загрузке, если есть initData
  React.useEffect(() => {
    if (isTelegram && initData) {
      handleLogin();
    }
  }, [isTelegram, initData]);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">💰</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Idle Clicker
          </h1>
          <p className="text-gray-400">
            Нажимай, улучшай, становись богаче!
          </p>
        </div>

        {/* Информация */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            О игре
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-2xl">👆</span>
              <div>
                <div className="font-semibold text-white">Кликай</div>
                <div className="text-sm text-gray-400">
                  Нажимай на кнопку, чтобы зарабатывать монеты
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="font-semibold text-white">Улучшай</div>
                <div className="text-sm text-gray-400">
                  Покупай апгрейды для увеличения дохода
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🎁</span>
              <div>
                <div className="font-semibold text-white">Получай награды</div>
                <div className="text-sm text-gray-400">
                  Ежедневные бонусы за активность
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">💤</span>
              <div>
                <div className="font-semibold text-white">Отдыхай</div>
                <div className="text-sm text-gray-400">
                  Игра зарабатывает даже офлайн!
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* Кнопка входа */}
        {!isTelegram && (
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`
              w-full py-4 rounded-xl font-bold text-lg
              transition-all duration-200 transform hover:scale-[1.02]
              ${loading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Загрузка...</span>
              </div>
            ) : (
              'Начать играть'
            )}
          </button>
        )}

        {/* Режим разработки */}
        {!isTelegram && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Режим разработки: используется тестовый initData
            </p>
          </div>
        )}

        {/* Информация о Telegram */}
        {isTelegram && loading && (
          <div className="mt-4 text-center">
            <div className="animate-pulse text-primary-400">
              Авторизация через Telegram...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
