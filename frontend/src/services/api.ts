/** API клиент */

import axios, { AxiosError } from 'axios';
import type {
  GameFullState,
  ClickResponse,
  UpgradeResponse,
  DailyRewardResponse,
  UserStats,
  User,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для добавления токена
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Токен истёк - перенаправление на логин
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  async authenticate(initData: string): Promise<{ access_token: string; user: User }> {
    const response = await apiClient.post('/auth/telegram', { initData });
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Game
  async getGameState(): Promise<GameFullState> {
    const response = await apiClient.get('/game/state');
    return response.data;
  },

  async click(count: number = 1): Promise<ClickResponse> {
    const response = await apiClient.post('/game/click', { count });
    return response.data;
  },

  // Upgrades
  async purchaseUpgrade(upgradeType: string): Promise<UpgradeResponse> {
    const response = await apiClient.post('/upgrades/purchase', { upgrade_type: upgradeType });
    return response.data;
  },

  // Rewards
  async claimDailyReward(): Promise<DailyRewardResponse> {
    const response = await apiClient.post('/rewards/daily');
    return response.data;
  },

  // Stats
  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get('/users/stats');
    return response.data;
  },
};

export default api;
