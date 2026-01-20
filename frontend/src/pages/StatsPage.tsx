/** Страница статистики */

import React, { useEffect, useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { formatCoins, formatTime } from '../utils/formatting';
import api from '../services/api';

interface UserStats {
  rank?: number;
  total_coins: number;
  total_clicks: number;
  play_time_hours: number;
  achievements_count: number;
  click_damage_level: number;
  passive_income_level: number;
  passive_income_per_sec: number;
  current_streak: number;
  max_streak: number;
  total_upgrades_purchased: number;
}

export const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-slide-up">
      {/* Заголовок */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-2">📊 Статистика</h1>
        <p className="text-gray-400">
          Ваша игровая статистика и достижения
        </p>
      </div>

      {stats && (
        <div className="p-4 space-y-4">
          {/* Основная статистика */}
          <div className="bg-gradient-to-r from-primary-500/20 to-primary-600/20 border border-primary-500/30 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-primary-300 mb-1">Ваш ранг</div>
                <div className="text-3xl font-bold text-white">
                  #{stats.rank || '---'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-primary-300 mb-1">Всего монет</div>
                <div className="text-3xl font-bold text-white">
                  {formatCoins(stats.total_coins)}
                </div>
              </div>
            </div>
          </div>

          {/* Игровая активность */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">🎮 Игровая активность</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Всего кликов</span>
                <span className="text-white font-semibold">
                  {formatCoins(stats.total_clicks)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Время игры</span>
                <span className="text-white font-semibold">
                  {stats.play_time_hours.toFixed(1)} ч
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Куплено апгрейдов</span>
                <span className="text-white font-semibold">
                  {stats.total_upgrades_purchased}
                </span>
              </div>
            </div>
          </div>

          {/* Прогресс развития */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">📈 Развитие</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400">Уровень силы клика</span>
                  <span className="text-secondary-400 font-semibold">
                    {stats.click_damage_level}
                  </span>
                </div>
                <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary-500 to-secondary-400"
                    style={{ width: `${Math.min((stats.click_damage_level / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400">Уровень пассивного дохода</span>
                  <span className="text-primary-400 font-semibold">
                    {stats.passive_income_level}
                  </span>
                </div>
                <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
                    style={{ width: `${Math.min((stats.passive_income_level / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400">Пассивный доход</span>
                  <span className="text-green-400 font-semibold">
                    {stats.passive_income_per_sec.toFixed(2)}/сек
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Серия наград */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">🔥 Серия наград</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Текущая серия</div>
                <div className="text-2xl font-bold text-orange-400">
                  {stats.current_streak} дн.
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">Лучшая серия</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {stats.max_streak} дн.
                </div>
              </div>
            </div>
          </div>

          {/* Достижения */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">🏆 Достижения</h3>
            {stats.achievements_count > 0 ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-2">🏆</div>
                <div className="text-white font-semibold">
                  {stats.achievements_count} достижений
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Продолжайте играть, чтобы разблокировать больше!
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-2 opacity-30">🔒</div>
                <p className="text-gray-400">
                  Достижения скоро появятся...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
