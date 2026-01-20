"""Pydantic схемы для игровых данных."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from core.constants import UpgradeType


# User schemas
class UserSchema(BaseModel):
    """Схема пользователя."""
    
    id: int
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    language_code: Optional[str] = None
    coins: int
    total_clicks: int
    total_coins_earned: int
    created_at: datetime
    last_login: datetime
    
    class Config:
        from_attributes = True


# Auth schemas
class TelegramAuthRequest(BaseModel):
    """Запрос авторизации через Telegram."""
    
    initData: str = Field(..., description="Telegram initData")


class AuthResponse(BaseModel):
    """Ответ авторизации."""
    
    access_token: str
    user: UserSchema


# Game state schemas
class GameStateSchema(BaseModel):
    """Схема состояния игры."""
    
    coins: int
    passive_income_per_sec: float
    click_damage_level: int
    passive_income_level: int
    total_play_time_seconds: int
    total_clicks: int
    last_offline_calculation: datetime
    
    class Config:
        from_attributes = True


class UpgradeSchema(BaseModel):
    """Схема апгрейда."""
    
    id: int
    upgrade_type: str
    level: int
    purchase_count: int
    total_spent: int
    
    # Динамические поля
    current_price: Optional[int] = None
    current_value: Optional[float] = None
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    max_level: Optional[int] = None
    
    class Config:
        from_attributes = True


class DailyRewardSchema(BaseModel):
    """Схема ежедневной награды."""
    
    id: int
    last_claim_date: Optional[datetime] = None
    current_streak: int
    max_streak: int
    total_rewards_claimed: int
    next_claim_available_at: Optional[datetime] = None
    
    # Динамические поля
    available: bool = False
    next_claim_in_seconds: Optional[int] = None
    reward_amount: Optional[int] = None
    
    class Config:
        from_attributes = True


# Click schemas
class ClickRequest(BaseModel):
    """Запрос клика."""
    
    count: int = Field(default=1, ge=1, le=10, description="Количество кликов")


class ClickResponse(BaseModel):
    """Ответ клика."""
    
    coins: int
    coins_gained: int
    passive_income: float
    click_damage: float
    total_clicks: int


# Upgrade schemas
class UpgradeRequest(BaseModel):
    """Запрос покупки апгрейда."""
    
    upgrade_type: str = Field(..., description="Тип апгрейда")


class UpgradeResponse(BaseModel):
    """Ответ покупки апгрейда."""
    
    success: bool
    new_coins: int
    upgrade: UpgradeSchema
    message: Optional[str] = None


# Daily reward schemas
class DailyRewardResponse(BaseModel):
    """Ответ получения ежедневной награды."""
    
    coins_earned: int
    streak: int
    next_claim_at: datetime
    max_streak: int
    message: Optional[str] = None


# Stats schemas
class UserStatsSchema(BaseModel):
    """Статистика пользователя."""
    
    rank: Optional[int] = None
    total_coins: int
    total_clicks: int
    play_time_hours: float
    achievements_count: int
    
    # Дополнительная статистика
    click_damage_level: int
    passive_income_level: int
    passive_income_per_sec: float
    current_streak: int
    max_streak: int
    total_upgrades_purchased: int


# Full state schema
class GameFullStateSchema(BaseModel):
    """Полное состояние игры."""
    
    user: UserSchema
    game_state: GameStateSchema
    upgrades: List[UpgradeSchema]
    daily_reward: DailyRewardSchema
    last_offline_income: int = 0


# Error schemas
class ErrorSchema(BaseModel):
    """Схема ошибки."""
    
    detail: str
