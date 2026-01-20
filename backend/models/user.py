"""Модели пользователя."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, BigInteger, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    """Модель пользователя."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, unique=True, index=True, nullable=False)
    username = Column(String(100), nullable=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    language_code = Column(String(10), nullable=True)
    
    coins = Column(Integer, default=0, nullable=False)
    total_clicks = Column(Integer, default=0, nullable=False)
    total_coins_earned = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_activity = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Связи
    game_state = relationship("GameState", back_populates="user", uselist=False)
    upgrades = relationship("Upgrade", back_populates="user")
    daily_reward = relationship("DailyReward", back_populates="user", uselist=False)
    logs = relationship("UserLog", back_populates="user")
    offline_incomes = relationship("OfflineIncome", back_populates="user")


class UserLog(Base):
    """Лог действий пользователя."""
    
    __tablename__ = "user_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    action_type = Column(String(50), nullable=False)  # click, upgrade, reward, auth
    action_details = Column(Text, nullable=True)
    
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Связь
    user = relationship("User", back_populates="logs")
