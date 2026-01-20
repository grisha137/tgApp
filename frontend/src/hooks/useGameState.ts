/** Хук для управления состоянием игры */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameFullState, ClickResponse } from '../types';
import api from '../services/api';
import { createParticles, showToast } from '../utils/animations';
import { hapticImpact } from '../services/telegram';

interface UseGameStateReturn {
  gameState: GameFullState | null;
  loading: boolean;
  error: string | null;
  fetchGameState: () => Promise<void>;
  handleClick: (count: number, event: React.MouseEvent) => Promise<void>;
  purchaseUpgrade: (upgradeType: string) => Promise<void>;
  claimDailyReward: () => Promise<void>;
}

export const useGameState = (): UseGameStateReturn => {
  const [gameState, setGameState] = useState<GameFullState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const clickTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchGameState();
    
    // Периодическое обновление состояния
    const interval = setInterval(() => {
      if (gameState) {
        fetchGameState();
      }
    }, 30000); // Каждые 30 секунд
    
    return () => {
      clearInterval(interval);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const fetchGameState = useCallback(async () => {
    try {
      setLoading(true);
      const state = await api.getGameState();
      setGameState(state);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить состояние игры');
      console.error('Error fetching game state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClick = useCallback(async (count: number, event: React.MouseEvent) => {
    if (!gameState) return;

    try {
      const response: ClickResponse = await api.click(count);
      
      // Создание анимации частиц
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      createParticles(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        count,
        `+${response.coins_gained}`
      );
      
      // Вибрация
      hapticImpact('light');
      
      // Обновление состояния
      setGameState(prev => prev ? {
        ...prev,
        user: {
          ...prev.user,
          coins: response.coins,
          total_clicks: response.total_clicks,
        },
        game_state: {
          ...prev.game_state,
          coins: response.coins,
          total_clicks: response.total_clicks,
        },
      } : null);
    } catch (err) {
      showToast('Ошибка при клике', 'error');
      console.error('Error clicking:', err);
    }
  }, [gameState]);

  const purchaseUpgrade = useCallback(async (upgradeType: string) => {
    if (!gameState) return;

    try {
      const response = await api.purchaseUpgrade(upgradeType);
      
      if (response.success) {
        showToast(response.message || 'Апгрейд успешно куплен!', 'success');
        hapticNotification('success');
        
        // Обновление состояния
        await fetchGameState();
      } else {
        showToast(response.message || 'Не удалось купить апгрейд', 'error');
        hapticNotification('error');
      }
    } catch (err) {
      showToast('Ошибка при покупке апгрейда', 'error');
      console.error('Error purchasing upgrade:', err);
    }
  }, [gameState, fetchGameState]);

  const claimDailyReward = useCallback(async () => {
    try {
      const response = await api.claimDailyReward();
      
      if (response.coins_earned > 0) {
        showToast(`Получено ${response.coins_earned} монет!`, 'success');
        hapticNotification('success');
        
        // Обновление состояния
        await fetchGameState();
      } else {
        showToast(response.message || 'Награда недоступна', 'error');
        hapticNotification('error');
      }
    } catch (err) {
      showToast('Ошибка при получении награды', 'error');
      console.error('Error claiming reward:', err);
    }
  }, [fetchGameState]);

  return {
    gameState,
    loading,
    error,
    fetchGameState,
    handleClick,
    purchaseUpgrade,
    claimDailyReward,
  };
};
