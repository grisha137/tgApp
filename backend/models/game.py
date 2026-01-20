"""Модели игровой механики."""

from datetime import datetime
from sqlalchemy import Column, Integer, BigInteger, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class GameState(Base):
    """Состояние игры пользователя."""
    
    __tablename__ = "game_states"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    coins = Column(BigInteger, default=0, nullable=False)
    passive_income_per_sec = Column(Float, default=0.0, nullable=False)
    
    click_damage_level = Column(Integer, default=1, nullable=False)
    passive_income_level = Column(Integer, default=0, nullable=False)
    
    last_click_time = Column(DateTime, nullable=True)
    last_offline_calculation = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    total_play_time_seconds = Column(Integer, default=0, nullable=False)
    total_clicks = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Связь
    user = relationship("User", back_populates="game_state")


class OfflineIncome(Base):
    """Записи о расчёте оффлайн-дохода."""
    
    __tablename__ = "offline_incomes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    offline_duration_seconds = Column(Integer, nullable=False)
    coins_earned = Column(BigInteger, default=0, nullable=False)
    
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Связь
    user = relationship("User", back_populates="offline_incomes")
