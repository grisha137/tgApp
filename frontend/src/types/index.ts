/** Типы приложения */

export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  coins: number;
  total_clicks: number;
  total_coins_earned: number;
  created_at: string;
  last_login: string;
}

export interface GameState {
  coins: number;
  passive_income_per_sec: number;
  click_damage_level: number;
  passive_income_level: number;
  total_play_time_seconds: number;
  total_clicks: number;
  last_offline_calculation: string;
}

export interface Upgrade {
  id: number;
  upgrade_type: string;
  level: number;
  purchase_count: number;
  total_spent: number;
  current_price?: number;
  current_value?: number;
  name?: string;
  description?: string;
  icon?: string;
  max_level?: number;
}

export interface DailyReward {
  id: number;
  last_claim_date?: string;
  current_streak: number;
  max_streak: number;
  total_rewards_claimed: number;
  next_claim_available_at?: string;
  available: boolean;
  next_claim_in_seconds?: number;
  reward_amount?: number;
}

export interface GameFullState {
  user: User;
  game_state: GameState;
  upgrades: Upgrade[];
  daily_reward: DailyReward;
  last_offline_income: number;
}

export interface ClickResponse {
  coins: number;
  coins_gained: number;
  passive_income: number;
  click_damage: number;
  total_clicks: number;
}

export interface UpgradeResponse {
  success: boolean;
  new_coins: number;
  upgrade: Upgrade;
  message?: string;
}

export interface DailyRewardResponse {
  coins_earned: number;
  streak: number;
  next_claim_at: string;
  max_streak: number;
  message?: string;
}

export interface UserStats {
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

export type TabType = 'game' | 'upgrades' | 'stats' | 'profile';
