/** Компонент карточки апгрейда */

import React from 'react';
import { formatCoins } from '../utils/formatting';
import type { Upgrade } from '../types';

interface UpgradeCardProps {
  upgrade: Upgrade;
  onPurchase: (upgradeType: string) => void;
  userCoins: number;
  disabled?: boolean;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  upgrade,
  onPurchase,
  userCoins,
  disabled = false,
}) => {
  const canAfford = upgrade.current_price ? userCoins >= upgrade.current_price : false;
  const isMaxed = upgrade.level >= (upgrade.max_level || 50);

  const handleClick = () => {
    if (!disabled && canAfford && !isMaxed && upgrade.current_price) {
      onPurchase(upgrade.upgrade_type);
    }
  };

  return (
    <div
      className={`
        bg-dark-card border border-dark-border rounded-xl p-4
        transition-all duration-200 hover:border-primary-500
        ${canAfford && !isMaxed ? 'cursor-pointer hover:shadow-lg' : 'opacity-60'}
        ${disabled ? 'pointer-events-none' : ''}
      `}
    >
      {/* Заголовок */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{upgrade.icon}</div>
          <div>
            <h3 className="font-semibold text-white">{upgrade.name}</h3>
            <p className="text-sm text-gray-400">{upgrade.description}</p>
          </div>
        </div>
        <div className="bg-dark-bg px-3 py-1 rounded-full">
          <span className="text-primary-400 font-bold">
            Ур. {upgrade.level}/{upgrade.max_level}
          </span>
        </div>
      </div>

      {/* Прогресс бар */}
      <div className="mb-3">
        <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300"
            style={{
              width: `${(upgrade.level / (upgrade.max_level || 50)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-dark-bg rounded-lg p-2">
          <div className="text-xs text-gray-400">Текущее значение</div>
          <div className="text-sm font-semibold text-white">
            {upgrade.current_value?.toFixed(2) || 0}
          </div>
        </div>
        <div className="bg-dark-bg rounded-lg p-2">
          <div className="text-xs text-gray-400">Всего покупок</div>
          <div className="text-sm font-semibold text-white">
            {upgrade.purchase_count}
          </div>
        </div>
      </div>

      {/* Кнопка покупки */}
      {isMaxed ? (
        <button
          disabled
          className="w-full py-3 rounded-lg bg-gray-600 text-white font-semibold cursor-not-allowed"
        >
          МАКСИМУМ
        </button>
      ) : (
        <button
          onClick={handleClick}
          disabled={!canAfford || disabled}
          className={`
            w-full py-3 rounded-lg font-semibold transition-all duration-200
            ${canAfford && !disabled
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white transform hover:scale-[1.02]'
              : 'bg-dark-bg text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {upgrade.current_price ? formatCoins(upgrade.current_price) : '---'} 💰
        </button>
      )}
    </div>
  );
};
