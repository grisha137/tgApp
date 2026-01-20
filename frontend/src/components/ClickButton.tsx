/** Компонент кнопки клика */

import React, { useState } from 'react';
import { formatCoins } from '../utils/formatting';
import { useGameState } from '../hooks/useGameState';

interface ClickButtonProps {
  onClick: (count: number, event: React.MouseEvent) => Promise<void>;
  clickDamage: number;
  disabled?: boolean;
}

export const ClickButton: React.FC<ClickButtonProps> = ({
  onClick,
  clickDamage,
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [combo, setCombo] = useState(0);
  const comboTimeoutRef = React.useRef<NodeJS.Timeout>();

  const handleClick = (event: React.MouseEvent) => {
    if (disabled) return;

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);

    // Увеличение комбо
    setCombo(prev => prev + 1);
    
    // Сброс комбо через 0.5 секунды
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }
    comboTimeoutRef.current = setTimeout(() => {
      setCombo(0);
    }, 500);

    // Клик
    onClick(1, event);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Индикатор комбо */}
      {combo > 1 && (
        <div className="text-yellow-400 font-bold text-xl animate-bounce">
          Combo x{combo}!
        </div>
      )}
      
      {/* Кнопка клика */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          relative w-64 h-64 rounded-full shadow-2xl 
          transition-all duration-100 transform
          ${isPressed ? 'scale-95' : 'scale-100'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${combo > 5 ? 'animate-glow' : ''}
        `}
        style={{
          background: 'linear-gradient(145deg, #0ea5e9, #0284c7)',
          boxShadow: isPressed
            ? '0 0 0 rgba(0,0,0,0)'
            : '0 10px 30px rgba(14, 165, 233, 0.5), inset 0 2px 10px rgba(255,255,255,0.2)',
        }}
      >
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <span className="text-6xl font-bold text-white drop-shadow-lg">
            💰
          </span>
          <span className="text-white font-bold mt-2 text-lg drop-shadow">
            КЛИКНИ!
          </span>
          <span className="text-blue-100 text-sm mt-1">
            +{clickDamage.toFixed(1)} за клик
          </span>
        </div>
      </button>

      {/* Подсказка */}
      <p className="text-gray-400 text-sm text-center">
        Кликайте, чтобы зарабатывать монеты!
      </p>
    </div>
  );
};
