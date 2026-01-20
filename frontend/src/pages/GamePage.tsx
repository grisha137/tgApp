/** Главная страница игры */

import React, { useEffect } from 'react';
import { ClickButton } from '../components/ClickButton';
import { DailyRewardBanner } from '../components/DailyRewardBanner';
import { useGameState } from '../hooks/useGameState';
import { formatCoins } from '../utils/formatting';
import type { GameState } from '../types';

interface GamePageProps {
  gameState: GameState | null;
  onClick: (count: number, event: React.MouseEvent) => Promise<void>;
  claimDailyReward: () => Promise<void>;
}

export const GamePage: React.FC<GamePageProps> = ({
  gameState,
  onClick,
  claimDailyReward,
}) => {
  const clickDamage = gameState
    ? 1 * Math.pow(1.5, gameState.click_damage_level - 1)
    : 1;

  return (
    <div className="pb-24 animate-slide-up">
      {/* Баннер ежедневной награды */}
      {gameState && (
        <div className="p-4">
          <DailyRewardBanner
            dailyReward={gameState.daily_reward}
            onClaim={claimDailyReward}
          />
        </div>
      )}

      {/* Оффлайн доход */}
      {gameState && gameState.last_offline_income > 0 && (
        <div className="mx-4 mb-4 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💤</span>
            <div>
              <p className="text-green-400 font-bold">
                Оффлайн доход: +{formatCoins(gameState.last_offline_income)}
              </p>
              <p className="text-green-300/70 text-sm">
                Вы зарабатывали, пока вас не было!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Статистика */}
      {gameState && (
        <div className="grid grid-cols-2 gap-3 px-4 mb-6">
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Баланс</div>
            <div className="text-xl font-bold text-white">
              {formatCoins(gameState.coins)} 💰
            </div>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Пассивный доход</div>
            <div className="text-xl font-bold text-primary-400">
              {gameState.passive_income_per_sec.toFixed(2)}/сек
            </div>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Всего кликов</div>
            <div className="text-xl font-bold text-white">
              {formatCoins(gameState.total_clicks)}
            </div>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Сила клика</div>
            <div className="text-xl font-bold text-secondary-400">
              +{clickDamage.toFixed(1)}
            </div>
          </div>
        </div>
      )}

      {/* Кнопка клика */}
      <div className="flex items-center justify-center py-8">
        <ClickButton
          onClick={onClick}
          clickDamage={clickDamage}
          disabled={!gameState}
        />
      </div>

      {/* Подсказки */}
      <div className="px-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <h3 className="text-white font-semibold mb-2">💡 Советы</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Кликайте на кнопку, чтобы зарабатывать монеты</li>
            <li>• Покупайте апгрейды для увеличения дохода</li>
            <li>• Не забывайте забирать ежедневную награду</li>
            <li>• Игра продолжает зарабатывать даже офлайн!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
