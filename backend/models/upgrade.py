"""Модели апгрейдов и наград."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from core.constants import UpgradeType
from database import Base


class Upgrade(Base):
    """Апгрейды пользователя."""
    
    __tablename__ = "upgrades"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    upgrade_type = Column(String(50), nullable=False)  # UpgradeType enum
    level = Column(Integer, default=0, nullable=False)
    
    purchase_count = Column(Integer, default=0, nullable=False)
    total_spent = Column(BigInteger, default=0, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Связь
    user = relationship("User", back_populates="upgrades")


class DailyReward(Base):
    """Ежедневная награда."""
    
    __tablename__ = "daily_rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    last_claim_date = Column(DateTime, nullable=True)
    current_streak = Column(Integer, default=0, nullable=False)
    max_streak = Column(Integer, default=0, nullable=False)
    total_rewards_claimed = Column(Integer, default=0, nullable=False)
    
    next_claim_available_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Связь
    user = relationship("User", back_populates="daily_reward")
