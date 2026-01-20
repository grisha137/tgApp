/** Компонент баннера ежедневной награды */

import React, { useState, useEffect } from 'react';
import { formatTime, formatCoins } from '../utils/formatting';
import type { DailyReward } from '../types';

interface DailyRewardBannerProps {
  dailyReward: DailyReward;
  onClaim: () => void;
  disabled?: boolean;
}

export const DailyRewardBanner: React.FC<DailyRewardBannerProps> = ({
  dailyReward,
  onClaim,
  disabled = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(dailyReward.next_claim_in_seconds || 0);

  useEffect(() => {
    if (!dailyReward.available && dailyReward.next_claim_in_seconds) {
      const interval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [dailyReward.available, dailyReward.next_claim_in_seconds]);

  if (dailyReward.available) {
    return (
      <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl p-4 shadow-lg animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎁</div>
            <div>
              <h3 className="text-white font-bold text-lg">
                Ежедневная награда!
              </h3>
              <p className="text-secondary-100">
                {dailyReward.reward_amount ? formatCoins(dailyReward.reward_amount) : '---'} монет
                {dailyReward.current_streak > 0 && (
                  <span className="ml-2 text-yellow-300">
                    🔥 Серия: {dailyReward.current_streak} дн.
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClaim}
            disabled={disabled}
            className={`
              px-6 py-3 rounded-lg font-bold text-white
              transition-all duration-200 transform hover:scale-105
              ${disabled
                ? 'bg-secondary-800 cursor-not-allowed opacity-50'
                : 'bg-white text-secondary-600 hover:bg-secondary-50 shadow-lg'
              }
            `}
          >
            ЗАБРАТЬ!
          </button>
        </div>

        {/* Прогресс серии */}
        {dailyReward.current_streak > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-secondary-200 mb-1">
              <span>Текущая серия: {dailyReward.current_streak} дней</span>
              <span>Максимум: {dailyReward.max_streak} дней</span>
            </div>
            <div className="h-1.5 bg-secondary-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{
                  width: `${Math.min((dailyReward.current_streak / 30) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl opacity-50">📦</div>
          <div>
            <h3 className="text-gray-400 font-bold">
              Следующая награда через:
            </h3>
            <p className="text-primary-400 text-lg font-mono">
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Серия</div>
          <div className="text-white font-bold">
            {dailyReward.current_streak} дн.
          </div>
        </div>
      </div>
    </div>
  );
};
