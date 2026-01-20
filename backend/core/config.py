"""Конфигурация приложения."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Настройки приложения."""
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./tg_game.db"
    
    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_WEBHOOK_SECRET: str = ""
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 дней
    
    # Rate limiting
    MAX_REQUESTS_PER_HOUR: int = 1000
    MAX_CLICKS_PER_10_SECONDS: int = 100
    MAX_UPGRADES_PER_2_SECONDS: int = 1
    
    # Game balance
    CLICK_DAMAGE_BASE_PRICE: int = 100
    PASSIVE_INCOME_BASE_PRICE: int = 1000
    MAX_UPGRADE_LEVEL: int = 50
    OFFLINE_INCOME_MAX_HOURS: int = 8
    
    # Daily reward
    DAILY_REWARD_BASE: int = 500
    DAILY_REWARD_STREAK_BONUS: int = 100
    MAX_STREAK_DAYS: int = 30
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Получить настройки приложения (singleton)."""
    return Settings()
