"""Сервис наград."""

from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import User, DailyReward, UserLog
from schemas.game import DailyRewardSchema, DailyRewardResponse
from core.config import get_settings

settings = get_settings()


class RewardService:
    """Сервис наград."""
    
    @staticmethod
    async def get_or_create_daily_reward(
        user_id: int,
        db: AsyncSession
    ) -> DailyReward:
        """
        Получить или создать запись ежедневной награды.
        
        Args:
            user_id: ID пользователя
            db: Сессия базы данных
            
        Returns:
            DailyReward
        """
        result = await db.execute(
            select(DailyReward).where(DailyReward.user_id == user_id)
        )
        daily_reward = result.scalar_one_or_none()
        
        if not daily_reward:
            daily_reward = DailyReward(
                user_id=user_id,
                current_streak=0,
                max_streak=0,
                total_rewards_claimed=0,
            )
            db.add(daily_reward)
            await db.commit()
            await db.refresh(daily_reward)
        
        return daily_reward
    
    @staticmethod
    def calculate_reward_amount(streak: int) -> int:
        """
        Рассчитать количество монет за награду.
        
        Args:
            streak: Текущая серия дней
            
        Returns:
            Количество монет
        """
        base_reward = settings.DAILY_REWARD_BASE
        streak_bonus = settings.DAILY_REWARD_STREAK_BONUS * min(
            streak,
            settings.MAX_STREAK_DAYS
        )
        
        return base_reward + streak_bonus
    
    @staticmethod
    async def get_daily_reward_info(
        user_id: int,
        db: AsyncSession
    ) -> DailyRewardSchema:
        """
        Получить информацию о ежедневной награде.
        
        Args:
            user_id: ID пользователя
            db: Сессия базы данных
            
        Returns:
            DailyRewardSchema
        """
        daily_reward = await RewardService.get_or_create_daily_reward(
            user_id,
            db
        )
        
        schema = DailyRewardSchema.model_validate(daily_reward)
        
        # Проверка доступности
        now = datetime.utcnow()
        
        if not daily_reward.next_claim_available_at:
            schema.available = True
        else:
            schema.available = now >= daily_reward.next_claim_available_at
        
        # Расчёт времени до следующей награды
        if daily_reward.next_claim_available_at:
            delta = daily_reward.next_claim_available_at - now
            schema.next_claim_in_seconds = max(0, int(delta.total_seconds()))
        else:
            schema.next_claim_in_seconds = 0
        
        # Расчёт размера награды
        expected_streak = daily_reward.current_streak
        if schema.available and daily_reward.last_claim_date:
            # Проверка, нужно ли сбросить серию
            last_claim = daily_reward.last_claim_date.replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            today = now.replace(hour=0, minute=0, second=0, microsecond=0)
            
            if (today - last_claim).days > 1:
                expected_streak = 0
        
        schema.reward_amount = RewardService.calculate_reward_amount(expected_streak)
        
        return schema
    
    @staticmethod
    async def claim_daily_reward(
        user: User,
        db: AsyncSession,
        ip_address: Optional[str] = None
    ) -> DailyRewardResponse:
        """
        Получить ежедневную награду.
        
        Args:
            user: Пользователь
            db: Сессия базы данных
            ip_address: IP адрес клиента
            
        Returns:
            DailyRewardResponse
        """
        daily_reward = await RewardService.get_or_create_daily_reward(
            user.id,
            db
        )
        
        now = datetime.utcnow()
        
        # Проверка доступности
        if daily_reward.next_claim_available_at and now < daily_reward.next_claim_available_at:
            delta = daily_reward.next_claim_available_at - now
            hours = int(delta.total_seconds() // 3600)
            minutes = int((delta.total_seconds() % 3600) // 60)
            
            return DailyRewardResponse(
                coins_earned=0,
                streak=daily_reward.current_streak,
                next_claim_at=daily_reward.next_claim_available_at,
                max_streak=daily_reward.max_streak,
                message=f"Награда будет доступна через {hours}ч {minutes}мин",
            )
        
        # Проверка серии
        if daily_reward.last_claim_date:
            last_claim = daily_reward.last_claim_date.replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            today = now.replace(hour=0, minute=0, second=0, microsecond=0)
            
            days_diff = (today - last_claim).days
            
            if days_diff == 0:
                # Уже получена сегодня
                return DailyRewardResponse(
                    coins_earned=0,
                    streak=daily_reward.current_streak,
                    next_claim_at=daily_reward.next_claim_available_at,
                    max_streak=daily_reward.max_streak,
                    message="Награда уже получена сегодня",
                )
            elif days_diff > 1:
                # Серия сброшена
                daily_reward.current_streak = 0
            # days_diff == 1 - серия продолжается
        else:
            # Первая награда
            daily_reward.current_streak = 0
        
        # Увеличение серии
        daily_reward.current_streak += 1
        
        if daily_reward.current_streak > daily_reward.max_streak:
            daily_reward.max_streak = daily_reward.current_streak
        
        # Расчёт награды
        reward_amount = RewardService.calculate_reward_amount(
            daily_reward.current_streak
        )
        
        # Обновление данных
        daily_reward.last_claim_date = now
        daily_reward.total_rewards_claimed += 1
        daily_reward.next_claim_available_at = now + timedelta(days=1)
        daily_reward.updated_at = now
        
        # Начисление монет
        user.coins += reward_amount
        user.total_coins_earned += reward_amount
        user.last_activity = now
        
        # Обновление состояния игры
        from services.game_service import GameService
        game_state = await GameService.get_or_create_game_state(user.id, db)
        game_state.coins = user.coins
        game_state.updated_at = now
        
        # Логирование
        log = UserLog(
            user_id=user.id,
            action_type="reward",
            action_details=f"Daily reward claimed: {reward_amount} coins, streak: {daily_reward.current_streak}",
            ip_address=ip_address,
        )
        db.add(log)
        
        await db.commit()
        await db.refresh(daily_reward)
        
        return DailyRewardResponse(
            coins_earned=reward_amount,
            streak=daily_reward.current_streak,
            next_claim_at=daily_reward.next_claim_available_at,
            max_streak=daily_reward.max_streak,
            message=f"Получено {reward_amount} монет! Серия: {daily_reward.current_streak} дней",
        )
