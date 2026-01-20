/** Страница апгрейдов */

import React from 'react';
import { UpgradeCard } from '../components/UpgradeCard';
import { useGameState } from '../hooks/useGameState';
import type { GameState } from '../types';

interface UpgradesPageProps {
  gameState: GameState | null;
  onPurchaseUpgrade: (upgradeType: string) => Promise<void>;
}

export const UpgradesPage: React.FC<UpgradesPageProps> = ({
  gameState,
  onPurchaseUpgrade,
}) => {
  return (
    <div className="pb-24 animate-slide-up">
      {/* Заголовок */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-2">⚡ Апгрейды</h1>
        <p className="text-gray-400">
          Улучшайте свои навыки для большего дохода!
        </p>
      </div>

      {/* Баланс */}
      {gameState && (
        <div className="mx-4 mb-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-yellow-400 font-semibold">Ваш баланс:</span>
            <span className="text-2xl font-bold text-white">
              {gameState.coins.toLocaleString('ru-RU')} 💰
            </span>
          </div>
        </div>
      )}

      {/* Список апгрейдов */}
      <div className="p-4 space-y-4">
        {gameState?.upgrades && gameState.upgrades.length > 0 ? (
          gameState.upgrades.map((upgrade) => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              onPurchase={onPurchaseUpgrade}
              userCoins={gameState.coins}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-400">Загрузка апгрейдов...</p>
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="p-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <h3 className="text-white font-semibold mb-2">📈 Прогрессия цен</h3>
          <p className="text-gray-400 text-sm mb-2">
            Цена каждого следующего уровня увеличивается на 15%
          </p>
          <div className="bg-dark-bg rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Формула:</div>
            <div className="text-primary-400 font-mono text-sm">
              цена = базовая_цена × (1.15^уровень)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
